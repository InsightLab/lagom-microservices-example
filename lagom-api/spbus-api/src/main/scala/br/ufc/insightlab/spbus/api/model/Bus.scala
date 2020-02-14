package br.ufc.insightlab.spbus.api.model

import play.api.data.validation.ValidationError
import play.api.libs.functional.syntax._
import play.api.libs.json._

import scala.util.{Success, Try}

case class Bus(busId: Int,
               accessible: Boolean,
               datetime: String,
               lat: Float,
               lng: Float,
               line: Option[String],
               rotationAngle: Option[Float] = Some(0),
               predictedTime: Option[String]) {
}

object Bus {
  val readIntFromString: Reads[Int] = implicitly[Reads[String]]
    .map(x => Try(x.toInt))
    .collect (JsonValidationError(Seq("Parsing error"))){
      case Success(a) => a
    }

  val readInt: Reads[Int] = implicitly[Reads[Int]].orElse(readIntFromString)

  implicit val formatReads: Reads[Bus] =
    (JsPath \ "p").format[Int](readInt)
      .and((JsPath \ "a").format[Boolean])
      .and((JsPath \ "ta").format[String])
      .and((JsPath \ "py").format[Float])
      .and((JsPath \ "px").format[Float])
      .and((JsPath \ "c").formatNullable[String])
      .and((JsPath \ "rotationAngle").formatNullable[Float])
      .and((JsPath \ "t").formatNullable[String])
      .apply(Bus.apply, unlift(Bus.unapply))

  implicit val formatWrites = Json.writes[Bus]

  implicit val formatListReads = new Reads[List[Bus]] {
    override def reads(json: JsValue): JsResult[List[Bus]] = {
      JsSuccess(json.as[JsArray].value.map(_.as[Bus]).toList)
    }
  }
}


