import { describe, it, expect, vi, beforeEach } from 'vitest'
import mapService from '@/services/mapService'
import axiosInstance from '@/services/axiosService'

vi.mock('@/services/axiosService', () => ({
  default: {
    get: vi.fn()
  }
}))

describe('MapService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPointsOfInterest', () => {
    it('should call axios with correct endpoint and parameters', async () => {
      const mockResponse = {
        data: [
          { id: 1, type: 'HOSPITAL', latitude: 10, longitude: 20 },
          { id: 2, type: 'SHELTER', latitude: 30, longitude: 40 }
        ]
      }

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse)

      const filters = ['hospital', 'shelter']

      const result = await mapService.getPointsOfInterest(filters)

      expect(axiosInstance.get).toHaveBeenCalledWith('/point-of-interest', {
        params: { types: 'hospital,shelter' }
      })

      expect(result).toEqual(mockResponse.data)
    })

    it('should handle empty filters array', async () => {
      const mockResponse = { data: [] }
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse)

      const result = await mapService.getPointsOfInterest([])

      expect(axiosInstance.get).toHaveBeenCalledWith('/point-of-interest', {
        params: { types: '' }
      })

      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getAffectedAreas', () => {
    it('should call axios with correct endpoint', async () => {
      const mockResponse = {
        data: [
          { id: 1, latitude: 10, longitude: 20, description: 'Flood', severityLevel: 'High' },
          { id: 2, latitude: 30, longitude: 40, description: 'Wildfire', severityLevel: 'Medium' }
        ]
      }

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse)

      const result = await mapService.getAffectedAreas()

      expect(axiosInstance.get).toHaveBeenCalledWith('/affected-area')

      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getAllPointsOfInterest', () => {
    it('should call axios with all predefined types', async () => {
      const mockResponse = {
        data: [
          { id: 1, type: 'HOSPITAL', latitude: 10, longitude: 20 },
          { id: 2, type: 'SHELTER', latitude: 30, longitude: 40 },
          { id: 3, type: 'DEFIBRILLATOR', latitude: 50, longitude: 60 }
        ]
      }

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse)

      const result = await mapService.getAllPointsOfInterest()

      expect(axiosInstance.get).toHaveBeenCalledWith('/point-of-interest', {
        params: {
          types: 'hospital,shelter,defibrillator,water_station,food_central,meeting_place'
        }
      })

      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('error handling', () => {
    it('should propagate errors from axios for getPointsOfInterest', async () => {
      const mockError = new Error('Network Error')
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(mockError)

      await expect(mapService.getPointsOfInterest(['hospital'])).rejects.toThrowError(mockError)
    })

    it('should propagate errors from axios for getAffectedAreas', async () => {
      const mockError = new Error('Server Error')
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(mockError)

      await expect(mapService.getAffectedAreas()).rejects.toThrowError(mockError)
    })

    it('should propagate errors from axios for getAllPointsOfInterest', async () => {
      const mockError = new Error('Timeout Error')
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(mockError)

      await expect(mapService.getAllPointsOfInterest()).rejects.toThrowError(mockError)
    })
  })
})
