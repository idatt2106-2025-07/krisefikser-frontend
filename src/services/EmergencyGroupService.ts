// src/services/EmergencyGroupService.ts
import axios from 'axios'

/**
 * Interface for emergency group request
 */
interface EmergencyGroupRequest {
  name: string
  // Add other properties according to Java EmergencyGroupRequest
}

class EmergencyGroupService {
  /**
   * Retrieves the emergency group for the logged in user
   *
   * @returns A promise that resolves to the emergency group details
   */
  async getEmergencyGroup() {
    const response = await axios.get(`/api/emergency-groups`)
    return response.data
  }

  /**
   * Adds a new emergency group.
   *
   * @param request The emergency group request object
   * @returns A promise that resolves to the created emergency group
   */
  async addEmergencyGroup(request: EmergencyGroupRequest) {
    const response = await axios.post('/api/emergency-groups', request)
    return response.data
  }

  /**
   * Invites a household to an emergency group by its name.
   *
   * @param householdName The name of the household to invite
   */
  async inviteHouseholdByName(householdName: string) {
    const response = await axios.post(`/api/emergency-groups/invite/${householdName}`)
    return response.data
  }

  /**
   * Answers an invitation to join an emergency group.
   *
   * @param groupId The ID of the emergency group
   * @param isAccept Whether to accept or decline the invitation
   */
  async answerInvitation(groupId: number, isAccept: boolean) {
    const response = await axios.patch(`/api/emergency-groups/answer-invitation/${groupId}`, {
      isAccept,
    })
    return response.data
  }

  /**
   * Retrieves the list of invitations for the current user's household.
   *
   * @returns A promise that resolves to the list of invitations
   */
  async getInvitations() {
    const response = await axios.get('/api/emergency-groups/invitations')
    return response.data
  }
}

const emergencyGroupService = new EmergencyGroupService()
export default emergencyGroupService
