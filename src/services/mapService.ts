import type { LocationItem, AffectedArea, GetPointsOfInterestRequest } from '@/types/mapTypes.ts'
import axiosInstance from '@/services/axiosService'

class MapService {
  /**
   * Fetches all Points of interests
   */
  async getPointsOfInterest(filters: string[]) {
    const response = await axiosInstance.get('/point-of-interest', {
      params: { types: filters.join(',') }
    });
    return response.data
  }
}

const mapService = new MapService()
export default mapService
