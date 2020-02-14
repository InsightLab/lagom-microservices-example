package br.ufc.insightlab.spbus.repository.impl

import br.ufc.insightlab.spbus.api.model.Stop
import br.ufc.insightlab.spbus.repository.api.StopsRepository
import play.api.libs.json.Json
import play.modules.reactivemongo.ReactiveMongoApi
import reactivemongo.api.{Cursor, ReadPreference}
import reactivemongo.play.json.JsObjectDocumentWriter
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.{ExecutionContext, Future}

class StopsRepositoryMongoDB(reactiveMongoApi: ReactiveMongoApi)
                            (implicit val ec: ExecutionContext) extends StopsRepository {
  private val database = reactiveMongoApi.database
  private def stopsCollection: Future[JSONCollection] = database.map(_.collection[JSONCollection]("stops"))

  override def get(id: String): Future[Option[Stop]] = {
    stopsCollection.flatMap(
      _.find(Json.obj("_id" -> id), projection = Option.empty).one[Stop]
    )
  }

  override def get(): Future[Iterable[Stop]] = {
    stopsCollection.flatMap(
      _.find(Json.obj(), Option.empty)
        .cursor[Stop](ReadPreference.primary)
        .collect[Seq](-1, Cursor.FailOnError[Seq[Stop]]())
    )
  }

  override def findByTrip(tripName: String): Future[Iterable[Stop]] = {
    stopsCollection.flatMap(
      _.find(Json.obj("trips" -> tripName), projection = Option.empty)
        .cursor[Stop](ReadPreference.primary)
        .collect[Seq](-1, Cursor.FailOnError[Seq[Stop]]())
    )
  }

  override def findWithinCircle(lat: Float, lng: Float, radius: Int): Future[Iterable[Stop]] = {
    stopsCollection.flatMap(
      _.find(Json.obj(
        "location" -> Json.obj(
          "$geoWithin" -> Json.obj(
            "$centerSphere" -> Json.arr(
              Json.arr(lng, lat), radius.toFloat / 6378100
            )
          )
        )
      ), projection = None)
        .cursor[Stop](ReadPreference.primary)
        .collect[Seq](-1, Cursor.FailOnError[Seq[Stop]]())
    )
  }
}