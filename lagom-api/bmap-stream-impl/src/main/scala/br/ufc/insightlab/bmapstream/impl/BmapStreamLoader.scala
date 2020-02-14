package br.ufc.insightlab.bmapstream.impl

import com.lightbend.lagom.scaladsl.api.ServiceLocator.NoServiceLocator
import com.lightbend.lagom.scaladsl.server._
import com.lightbend.lagom.scaladsl.devmode.LagomDevModeComponents
import play.api.libs.ws.ahc.AhcWSComponents
import br.ufc.insightlab.bmapstream.api.BmapStreamService
import br.ufc.insightlab.bmap.api.BmapService
import com.softwaremill.macwire._

class BmapStreamLoader extends LagomApplicationLoader {

  override def load(context: LagomApplicationContext): LagomApplication =
    new BmapStreamApplication(context) {
      override def serviceLocator: NoServiceLocator.type = NoServiceLocator
    }

  override def loadDevMode(context: LagomApplicationContext): LagomApplication =
    new BmapStreamApplication(context) with LagomDevModeComponents

  override def describeService = Some(readDescriptor[BmapStreamService])
}

abstract class BmapStreamApplication(context: LagomApplicationContext)
  extends LagomApplication(context)
    with AhcWSComponents {

  // Bind the service that this server provides
  override lazy val lagomServer: LagomServer = serverFor[BmapStreamService](wire[BmapStreamServiceImpl])

  // Bind the BmapService client
  lazy val bmapService: BmapService = serviceClient.implement[BmapService]
}
