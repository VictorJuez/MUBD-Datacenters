import Axios from 'axios'

export interface Region {
  name: string,
  subregions: string[]
}

export const loadAllRegions = async (): Promise<Region[]> => {
  const regions = await loadRegions();
  return await loadSubRegions(regions);
}

const loadRegions = async () => {
  try {
      return await loadRegionsI();
  } catch (error) {
      console.error('Failed to get regions', error)
  }
}

const loadRegionsI = async (): Promise<string[]> => {
  const response = await Axios.get('https://api.covid19tracking.narrativa.com/api/countries/spain/regions')
  return response.data.countries[0].spain.map((region) => region.id)
}

const loadSubRegions = async (regions: string[]): Promise<Region[]> => {
  try {
      return await loadSubRegionsI(regions)
  } catch (error) {
      
  }
}

const loadSubRegionsI = async (regions: string[]): Promise<Region[]> => {
  const result: Region[] = [];
  for (let region of regions) result.push({name: region, subregions: await loadSubRegion(region)})
  return result;
}

const loadSubRegion = async (region: string): Promise<string[]> => {
  const response = await Axios.get('https://api.covid19tracking.narrativa.com/api/countries/spain/regions/'+region+'/sub_regions')
  return response.data.countries[0].spain[region].map((subRegion) => subRegion.id)
}