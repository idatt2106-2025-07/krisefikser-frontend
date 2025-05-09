// tests/unit/stores/readinessStore.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useReadinessStore } from '@/stores/readinessStore'
import itemService from '@/services/itemService'

// Mock the itemService module
vi.mock('@/services/itemService')

describe('Readiness Store', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance and reset all mocks for each test
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const store = useReadinessStore()

      expect(store.timeLeft).toEqual({
        days: 0,
        hours: 0,
      })
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('getReadinessLevel Action', () => {
    it('should successfully fetch readiness level', async () => {
      const mockData = { days: 3, hours: 12 }
      vi.mocked(itemService.getReadinessLevel).mockResolvedValue(mockData)

      const store = useReadinessStore()
      const result = await store.getReadinessLevel()

      expect(itemService.getReadinessLevel).toHaveBeenCalled()
      expect(result).toEqual(mockData)
      expect(store.error).toBeNull()
      expect(store.loading).toBe(false)
    })

    it('should handle errors properly', async () => {
      const mockError = new Error('Network error')
      vi.mocked(itemService.getReadinessLevel).mockRejectedValue(mockError)

      const store = useReadinessStore()
      const result = await store.getReadinessLevel()

      expect(itemService.getReadinessLevel).toHaveBeenCalled()
      expect(result).toBeUndefined()
      expect(store.error).toBe('Failed to get readiness level')
      expect(store.loading).toBe(false)
    })

    it('should set loading state correctly during execution', async () => {
      const mockData = { days: 1, hours: 6 }
      vi.mocked(itemService.getReadinessLevel).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return mockData
      })

      const store = useReadinessStore()

      // Check initial loading state
      expect(store.loading).toBe(false)

      const promise = store.getReadinessLevel()

      // Loading should be true during execution
      expect(store.loading).toBe(false)

      await promise

      // Loading should be false after completion
      expect(store.loading).toBe(false)
    })

    it('should update timeLeft when data is received', async () => {
      const mockData = { days: 0, hours: 0 }
      vi.mocked(itemService.getReadinessLevel).mockResolvedValue(mockData)

      const store = useReadinessStore()
      await store.getReadinessLevel()

      expect(store.timeLeft).toEqual(mockData)
    })
  })
})
