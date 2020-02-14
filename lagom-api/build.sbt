organization in ThisBuild := "br.ufc.insightlab"
version in ThisBuild := "1.0-SNAPSHOT"

// the Scala version that will be used for cross-compiled libraries
scalaVersion in ThisBuild := "2.12.7"

/** Libraries */
val reactiveMongo = "org.reactivemongo" % "play2-reactivemongo_2.12" % "0.18.7-play26"
val akkaQuartzScheduler = "com.enragedginger" %% "akka-quartz-scheduler" % "1.8.2-akka-2.6.x"
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
  .enablePlugins(LagomScala)
  .settings(
    libraryDependencies ++= Seq(
      lagomScaladslPersistenceCassandra,
      lagomScaladslKafkaBroker,
      filters,
      akkaQuartzScheduler,
      macwire,
      reactiveMongo
    )
  )
  .dependsOn(`spbus-api`)

lagomUnmanagedServices in ThisBuild := Map(
  "bmap-client" -> "http://dadosabertos.rio.rj.gov.br/apiTransporte/apresentacao/rest/index.cfm",
  "spbus-client" -> "http://api.olhovivo.sptrans.com.br/v2.1"
)

lazy val `bmap` = (project in file("."))
  .aggregate(`bmap-api`, `bmap-impl`, `bmap-stream-api`, `bmap-stream-impl`)

lazy val `bmap-api` = (project in file("bmap-api"))
  .settings(
    libraryDependencies ++= Seq(
      lagomScaladslApi
    )
  )

lazy val `bmap-impl` = (project in file("bmap-impl"))
  .enablePlugins(LagomScala)
  .settings(
    libraryDependencies ++= Seq(
      lagomScaladslPersistenceCassandra,
      lagomScaladslKafkaBroker,
      macwire
    )
  )
  .settings(lagomForkedTestSettings)
  .dependsOn(`bmap-api`)
val macwire = "com.softwaremill.macwire" %% "macros" % "2.3.3" % "provided"

lazy val `bmap-stream-api` = (project in file("bmap-stream-api"))
  .settings(
    libraryDependencies ++= Seq(
      lagomScaladslApi
    )
  ).dependsOn(`bmap-api`)

lazy val `bmap-stream-impl` = (project in file("bmap-stream-impl"))
  .enablePlugins(LagomScala)
  .settings(
    libraryDependencies ++= Seq(
      macwire
    )
  )
  .dependsOn(`bmap-stream-api`, `bmap-api`)
