import com.typesafe.sbt.SbtNativePackager.autoImport.packageName

organization in ThisBuild := "br.ufc.insightlab"
version in ThisBuild := "1.0-SNAPSHOT"

// the Scala version that will be used for cross-compiled libraries
scalaVersion in ThisBuild := "2.12.7"

/** Libraries */
val reactiveMongo = "org.reactivemongo" % "play2-reactivemongo_2.12" % "0.18.7-play26"
val akkaQuartzScheduler = "com.enragedginger" %% "akka-quartz-scheduler" % "1.8.2-akka-2.6.x"
val macwire = "com.softwaremill.macwire" %% "macros" % "2.3.3" % "provided"
val akkaDiscovery = "com.lightbend.lagom" %% "lagom-scaladsl-akka-discovery-service-locator" % "1.0.0"

envFileName in ThisBuild := s".env"

val akkaVersion = "2.6.3"

dependencyOverrides ++= Seq(
  "com.typesafe.akka" %% "akka-actor"                  % akkaVersion,
  "com.typesafe.akka" %% "akka-actor-typed"            % akkaVersion,
  "com.typesafe.akka" %% "akka-coordination"           % akkaVersion,
  "com.typesafe.akka" %% "akka-remote"                 % akkaVersion,
  "com.typesafe.akka" %% "akka-cluster"                % akkaVersion,
  "com.typesafe.akka" %% "akka-cluster-sharding"       % akkaVersion,
  "com.typesafe.akka" %% "akka-cluster-sharding-typed" % akkaVersion,
  "com.typesafe.akka" %% "akka-cluster-tools"          % akkaVersion,
  "com.typesafe.akka" %% "akka-cluster-typed"          % akkaVersion,
  "com.typesafe.akka" %% "akka-coordination"           % akkaVersion,
  "com.typesafe.akka" %% "akka-discovery"              % akkaVersion,
  "com.typesafe.akka" %% "akka-distributed-data"       % akkaVersion,
  "com.typesafe.akka" %% "akka-serialization-jackson"  % akkaVersion,
  "com.typesafe.akka" %% "akka-persistence"            % akkaVersion,
  "com.typesafe.akka" %% "akka-persistence-query"      % akkaVersion,
  "com.typesafe.akka" %% "akka-slf4j"                  % akkaVersion,
  "com.typesafe.akka" %% "akka-stream"                 % akkaVersion,
  "com.typesafe.akka" %% "akka-protobuf-v3"            % akkaVersion,
  "com.typesafe.akka" %% "akka-actor-typed"            % akkaVersion,
  "com.typesafe.akka" %% "akka-persistence-typed"      % akkaVersion,
  "com.typesafe.akka" %% "akka-multi-node-testkit"     % akkaVersion % Test,
  "com.typesafe.akka" %% "akka-testkit"                % akkaVersion % Test,
  "com.typesafe.akka" %% "akka-stream-testkit"         % akkaVersion % Test,
  "com.typesafe.akka" %% "akka-actor-testkit-typed"    % akkaVersion % Test
)

lagomUnmanagedServices in ThisBuild := Map(
  "spbus-client" -> "http://api.olhovivo.sptrans.com.br"
)

lazy val `spbus` = (project in file("."))
  .aggregate(`spbus-api`, `spbus-impl`)
lazy val `spbus-api` = (project in file("spbus-api"))
  .settings(
    libraryDependencies ++= Seq(
      lagomScaladslApi,
      lagomScaladslPubSub
    )
  )

lazy val `spbus-impl` = (project in file("spbus-impl"))
  .enablePlugins(LagomScala, JavaAppPackaging, DockerPlugin)
  .settings(
    dockerExposedPorts ++= Seq(9000, 9001),
    libraryDependencies ++= Seq(
      lagomScaladslPersistenceCassandra,
      lagomScaladslKafkaBroker,
      filters,
      akkaQuartzScheduler,
      macwire,
      reactiveMongo,
      akkaDiscovery
    )
  )
  .dependsOn(`spbus-api`)