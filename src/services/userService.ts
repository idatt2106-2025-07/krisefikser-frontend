import axios from 'axios'

class UserService {

  async getUserInfo() {
    const response = await axios.get('/api/user/profile', { withCredentials: true })
    return response.data
  }
}

const userService = new UserService()
export default userService
