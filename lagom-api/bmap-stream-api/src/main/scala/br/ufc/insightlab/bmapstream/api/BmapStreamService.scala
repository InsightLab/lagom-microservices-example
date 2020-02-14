package br.ufc.insightlab.bmapstream.api

import akka.NotUsed
import akka.stream.scaladsl.Source
import br.ufc.insightlab.bmap.api.Bus
import com.lightbend.lagom.scaladsl.api.{Descriptor, Service, ServiceCall}

/**
  * The bmap stream interface.
  *
  * This describes everything that Lagom needs to know about how to serve and
  * consume the BmapStream service.
  */
trait BmapStreamService extends Service {

  def stream: ServiceCall[Source[String, NotUsed], Source[String, NotUsed]]

  def streamBusPosition: ServiceCall[String, Source[List[Bus], NotUsed]]

  def streamLinePosition: ServiceCall[String, Source[List[Bus], NotUsed]]

  override final def descriptor: Descriptor = {
    import Service._

    named("bmap-stream")
      .withCalls(
        namedCall("stream", stream),
        namedCall("buses", streamBusPosition),
        namedCall("lines", streamLinePosition)
      ).withAutoAcl(true)
  }
}

