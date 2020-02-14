package br.ufc.insightlab.bmap.impl

import akka.NotUsed
import br.ufc.insightlab.bmap.api
import br.ufc.insightlab.bmap.api.{BmapClientService, BmapService, Bus}
import com.lightbend.lagom.scaladsl.api.ServiceCall
import com.lightbend.lagom.scaladsl.api.broker.Topic
import com.lightbend.lagom.scaladsl.broker.TopicProducer
import com.lightbend.lagom.scaladsl.persistence.{EventStreamElement, PersistentEntityRegistry}

import scala.concurrent.ExecutionContext.Implicits.global

/**
  * Implementation of the BmapService.
  */
class BmapServiceImpl(persistentEntityRegistry: PersistentEntityRegistry,
                      bmapClientService: BmapClientService) extends BmapService {

  override def hello(id: String) = ServiceCall { _ =>
    // Look up the bmap entity for the given ID.
    val ref = persistentEntityRegistry.refFor[BmapEntity](id)

    // Ask the entity the Hello command.
    ref.ask(Hello(id))
  }

  override def useGreeting(id: String) = ServiceCall { request =>
    // Look up the bmap entity for the given ID.
    val ref = persistentEntityRegistry.refFor[BmapEntity](id)

    // Tell the entity to use the greeting message specified.
    ref.ask(UseGreetingMessage(request.message))
  }


  override def greetingsTopic(): Topic[api.GreetingMessageChanged] =
    TopicProducer.singleStreamWithOffset {
      fromOffset =>
        persistentEntityRegistry.eventStream(BmapEvent.Tag, fromOffset)
          .map(ev => (convertEvent(ev), ev.offset))
    }

  private def convertEvent(helloEvent: EventStreamElement[BmapEvent]): api.GreetingMessageChanged = {
    helloEvent.event match {
      case GreetingMessageChanged(msg) => api.GreetingMessageChanged(helloEvent.entityId, msg)
    }
  }

  override def findAllBuses: ServiceCall[NotUsed, List[String]] = { _ =>
    bmapClientService.findAllBuses.invoke().map(busLocations => {
      busLocations.map { busLocation => busLocation.line }.distinct
    })
  }

  override def findBusPosition(id: String): ServiceCall[NotUsed, List[Bus]] = { _ =>
    bmapClientService.findBusPosition(id).invoke()
  }

  override def findLinePosition(id: String): ServiceCall[NotUsed, List[Bus]] = { _ =>
    bmapClientService.findLinePosition(id).invoke()
  }
}
