package br.ufc.insightlab.spbus.repository.api

import scala.concurrent.Future

/**
  * Genreic Api for Repository
  * */

trait Repository[T] {
//
//  /**
//    * Receive an entity info and insert it on database
//    * @return a inserted entity with entity's database id
//    * */
//  def insert(item: T): Future[T]
//
//
//  /**
//    * Receive an entity edit info and update it by using entity's id
//    * @return True or False if entity has been updated
//    * */
//  def update(item: T): Future[T]
//
//  /**
//    * Receive an entity's database id and delete the entity on database
//    * @return True or False if entity has been deleted
//    * */
//  def delete(id: Long): Future[Boolean]


  /**
    * Receive an entity's database id and search the entity on database
    * @return The entity who has the specified id
    * */
  def get(id: String): Future[Option[T]]


  /**
    * Receive an entity's database id and search the entity on database
    * @return All the entities on database
    * */
  def get(): Future[Iterable[T]]
//
//  /**
//    * Receive an integer to represent the number of rows changed
//    * @return True or False if any row is changed
//    * */
//  def int2bool(i :Int): Boolean = {
//    i match {
//      case 0 => false
//      case _ => true
//    }
//  }
}
