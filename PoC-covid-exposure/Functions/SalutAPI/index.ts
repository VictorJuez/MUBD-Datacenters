import { AzureFunction, Context } from "@azure/functions"
import { savePatients } from "./PatientRepository";

export interface CovidTest {
    positive: boolean,
    timestamp: Date
}

export interface Patient {
    id: number,
    covidTest: CovidTest
}

const TOTAL_POPULATION = 20;
const PATIENTS_PER_EXECUTION = 5;

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('Timer function is running late!');
    }
    context.log('Timer trigger function ran!', timeStamp);

    const patients = simulatePCRs()
    await savePatients(patients);
    context.log(patients)
};

const simulatePCRs = (): Patient[] => {
    const patients: Patient[] = [];

    for (let i=0; i<PATIENTS_PER_EXECUTION; ++i) {
        let patientId = getRandomPatientId(patients)
        let positive = Math.random() < 0.5;
        patients.push({id: patientId, covidTest: {positive: positive, timestamp: new Date()}})
    }

    return patients;
}

const getRandomPatientId = (currentPatients: Patient[]):number => {
    let patientId = randomIntFromInterval(1, TOTAL_POPULATION);
    let i = 0;
    while(currentPatients.find((patient) => {patient.id === patientId}) && i < 100) {
        patientId = randomIntFromInterval(1, TOTAL_POPULATION);
        ++i;
    }

    return patientId;
}

const randomIntFromInterval = (min: number, max: number): number => { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export default timerTrigger;
