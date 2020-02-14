package br.ufc.insightlab.spbus.repository.impl.utils

import com.typesafe.config.Config
import play.api.ConfigLoader
import play.api.libs.json.{Format, Json}

case class MongoDBConfig(uri: String, dbName: String, name: String)

object MongoDBConfig {
  implicit val format: Format[MongoDBConfig] = Json.format[MongoDBConfig]
  implicit val configLoader: ConfigLoader[MongoDBConfig] = { (config: Config, path: String) =>
    val _config = if (path.isEmpty) config else config.getConfig(path)
    require(_config != null, s"No MongoDBConfig found for path $path in configuration: \n $config")
    new MongoDBConfig(
      _config.getString("mongodb.uri"),
      _config.getString("mongodb.dbName"),
      _config.getString("mongodb.name")
    )
  }
}