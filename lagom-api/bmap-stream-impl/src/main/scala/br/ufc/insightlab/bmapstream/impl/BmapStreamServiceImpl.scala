package br.ufc.insightlab.bmapstream.impl

import akka.NotUsed
import akka.stream.scaladsl.{Flow, Source}
import com.lightbend.lagom.scaladsl.api.ServiceCall
import br.ufc.insightlab.bmapstream.api.BmapStreamService
import br.ufc.insightlab.bmap.api.{BmapService, Bus}

import scala.concurrent.duration._
import scala.concurrent.Future

/**
  * Implementation of the BmapStreamService.
  */
class BmapStreamServiceImpl(bmapService: BmapService) extends BmapStreamService {


  def stream = ServiceCall { hellos =>
    Future.successful(hellos.mapAsync(8)(bmapService.hello(_).invoke()))
  }

  override def streamBusPosition: ServiceCall[String, Source[List[Bus], NotUsed]] = ServiceCall { id =>
    Future.successful(Source.tick(1.seconds, 30.seconds, ())
      .mapAsync(8)(_ => bmapService.findBusPosition(id).invoke())
      .mapMaterializedValue(_ => NotUsed)
    )
  }

  override def streamLinePosition: ServiceCall[String, Source[List[Bus], NotUsed]] = ServiceCall { id =>
    Future.successful(Source.tick(1.seconds, 30.seconds, ())
      .mapAsync(8)(_ => bmapService.findLinePosition(id).invoke())
      .mapMaterializedValue(_ => NotUsed))
  }
}
