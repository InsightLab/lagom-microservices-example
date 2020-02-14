package br.ufc.insightlab.spbus.impl

import br.ufc.insightlab.spbus.api.{SPBusClientService, SPBusService}
import br.ufc.insightlab.spbus.repository.api._
import br.ufc.insightlab.spbus.repository.impl._
import br.ufc.insightlab.spbus.repository.impl.utils.MongoDbComponents
import com.lightbend.lagom.scaladsl.api.ServiceLocator
import com.lightbend.lagom.scaladsl.api.ServiceLocator.NoServiceLocator
import com.lightbend.lagom.scaladsl.devmode.LagomDevModeComponents
import com.lightbend.lagom.scaladsl.pubsub.PubSubComponents
import com.lightbend.lagom.scaladsl.server._
import com.softwaremill.macwire._
import play.api.libs.ws.ahc.AhcWSComponents
import play.api.mvc.EssentialFilter
import play.filters.cors.CORSComponents

import scala.concurrent.Future

class SPBusLoader extends LagomApplicationLoader {
  override def load(context: LagomApplicationContext): LagomApplication =
    new SPBusApplication(context) {
      override def serviceLocator: ServiceLocator = NoServiceLocator
    }

  override def loadDevMode(context: LagomApplicationContext): LagomApplication =
    new SPBusApplication(context) with LagomDevModeComponents

  override def describeService = Some(readDescriptor[SPBusService])
}

abstract class SPBusApplication(context: LagomApplicationContext)
  extends LagomApplication(context)
    with MongoDbComponents
    with PubSubComponents
    with CORSComponents
    with AhcWSComponents {
  override val httpFilters: Seq[EssentialFilter] = Seq(corsFilter)

  // Bind the service that this server provides
  override lazy val lagomServer: LagomServer = serverFor[SPBusService](wire[SPBusServiceImpl])

  applicationLifecycle.addStopHook { () =>
    Future.successful(busLineManager.stopProducing())
  }

  lazy val stopsRepository: StopsRepository = wire[StopsRepositoryMongoDB]
  lazy val tripsRepository: TripsRepository = wire[TripsRepositoryMongoDB]
  lazy val busLineManager: BusLineManager = wire[BusLineManager]
  lazy val SPBusClientService: SPBusClientService = serviceClient.implement[SPBusClientService]
}
