import org.apache.spark.sql.SparkSession

object Hello extends App {
  val spark = SparkSession.builder
    .master("local[*]")
    .appName("Sample App")
    .getOrCreate()
  val data = spark.sparkContext.parallelize(
    Seq("I like Spark", "Spark is awesome", "My first Spark job is working now and is counting down these words")
  )
  val filtered = data.filter(line => line.contains("awesome"))
  data.collect().foreach(print)
}