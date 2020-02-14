package br.ufc.insightlab.spbus.api.model

import play.api.libs.functional.syntax._
import play.api.libs.json.{JsPath, Json, Reads}

case class Stop(stopId: Int,
                name: String,
                trips: Iterable[String],
                lat: Double,
                lng: Double)

object Stop {
  implicit def formatReads: Reads[Stop] =
    (JsPath \ "stop_id").format[Int]
      .and((JsPath \ "name").format[String])
      .and((JsPath \ "trips").format[Iterable[String]])
      .and((JsPath \ "location" \ "coordinates" \ 1).format[Double])
      .and((JsPath \ "location" \ "coordinates" \ 0).format[Double])
      .apply(Stop.apply, unlift(Stop.unapply))


  implicit val formatWrites = Json.writes[Stop]
}
