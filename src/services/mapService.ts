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

  /**
   * Deletes a point of interest by its ID.
   *
   * @param id - The ID of the point of interest to delete.
   * @returns A promise that resolves when the point of interest is successfully deleted.
   */
  async deletePointOfInterest(id: number) {
    await axiosInstance.delete(`/point-of-interest/${id}`)
  }

  /**
   * Updates a point of interest by its ID with the provided data.
   *
   * @param id - The ID of the point of interest to update.
   * @param data - The data to update the point of interest with.
   * @returns A promise that resolves when the point of interest is successfully updated.
   */
  async updatePointOfInterest(id: number, data: any) {
    await axiosInstance.put(`/point-of-interest/${id}`, data)
  }

  /**
   * Updates an affected area by its ID with the provided data.
   *
   * @param id - The ID of the affected area to update.
   * @param data - The data to update the affected area with.
   * @returns A promise that resolves when the affected area is successfully updated.
   */
  async updateAffectedArea(id: number, data: any) {
    await axiosInstance.put(`/affected-area/${id}`, data)
  }

  /**
   * Deletes an affected area by its ID.
   *
   * @param id - The ID of the affected area to delete.
   * @returns A promise that resolves when the affected area is successfully deleted.
   */
  async deleteAffectedArea(id: number) {
    await axiosInstance.delete(`/affected-area/${id}`)
  }
}

const mapService = new MapService()
export default mapService
