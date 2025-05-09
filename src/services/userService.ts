import axios from 'axios'

class UserService {
  async getUserInfo() {
    const response = await axios.get('/api/user/profile', { withCredentials: true })
    return response.data
  }
  async updateLocationSharing(
    wantsToShare: boolean,
    latitude: number | null,
    longitude: number | null,
  ) {
    let response
    try {
      if (wantsToShare) {
        response = await axios.post(
          '/api/position/share',
          {
            latitude,
            longitude,
          },
          { withCredentials: true },
        )
      } else {
        response = await axios.delete('/api/position/delete', { withCredentials: true })
      }
    } catch (error) {
      console.error('Error updating sharing location:', error)
      throw error
    }

    return response.data
  }
}

const userService = new UserService()
export default userService
