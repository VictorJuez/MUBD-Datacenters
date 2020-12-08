import { Patient } from "./index";
import { Collection, MongoClient } from 'mongodb'

export const savePatients = async (patients: Patient[]) => {
  const client = await connectDB();
  const db = client.db('Database1');
  const collection = db.collection('Collection1');

  await insertDocuments(patients, collection)

  client.close()
}

const connectDB = async () => {
  try {
    return await MongoClient.connect("mongodb://covid-exposure-users:b5kyytngmH0jppno5Si7x1wWV0aZDAznO2nfpsBUhKkBq11SorUWp7eNCoqD6iihqI6Er7GBdLDIMl8MADZ4bg%3D%3D@covid-exposure-users.mongo.cosmos.azure.com:10255/?ssl=true&appName=@covid-exposure-users@")
  } catch (error) {
    console.log('Failed to connect to db', error)
  }
}

const insertDocuments = async (patients: Patient[], collection: Collection) => {
  for(let patient of patients) await updateUser(patient, collection);
}

const updateUser = async (patient: Patient, collection: Collection) => {
  try {
    await collection.findOneAndUpdate({id: patient.id}, {$set : {covidTest: patient.covidTest}})
  } catch (error) {
    console.log('Failed to update a patient', error)
  }
}