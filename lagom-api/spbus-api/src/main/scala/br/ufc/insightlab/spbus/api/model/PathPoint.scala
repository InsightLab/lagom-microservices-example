package br.ufc.insightlab.spbus.api.model

import play.api.libs.json._

case class PathPoint(lat: Float,
                     lng: Float,
                     dist: Float)
object PathPoint {
  implicit val format: Format[PathPoint] = Json.format[PathPoint]
}
