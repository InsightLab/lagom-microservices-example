package br.ufc.insightlab.spbus.impl

import akka.actor.{Actor, ActorSystem, Cancellable, Props}
import akka.stream.scaladsl.{Keep, Sink, Source, SourceQueue}
import akka.stream.{Materializer, OverflowStrategy}
import akka.util.Timeout
import br.ufc.insightlab.spbus.api.model.{Bus, BusLine, BusLineTrip}
import com.lightbend.lagom.scaladsl.pubsub.{PubSubRegistry, TopicId}

import scala.concurrent.ExecutionContext.Implicits.global
import org.reactivestreams.Publisher

import scala.concurrent.duration._
import scala.collection.concurrent.TrieMap
import scala.concurrent.Future


object BusLinesManager {
  case class AttachQueue(queue: SourceQueue[List[Bus]], lineCode: Int)
  case class LineSwitch(lineCode: Int)
}
class BusLinesManager(val pubSub: PubSubRegistry,
                      implicit val mat: Materializer) extends Actor {
  import BusLinesManager._

  val queuesByLineCode = TrieMap[Int, Set[SourceQueue[List[Bus]]]]()

  override def receive: Receive = {
    case LineSwitch(lineCode) =>
      pubSub
        .refFor(TopicId[List[Bus]](lineCode.toString))
        .subscriber
        .runForeach { buses =>
          val queueSet = queuesByLineCode.getOrElse(lineCode, Set.empty[SourceQueue[List[Bus]]])
          queueSet.foreach(_.offer(buses))
        }
    case AttachQueue(queue, newLineCode) =>
      val queued = queuesByLineCode.contains(newLineCode)

      var queueSet = queuesByLineCode.getOrElse(newLineCode, Set.empty[SourceQueue[List[Bus]]])
      queueSet += queue
      queuesByLineCode.update(newLineCode, queueSet)

      queuesByLineCode.foreach { tuple =>
        var (lineCode, queueSet) = tuple
        if (lineCode != newLineCode) {
          queueSet -= queue
        }
        queuesByLineCode.update(lineCode, queueSet)
      }

      if (!queued) {
        context.self ! LineSwitch(newLineCode)
      }
  }
}

class BusLineManager(val pubSub: PubSubRegistry,
                     implicit val mat: Materializer) {

  implicit val askTimeout: Timeout = Timeout(5.seconds)

  private var busesDataCache = Map[Int, List[Bus]]()
  private var busesLinesDataCache = List[BusLineTrip]()

  private var producingFunction: () => Future[List[BusLine]] = () => {
    Future(List.empty[BusLine])
  }
  private var requestScheduler: Cancellable = Cancellable.alreadyCancelled

  private val busManagerSystem = ActorSystem("busManager")
  private val busLinesManager = busManagerSystem.actorOf(Props(classOf[BusLinesManager], pubSub, mat))

  private def computeAngle(ax: Float, ay: Float, bx: Float, by: Float): Double = {
    (Math.atan2(by - ay, bx - ax) * 180 / Math.PI)
  }

  def startProducing(producingFn: () => Future[List[BusLine]]): Unit = {
    producingFunction = producingFn

    requestScheduler = requestScheduler match {
      case Cancellable.alreadyCancelled =>
        busManagerSystem.scheduler
          .scheduleAtFixedRate(0 seconds, 10 seconds) { () =>
            var busesLinesData = Future(List[BusLine]())
            try {
              busesLinesData = producingFn()
            } catch {
              case _: Exception =>
                busesLinesData = Future(List[BusLine]())
            }

            busesLinesData.map { busesLines =>
              busesLines.foreach { busLine =>
                val topic = pubSub.refFor(TopicId[List[Bus]](busLine.lineCode.toString))
                topic.publish(busLine.vehicles.getOrElse(List.empty[Bus]))
                val oldBuses = busesDataCache.getOrElse(busLine.lineCode, List.empty[Bus]).sortBy(_.busId)
                val newBuses = busLine.vehicles.getOrElse(List.empty[Bus]).sortBy(_.busId)
                var i = 0
                val newBusesWithRotation = newBuses.map { newBus =>
                  val oldBusOpt = oldBuses.lift(i)
                  i = i + 1
                  var rotationAngle: Float = 0
                  if (oldBusOpt.isDefined) {
                    val oldBus = oldBusOpt.get
                    rotationAngle = -computeAngle(oldBus.lng, oldBus.lat, newBus.lng, newBus.lat).toFloat
                    rotationAngle = if (rotationAngle == 0) oldBus.rotationAngle.getOrElse(0) else rotationAngle
                  }
                  new Bus(
                    newBus.busId,
                    newBus.accessible,
                    newBus.datetime,
                    newBus.lat,
                    newBus.lng,
                    newBus.line,
                    Some(rotationAngle),
                    newBus.predictedTime
                  )
                }
                busesDataCache += (busLine.lineCode -> newBusesWithRotation)
              }
            }
          }
      case _ =>
        requestScheduler.cancel()
        requestScheduler
    }
  }

  def stopProducing(): Unit = {
    requestScheduler.cancel()
  }

  def getBusesLinesDataCache(): List[BusLineTrip] = busesLinesDataCache
  def setBusesLinesDataCache(data: List[BusLineTrip]): Unit = {
    busesLinesDataCache = data
  }

  def generateQueueAndPublisher(): (SourceQueue[List[Bus]], Publisher[List[Bus]]) = {
    Source
      .queue[List[Bus]](100, OverflowStrategy.fail)
      .toMat(Sink.asPublisher(true))(Keep.both)
      .run()
  }

  def attachQueue(queue: SourceQueue[List[Bus]], lineCode: Int): Unit = {
    busLinesManager ! BusLinesManager.AttachQueue(queue, lineCode)
    queue.offer(busesDataCache.getOrElse(lineCode, List.empty[Bus]))
  }
}
