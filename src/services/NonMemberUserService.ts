// src/services/NonMemberUserService.ts
import axios from 'axios'

interface AddNonUserMemberRequest {
  name: string
  type: string
}

interface DeleteNonUserMemberRequest {
  id: number
}

class NonMemberUserService {
  /**
   * Adds a non-user member to the household
   *
   * @param request Details of the non-user member to be added
   * @returns A promise that resolves to the response data
   */
  async addNonUserMember(request: AddNonUserMemberRequest) {
    const response = await axios.post('/api/non-user-member/add', request)
    return response.data
  }

  /**
   * Deletes a non-user member from the household
   *
   * @param id ID of the non-user member to delete
   * @returns A promise that resolves to the response data
   */
  async deleteNonUserMember(id: number) {
    const request: DeleteNonUserMemberRequest = { id }
    const response = await axios.delete('/api/non-user-member/delete', {
      data: request,
    })
    return response.data
  }

  /**
   * Gets all non-user members in the household
   *
   * @returns A promise that resolves to the list of non-user members
   */
  async getAllNonUserMembers() {
    const response = await axios.get('/api/non-user-member')
    return response.data
  }
}

const nonMemberUserService = new NonMemberUserService()
export default nonMemberUserService
