package br.ufc.insightlab.bmap.api

import play.api.libs.json.{Format, Json}

case class Bus(datetime: String,
               busId: String,
               line: String,
               lat: Float,
               lng: Float,
               velocity: Float)

object Bus {
  implicit val format: Format[Bus] = Json.format[Bus]
}


