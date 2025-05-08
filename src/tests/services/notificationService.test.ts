import { describe, it, expect, vi, beforeEach } from 'vitest'
import notificationService from '@/services/notificationService'
import axiosInstance from '@/services/axiosService'

// Mock the axios instance
vi.mock('@/services/axiosService', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getExpiringStorageItems', () => {
    it('calls the correct API endpoint', async () => {
      // Mock the axios response
      const mockResponse = { data: [{ id: 1, name: 'Test Item' }] }
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse)

      // Call the service method
      await notificationService.getExpiringStorageItems()

      // Verify the correct endpoint was called
      expect(axiosInstance.get).toHaveBeenCalledWith('/storage-items/household/expiring')
    })

    it('returns the data from the response', async () => {
      // Mock data
      const mockData = [
        {
          id: 1,
          expirationDate: '2023-01-01',
          item: { name: 'Test Item', type: 'FOOD' },
        },
      ]

      // Mock the axios response
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData })

      // Call the service method
      const result = await notificationService.getExpiringStorageItems()

      // Verify the result is the response data
      expect(result).toEqual(mockData)
    })

    it('throws an error when the API call fails', async () => {
      // Mock a failed response
      const error = new Error('Network Error')
      vi.mocked(axiosInstance.get).mockRejectedValue(error)

      // Verify the error is thrown
      await expect(notificationService.getExpiringStorageItems()).rejects.toThrow('Network Error')
    })
  })

  describe('getIncidents', () => {
    it('calls the correct API endpoint', async () => {
      // Mock the axios response
      const mockResponse = { data: [{ message: 'Test Incident' }] }
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse)

      // Call the service method
      await notificationService.getIncidents()

      // Verify the correct endpoint was called
      expect(axiosInstance.get).toHaveBeenCalledWith('/notification/incidents')
    })

    it('returns the data from the response', async () => {
      // Mock data
      const mockData = [{ message: 'Test Incident' }]

      // Mock the axios response
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData })

      // Call the service method
      const result = await notificationService.getIncidents()

      // Verify the result is the response data
      expect(result).toEqual(mockData)
    })

    it('throws an error when the API call fails', async () => {
      // Mock a failed response
      const error = new Error('API Error')
      vi.mocked(axiosInstance.get).mockRejectedValue(error)

      // Verify the error is thrown
      await expect(notificationService.getIncidents()).rejects.toThrow('API Error')
    })
  })
})
