import com.mongodb.spark._
import com.mongodb.spark.config.WriteConfig
import org.apache.spark.graphx._
import org.apache.spark.sql.SparkSession
import org.bson.Document
import org.apache.spark.rdd.RDD

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.DurationInt
import scala.concurrent.{Await, Future}

object CovidExposure extends App {
  val spark = SparkSession.builder
    .master("local[*]")
    .appName("Sample App")
    .config("spark.mongodb.input.uri", "mongodb://covid-exposure-users:b5kyytngmH0jppno5Si7x1wWV0aZDAznO2nfpsBUhKkBq11SorUWp7eNCoqD6iihqI6Er7GBdLDIMl8MADZ4bg==@covid-exposure-users.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@covid-exposure-users@")
    .config("spark.mongodb.input.database", "Database1")
    .config("spark.mongodb.input.collection", "Collection1")
    .config("spark.mongodb.output.uri", "mongodb://covid-exposure-users:b5kyytngmH0jppno5Si7x1wWV0aZDAznO2nfpsBUhKkBq11SorUWp7eNCoqD6iihqI6Er7GBdLDIMl8MADZ4bg==@covid-exposure-users.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@covid-exposure-users@")
    .config("spark.mongodb.output.database", "Database1")
    .config("spark.mongodb.output.collection", "Collection2")
    .getOrCreate()

  val sc = spark.sparkContext

  val mongo = MongoConnector.create(sc).mongoClientFactory.create()
  val database = mongo.getDatabase("Database1")
  database.getCollection("Collection2").drop()
  database.createCollection("Collection2")

  val rdd = MongoSpark.load(sc)

  val users: RDD[(VertexId, (String, String))] = rdd.map(doc => {
    val id = doc.get("id").asInstanceOf[Number].longValue()
    val covidDoc: Document = doc.get("covidTest").asInstanceOf[Document]
    val covid: Boolean = if (covidDoc != null) covidDoc.getBoolean("positive") else false
    val covidResult = if (covid) "positive" else "negative"
    (id, (covidResult, "null"))
  })

  users.collect.foreach(println(_))
  val relationships: RDD[Edge[String]] = rdd.flatMap(doc => {
    val id = doc.get("id").asInstanceOf[Number].longValue()
    val contacts = doc.getList("contacts", classOf[Number])
    val k: Array[Edge[String]] = contacts.toArray().map(contact => Edge(id, contact.asInstanceOf[Number].longValue(), "relation"))
    k.toSeq
  })

  val defaultUser = ("negative", "null")
  // Build the initial Graph
  val graph = Graph(users, relationships, defaultUser)

  val infectedContacts = graph.triplets.map(triplet => (triplet.srcId, if (triplet.dstAttr._1 == "positive") 1 else 0)).reduceByKey((a, b) => a + b)
  val documents = infectedContacts.map(f => {
    Document.parse(s"{id: ${f._1}, contactsInfected: ${f._2}}")
  })

  MongoSpark.save(documents)
}
