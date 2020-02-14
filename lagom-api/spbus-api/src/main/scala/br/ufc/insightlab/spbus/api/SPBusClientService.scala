package br.ufc.insightlab.spbus.api

import akka.NotUsed
import com.lightbend.lagom.scaladsl.api.transport.Method.{GET, POST}
import com.lightbend.lagom.scaladsl.api.{Descriptor, Service, ServiceCall}
import play.api.libs.json.JsValue

trait SPBusClientService extends Service {
  def authenticate(token: String): ServiceCall[NotUsed, Boolean]
  def findAllBuses: ServiceCall[NotUsed, JsValue]
  def getStopPrevisions(stopCode: String): ServiceCall[NotUsed, JsValue]
  def searchLines(query: String): ServiceCall[NotUsed, JsValue]

  override def descriptor: Descriptor = {
    import Service._

    named("spbus-client")
      .withCalls(
        restCall(POST, "/Login/Autenticar?token", authenticate _),
        restCall(GET, "/Posicao", findAllBuses _),
        restCall(GET, "/Previsao/Parada?codigoParada", getStopPrevisions _),
        restCall(GET, "/Linha/Buscar?termosBusca", searchLines _)
      )
      .withAutoAcl(true)
  }
}

