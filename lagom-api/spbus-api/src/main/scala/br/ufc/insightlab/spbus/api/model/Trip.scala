package br.ufc.insightlab.spbus.api.model

import play.api.libs.functional.syntax._
import play.api.libs.json._

case class Trip(directionId: Int,
                routeId: String,
                shapeId: Int,
                shapePath: List[PathPoint],
                tripHeadsign: String,
                tripId: String)

object Trip {
  implicit val formatReads: Reads[Trip] =
    (JsPath \ "direction_id").format[Int]
      .and((JsPath \ "route_id").format[String])
      .and((JsPath \ "shape_id").format[Int])
      .and((JsPath \ "shape_path").format[List[PathPoint]])
      .and((JsPath \ "trip_headsign").format[String])
      .and((JsPath \ "trip_id").format[String])
      .apply(Trip.apply, unlift(Trip.unapply))

  implicit val formatWrites = Json.writes[Trip]
}
