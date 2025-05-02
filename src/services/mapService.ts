import axiosInstance from '@/services/axiosService'

class MapService {
  /**
   * Fetches all Points of interests
   */
  async getPointsOfInterest(filters: string[]) {
    const response = await axiosInstance.get('/point-of-interest', {
      params: { types: filters.join(',') },
    })
    return response.data
  }

  /**
   * Fetches all Points of interests
   */
  async getAffectedAreas() {
    const response = await axiosInstance.get('/affected-area')
    return response.data
  }

  async getAllPointsOfInterest() {
    const allTypes = [
      'hospital', 'shelter', 'defibrillator',
      'water_station', 'food_central', 'meeting_place'
    ];
    const response = await axiosInstance.get('/point-of-interest', {
      params: { types: allTypes.join(',') }
    });
    return response.data;
  }
}

const mapService = new MapService()
export default mapService
