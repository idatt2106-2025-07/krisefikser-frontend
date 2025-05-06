import axiosInstance from '@/services/axiosService'

class MapService {

  /**
   * Fetches points of interest from the server based on the provided filters.
   *
   * @param filters - An array of strings representing the types of points of interest to filter by.
   *                  These types will be joined into a comma-separated string and sent as a query parameter.
   * @returns A promise that resolves to the data containing the points of interest.
   */
  async getPointsOfInterest(filters: string[]) {
    const response = await axiosInstance.get('/point-of-interest', {
      params: { types: filters.join(',') },
    })
    return response.data
  }


  /**
   * Fetches the list of affected areas from the server.
   *
   * @returns A promise that resolves to the data containing the affected areas.
   */
  async getAffectedAreas() {
    const response = await axiosInstance.get('/affected-area')
    return response.data
  }

  /**
   * Fetches all points of interest (POIs) from the server.
   *
   * This method retrieves a list of POIs based on predefined types.
   * The types are sent as query parameters to the `/point-of-interest` endpoint.
   *
   * @returns A promise that resolves to the data containing the list of points of interest.
   */
  async getAllPointsOfInterest() {
    const allTypes = [
      'hospital',
      'shelter',
      'defibrillator',
      'water_station',
      'food_central',
      'meeting_place',
    ]
    const response = await axiosInstance.get('/point-of-interest', {
      params: { types: allTypes.join(',') },
    })
    return response.data
  }
}

const mapService = new MapService()
export default mapService
