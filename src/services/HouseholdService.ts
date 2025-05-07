// src/services/HouseholdService.ts
import axiosInstance from '@/services/axiosService.ts'

class HouseholdService {

  /**
   * Fetches the details of the authenticated user's household.
   *
   * @returns A promise that resolves to the household details.
   */
  async getMyHouseholdDetails() {
    const response = await axiosInstance.get('/household')
    return response.data
  }

}

const householdService = new HouseholdService()
export default householdService
