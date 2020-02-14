package br.ufc.insightlab.spbus.repository.impl.utils
import play.api.Configuration
import play.modules.reactivemongo.ReactiveMongoApiComponents
import reactivemongo.api.MongoConnection
import scala.concurrent.ExecutionContext

trait MongoDbComponents extends ReactiveMongoApiComponents {
  def configuration: Configuration

  def mongoDbConfigPath: String = ""

  implicit def executionContext: ExecutionContext

  override lazy val ec: ExecutionContext = executionContext

  private def mongoDbConfig = configuration.get[MongoDBConfig](mongoDbConfigPath)

  override def dbName: String = mongoDbConfig.dbName
  override def name: String = mongoDbConfig.name

  // TODO Improve the inheritance of ReactiveMongoApiComponents: name is very generic and may cause conflicts or side-effects.
  override def parsedUri: MongoConnection.ParsedURI  = MongoConnection.parseURI(mongoDbConfig.uri).get
}