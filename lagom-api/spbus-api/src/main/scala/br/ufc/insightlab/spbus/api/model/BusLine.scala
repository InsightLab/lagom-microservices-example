package br.ufc.insightlab.spbus.api.model

import play.api.libs.functional.syntax._
import play.api.libs.json._

case class BusLine(lineCode: Int,
                   direction: Int,
                   numVehicles: Option[Int],
                   lineName: Option[String],
                   terminal1: Option[String],
                   terminal2: Option[String],
                   vehicles: Option[List[Bus]],
                   isCircular: Option[Boolean],
                   destinationLabel1: Option[String],
                   destinationLabel2: Option[String],
                   operationMode: Option[Int],
                   signText: Option[String]) {
  def toBasicInfo(): BusLine = {
    BusLine(lineCode, direction, numVehicles, lineName, terminal1, terminal2, None, None, None, None, None, None)
  }

  def toMainInfo(): BusLine = {
    BusLine(lineCode, direction, numVehicles, None, None, None, None, None, None, None, None, None)
  }
}

object BusLine {
  implicit val formatReads: Reads[BusLine] =
  (JsPath \ "cl").format[Int]
    .and((JsPath \ "sl").format[Int])
    .and((JsPath \ "qv").formatNullable[Int])
    .and((JsPath \ "c").formatNullable[String])
    .and((JsPath \ "lt0").formatNullable[String])
    .and((JsPath \ "lt1").formatNullable[String])
    .and((JsPath \ "vs").formatNullable[List[Bus]])
    .and((JsPath \ "lc").formatNullable[Boolean])
    .and((JsPath \ "tp").formatNullable[String])
    .and((JsPath \ "ts").formatNullable[String])
    .and((JsPath \ "tl").formatNullable[Int])
    .and((JsPath \ "lt").formatNullable[String])
    .apply(BusLine.apply, unlift(BusLine.unapply))

  implicit val formatWrites = Json.writes[BusLine]
}