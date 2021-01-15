import { User } from './index'
import { Collection, MongoClient } from 'mongodb'

export const saveToDB = async (users: User[]) => {
  const client = await connectDB();
  const db = client.db('Database1');
  const collection = db.collection('Collection1');

  await insertDocuments(users, collection)

  client.close()

}

const connectDB = async () => {
  try {
    return await MongoClient.connect("mongodb://covid-exposure-users:b5kyytngmH0jppno5Si7x1wWV0aZDAznO2nfpsBUhKkBq11SorUWp7eNCoqD6iihqI6Er7GBdLDIMl8MADZ4bg%3D%3D@covid-exposure-users.mongo.cosmos.azure.com:10255/?ssl=true&appName=@covid-exposure-users@")
  } catch (error) {
    console.log('Failed to connect to db', error)
  }
}

const insertDocuments = async (users: User[], collection: Collection) => {
  try {
    await collection.insertMany(users);
  } catch (error) {
    console.log('Failed to insert users', error)
  }
}