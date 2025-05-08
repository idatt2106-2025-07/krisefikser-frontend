// src/services/HouseholdService.ts
import axiosInstance from '@/services/axiosService.ts'

class HouseholdService {
  /**
   * Fetches the details of the authenticated user's household.
   *
   * @returns A promise that resolves to the household details.
   */
  async getMyHouseholdDetails() {
    const response = await axiosInstance.get('/households')
    return response.data
  }

  async leaveAndCreateHousehold(householdRequest: {
    name: string
    longitude: number
    latitude: number
  }) {
    const response = await axiosInstance.post('/households', householdRequest)
    return response.data
  }

  async requestToJoinHousehold(householdId: number) {
    const response = await axiosInstance.post('/households/join-request', {
      householdId,
    })
    return response.data
  }

  async getJoinRequests() {
    const response = await axiosInstance.get('/households/requests')
    return response.data
  }

  async acceptJoinRequest(requestId: number) {
    await axiosInstance.put(`/households/requests/${requestId}/accept`)
  }

  async declineJoinRequest(requestId: number) {
    await axiosInstance.put(`/households/requests/${requestId}/decline`)
  }

  async createInvitation(email: string) {
    const response = await axiosInstance.post('/household-invitations', { email })
    return response.data
  }

  async verifyInvitation(token: string) {
    const response = await axiosInstance.get('/household-invitations/verify', {
      params: { token },
    })
    return response.data
  }

  async acceptInvitation(token: string) {
    const response = await axiosInstance.post('/household-invitations/accept', { token })
    return response.data
  }
}

const householdService = new HouseholdService()
export default householdService
