package br.ufc.insightlab.spbus.api.model

import play.api.libs.json._

case class BusLineTrip(lineName: String,
                       terminal1: String,
                       terminal2: String,
                       subLines: List[BusLine])

object BusLineTrip {
  implicit val format: Format[BusLineTrip] = Json.format[BusLineTrip]
}
