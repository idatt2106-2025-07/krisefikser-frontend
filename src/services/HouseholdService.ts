// src/services/HouseholdService.ts
import axios from 'axios'

class HouseholdService {
  /**
   * Fetches the details of the authenticated user's household.
   *
   * @returns A promise that resolves to the household details.
   */
  async getMyHouseholdDetails() {
    const response = await axios.get('/api/households')
    return response.data
  }

  async leaveAndCreateHousehold(householdRequest: {
    name: string
    longitude: number
    latitude: number
  }) {
    const response = await axios.post('/api/households', householdRequest)
    return response.data
  }

  async requestToJoinHousehold(householdId: number) {
    const response = await axios.post('/api/households/join-request', {
      householdId,
    })
    return response.data
  }

  async getJoinRequests() {
    const response = await axios.get('/api/households/requests')
    return response.data
  }

  async acceptJoinRequest(requestId: number) {
    await axios.put(`/api/households/requests/${requestId}/accept`)
  }

  async declineJoinRequest(requestId: number) {
    await axios.put(`/api/households/requests/${requestId}/decline`)
  }

  async createInvitation(email: string) {
    const response = await axios.post('/api/household-invitations', { email })
    return response.data
  }

  async verifyInvitation(token: string) {
    const response = await axios.get('/api/household-invitations/verify', {
      params: { token },
    })
    return response.data
  }

  async acceptInvitation(token: string) {
    const response = await axios.post('/api/household-invitations/accept', { token })
    return response.data
  }
}

const householdService = new HouseholdService()
export default householdService
