package br.ufc.insightlab.spbus.repository.api

import br.ufc.insightlab.spbus.api.model.Stop
import scala.concurrent.Future

trait StopsRepository extends Repository[Stop] {
  /**
    * Receive a trip name and return all bus stops containing
    * the trip with its name in theirs routes
    * @param tripName - Name of trip
    * @return Sequence of bus stops
    */
  def findByTrip(tripName: String): Future[Iterable[Stop]]

  /**
    * Receive a geographic position and a radius then return all bus
    * stops within the circle described by this settings
    * @param radius - in meters
    */
  def findWithinCircle(lat: Float, lng: Float, radius: Int): Future[Iterable[Stop]]
}
