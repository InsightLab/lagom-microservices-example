package br.ufc.insightlab.spbus.repository.api

import br.ufc.insightlab.spbus.api.model.Trip

import scala.concurrent.Future

trait TripsRepository extends Repository[Trip] {
  def findByRouteAndDirection(routeId: String, direction: Int): Future[Trip]
}
