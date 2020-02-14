package br.ufc.insightlab.spbus.impl

import akka.stream.Materializer
import akka.stream.scaladsl.Source
import akka.{Done, NotUsed}
import br.ufc.insightlab.spbus.api.model.{Bus, BusLine, BusLineTrip, Stop, Trip}
import br.ufc.insightlab.spbus.api.{SPBusClientService, SPBusService}
import br.ufc.insightlab.spbus.repository.api.{StopsRepository, TripsRepository}
import com.lightbend.lagom.scaladsl.api.ServiceCall
import com.lightbend.lagom.scaladsl.api.transport.ResponseHeader
import play.api.Configuration
import play.api.http.HeaderNames.{COOKIE, SET_COOKIE}
import play.api.libs.json._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}


/**
  * Implementation of the SPBusService.
  */
class SPBusServiceImpl(spBusClientService: SPBusClientService,
                       config: Configuration,
                       val stopsRepository: StopsRepository,
                       val tripsRepository: TripsRepository,
                       val busLineManager: BusLineManager)
                      (implicit materializer: Materializer) extends SPBusService {
  import SPBusServiceImpl._

  val appToken = config.get[String]("apiOlhoVivoToken")

  busLineManager.startProducing(internalFindAllBuses)

  def fetchCredentials: Future[String] = {
    if ("".equals(apiCredentials)) {
      spBusClientService.authenticate(appToken).handleResponseHeader { (responseHeader, _) =>
        apiCredentials = getAuthenticatedCredentials(responseHeader)
      }.invoke().map { _ =>
        apiCredentials
      }
    } else {
      Future(apiCredentials)
    }
  }

  def authorizedFetch[Request, Response](serviceCall: ServiceCall[Request, Response], acc: Int = 0)
                                        (implicit evidence: NotUsed =:= Request): Future[Response] = {
    fetchCredentials.flatMap { credentials =>
      serviceCall
        .handleRequestHeader { requestHeader =>
          requestHeader.withHeader(COOKIE, s"apiCredentials=$credentials${""}")
        }
        .invoke()
        .andThen {
          case Success(response) => response
          case Failure(_) => acc match {
            case acc if acc < 2 => authorizedFetch(serviceCall, acc + 1)
            case _ => Done
          }
        }
    }
  }

  def internalFindAllBuses(): Future[List[BusLine]] = {
    authorizedFetch(spBusClientService.findAllBuses)
      .map { response =>
        (response \ "l").as[JsArray].value.map(_.as[BusLine]).toList
      }
  }

  override def findAllBuses: ServiceCall[NotUsed, List[BusLine]] = ServiceCall { _ =>
    internalFindAllBuses()
  }

  override def getBusesLines: ServiceCall[NotUsed, List[BusLineTrip]] = ServiceCall { _ =>
    val busesLinesDataCache = busLineManager.getBusesLinesDataCache()
    if (busesLinesDataCache.isEmpty) {
      internalFindAllBuses().map { busesLines =>
        val busLineByName = busesLines.groupBy(_.lineName)
        val busesLinesData = busLineByName
          .keys
          .map { lineName =>
            val subLines = busLineByName.getOrElse(lineName, List.empty[BusLine])
            val subLineInfo = subLines.head
            BusLineTrip(lineName.get, subLineInfo.terminal1.get, subLineInfo.terminal2.get, subLines.map(_.toMainInfo()))
          }.toList
        busLineManager.setBusesLinesDataCache(busesLinesData)
        busesLinesData
      }
    } else {
      Future.successful(busesLinesDataCache)
    }
  }

  override def searchLines(query: String): ServiceCall[NotUsed, Map[String, List[BusLine]]] = ServiceCall { _ =>
    authorizedFetch(spBusClientService.searchLines(query))
      .map { response =>
        response
          .as[JsArray].value.map(_.as[BusLine]).toList
          .groupBy { busLine =>
            s"${busLine.signText.getOrElse("")}-${busLine.operationMode.getOrElse("")}"
          }
      }
  }

  override def getStopsWithinCircle(coordinates: String, radius: Int) = ServiceCall { _ =>
    val parsedCoordinates = coordinates.split(",").map(_.toFloat)
    val lat = parsedCoordinates(1)
    val lng = parsedCoordinates(0)
    stopsRepository.findWithinCircle(lat, lng, radius).map(_.toList)
  }

  override def busesPositionsStream = ServiceCall { inputSource =>
    val (queue, publisher) = busLineManager.generateQueueAndPublisher()
    inputSource.runForeach { lineCode =>
      busLineManager.attachQueue(queue, lineCode)
    }
    Future.successful(Source.fromPublisher(publisher))
  }

  override def getTripByLineAndDirection(line: String, direction: Int) = ServiceCall { _ =>
    tripsRepository.findByRouteAndDirection(line, direction)
  }

  override def getStopPrevisions(stopId: String): ServiceCall[NotUsed, List[BusLine]] = ServiceCall { _ =>
    authorizedFetch(spBusClientService.getStopPrevisions(stopId))
      .map { response =>
        (response \ "p" \ "l").as[JsArray].value.map(_.as[BusLine]).toList
      }
  }

  override def getStopsByLineAndDirection(line: String, direction: Int): ServiceCall[NotUsed, List[Stop]] =
    ServiceCall { _ =>
      stopsRepository.findByTrip(s"$line-${direction-1}").map(_.toList)
    }
}

object SPBusServiceImpl {
  var apiCredentials = ""

  def processCookies(cookies: String): Map[String, String] = {
    val cookiesList = cookies.split("; ")

    cookiesList.map { cookie =>
      val pair = cookie.split("=")
      val cookieName = pair(0)
      var cookieValue = ""
      if (pair.length == 2) {
        cookieValue = pair(1)
      }
      cookieName -> cookieValue
    }.toMap
  }

  def getAuthenticatedCredentials(responseHeader: ResponseHeader): String = {
    responseHeader.getHeader(SET_COOKIE) match {
      case Some(cookies) =>
        processCookies(cookies).getOrElse("apiCredentials", "")
      case None =>
        ""
    }
  }
}