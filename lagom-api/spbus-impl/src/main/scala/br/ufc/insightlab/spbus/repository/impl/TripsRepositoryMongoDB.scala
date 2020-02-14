package br.ufc.insightlab.spbus.repository.impl

import br.ufc.insightlab.spbus.api.model.Trip
import br.ufc.insightlab.spbus.repository.api.TripsRepository
import play.api.libs.json.Json
import play.modules.reactivemongo.ReactiveMongoApi
import reactivemongo.api.{Cursor, ReadPreference}
import reactivemongo.play.json.JsObjectDocumentWriter
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.{ExecutionContext, Future}
import scala.util.Success

class TripsRepositoryMongoDB(reactiveMongoApi: ReactiveMongoApi)
                            (implicit val ec: ExecutionContext) extends TripsRepository {
  private val database = reactiveMongoApi.database
  private def tripsCollection: Future[JSONCollection] = database.map(_.collection[JSONCollection]("trips"))

  override def get(id: String): Future[Option[Trip]] = {
    tripsCollection.flatMap(
      _.find(Json.obj("_id" -> id), projection = Option.empty).one[Trip]
    )
  }

  override def get(): Future[Iterable[Trip]] = {
    tripsCollection.flatMap(
      _.find(Json.obj(), Option.empty)
        .cursor[Trip](ReadPreference.primary)
        .collect[Seq](-1, Cursor.FailOnError[Seq[Trip]]())
    )
  }

  override def findByRouteAndDirection(routeId: String, direction: Int): Future[Trip] = {
    tripsCollection.flatMap(
      _.find(Json.obj("route_id" -> routeId, "direction_id" -> (direction - 1)), projection = Option.empty)
        .one[Trip](ReadPreference.primary)
        .collect {
          case trip => trip.get
        }
    )
  }
}