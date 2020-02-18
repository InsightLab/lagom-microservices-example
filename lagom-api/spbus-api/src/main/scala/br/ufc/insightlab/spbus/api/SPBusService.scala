package br.ufc.insightlab.spbus.api

import akka.NotUsed
import akka.stream.scaladsl.Source
import br.ufc.insightlab.spbus.api.model.{Bus, BusLine, BusLineTrip, Stop, Trip}
import com.lightbend.lagom.scaladsl.api.transport.Method
import com.lightbend.lagom.scaladsl.api.{Descriptor, Service, ServiceAcl, ServiceCall}

/**
  * The SPBus service interface.
  * <p>
  * This describes everything that Lagom needs to know about how to serve and
  * consume the SPBusService.
  */
trait SPBusService extends Service {
  def findAllBuses: ServiceCall[NotUsed, List[BusLine]]
  def getBusesLines: ServiceCall[NotUsed, List[BusLineTrip]]
  def searchLines(query: String): ServiceCall[NotUsed, Map[String, List[BusLine]]]
  def getTripByLineAndDirection(line: String, direction: Int): ServiceCall[NotUsed, Trip]
  def getStopPrevisions(stopId: String): ServiceCall[NotUsed, List[BusLine]]
  def getStopsWithinCircle(coordinates: String, radius: Int): ServiceCall[NotUsed, List[Stop]]
  def getStopsByLineAndDirection(line: String, direction: Int): ServiceCall[NotUsed, List[Stop]]

  def busesPositionsStream: ServiceCall[Source[Int, NotUsed], Source[List[Bus], NotUsed]]

  override final def descriptor: Descriptor = {
    import Service._
    // @formatter:off
    named("spbus")
      .withCalls(
        pathCall("/api/sp/buses", findAllBuses),
        pathCall("/api/sp/buses-lines", getBusesLines),
        pathCall("/api/sp/buses-lines/search?q", searchLines _),
        pathCall("/api/sp/trip/:line/:direction", getTripByLineAndDirection _),
        pathCall("/api/sp/buses-stops/previsions/:stopId", getStopPrevisions _),
        pathCall("/api/sp/buses-stops/within-circle/:coordinates/:radius", getStopsWithinCircle _),
        pathCall("/api/sp/buses-stops/:line/:direction", getStopsByLineAndDirection _),
        pathCall("/ws", busesPositionsStream)
      )
      .withAutoAcl(true)
    // @formatter:on
  }
}