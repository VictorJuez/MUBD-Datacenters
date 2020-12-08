import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { saveToDB } from "./UserRepository";
import { loadAllRegions, Region } from "./RegionService";

interface Location {
    region: string,
    sub_region: string
}

export interface User {
    id: number,
    location: Location,
    contacts: number[]
}

const TOTAL_POPULATION = 20;
const TOTAL_CONTACTS = 5;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: 'Generating contacts'
    };

    const regions = await loadAllRegions();

    const users: User[] = [];
    for (let i = 1; i<=TOTAL_POPULATION; ++i) {
        users.push(await generateRandomValues(i, regions))
    }

    saveToDB(users);

};

const generateRandomValues = async (id: number, regions: Region[]): Promise<User> => {
    const location = getRandomLocation(regions)
    const contacts = generateRandomContacts(id);
    
    return {
        id: id,
        contacts: contacts,
        location: location
    }
}

const getRandomLocation = (regions: Region[]): Location => {
    const region = randomValue(regions)
    console.log('selected region', region)
    const subRegion = randomValue(region.subregions)
    console.log('selected subregion', subRegion)

    return {
        region: region.name,
        sub_region: subRegion
    }
}

const generateRandomContacts = (userId: number): number[] => {
    const contacts = [];
    for(let i = 0; i < TOTAL_CONTACTS; ++i) {
        let contactId = randomIntFromInterval(1, TOTAL_POPULATION)
        while(contactId === userId || contacts.find(id => id === contactId)) contactId = randomIntFromInterval(1, TOTAL_POPULATION)
        contacts.push(contactId)
    }
    console.log('contacts', contacts)
    return contacts;
}

const randomValue = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

function randomIntFromInterval(min, max): number { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export default httpTrigger;