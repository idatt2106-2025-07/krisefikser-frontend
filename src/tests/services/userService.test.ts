import { describe, it, expect, vi, beforeEach } from 'vitest'
import userService from '@/services/userService'
import axios from 'axios'

vi.mock('axios')

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserInfo', () => {
    it('should fetch user info successfully', async () => {
      const mockUserData = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'ROLE_NORMAL',
        householdLatitude: 59.9139,
        householdLongitude: 10.7522
      }

      vi.mocked(axios.get).mockResolvedValueOnce({
        data: mockUserData,
        status: 200
      })

      const result = await userService.getUserInfo()

      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.get).toHaveBeenCalledWith('/api/user/profile', { withCredentials: true })
      expect(result).toEqual(mockUserData)
    })

    it('should handle API error when fetching user info', async () => {
      const errorMessage = 'Network Error'
      vi.mocked(axios.get).mockRejectedValueOnce(new Error(errorMessage))

      await expect(userService.getUserInfo()).rejects.toThrow(errorMessage)
      expect(axios.get).toHaveBeenCalledWith('/api/user/profile', { withCredentials: true })
    })

    it('should handle empty response data', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: null,
        status: 200
      })

      const result = await userService.getUserInfo()

      expect(result).toBeNull()
    })

    it('should handle 401 unauthorized error', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }
      vi.mocked(axios.get).mockRejectedValueOnce(error)

      await expect(userService.getUserInfo()).rejects.toEqual(error)
    })
  })
})
