package br.ufc.insightlab.bmap.api

import akka.NotUsed
import akka.util.ByteString
import com.lightbend.lagom.scaladsl.api.deser.MessageSerializer
import com.lightbend.lagom.scaladsl.api.{Descriptor, Service, ServiceCall}
import com.lightbend.lagom.scaladsl.api.transport.Method.GET
import play.api.libs.json.{Format, Reads}
import play.api.libs.json._
import play.api.libs.functional.syntax._

trait BmapClientService extends Service {

  import BmapClientService._

  def findAllBuses: ServiceCall[NotUsed, List[Bus]]

  def findBusPosition(id: String): ServiceCall[NotUsed, List[Bus]]

  def findLinePosition(id: String): ServiceCall[NotUsed, List[Bus]]

  private val serializer = MessageSerializer.jsValueFormatMessageSerializer(
    implicitly[MessageSerializer[JsValue, ByteString]],
    busLocationListFormat)

  override def descriptor: Descriptor = {
    import Service._


    named("bmap-client")
      .withCalls(
        restCall(GET, "/obterTodasPosicoes", findAllBuses _)(implicitly, serializer),
        restCall(GET, "/obterPosicoesDoOnibus/:id", findBusPosition _)(implicitly, serializer),
        restCall(GET, "/obterPosicoesDaLinha/:id", findLinePosition _)(implicitly, serializer)
      )
      .withAutoAcl(true)
  }


}

object BmapClientService {
  private val busLocation: Reads[Bus] = (
      (__ \ 0).read[String] and
      (__ \ 1).read[String] and
      (__ \ 2).read[String].orElse(
       (__ \ 2).read[Int].map(_.toString)
      ) and
      (__ \ 3).read[Float] and
      (__ \ 4).read[Float] and
      (__ \ 5).read[Float]
    ) (Bus.apply _)

  private val busLocationListReads: Reads[List[Bus]] = { json =>
    json("DATA").validate(Reads.list(busLocation))
  }

  private val busLocationListFormat: Format[List[Bus]] = Format(
    busLocationListReads,
    Writes.list(Bus.format)
  )
}