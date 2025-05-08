import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useLocationSharing } from '@/composables/useLocationSharing'
import axios from 'axios'
import * as vue from 'vue'

vi.mock('axios')

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onUnmounted: vi.fn()
  }
})

describe('useLocationSharing', () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn()
  }

  const originalSetInterval = window.setInterval
  const originalClearInterval = window.clearInterval

  beforeEach(() => {
    vi.clearAllMocks()

    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    })

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 59.9139,
          longitude: 10.7522
        }
      })
    })

    window.setInterval = vi.fn().mockReturnValue(123)
    window.clearInterval = vi.fn()

    vi.mocked(axios.post).mockResolvedValue({ data: {} })
  })

  afterEach(() => {
    window.setInterval = originalSetInterval
    window.clearInterval = originalClearInterval
  })

  it('should initialize with correct default values', () => {
    const { isSharing, error } = useLocationSharing()

    expect(isSharing.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('should start sharing location successfully', async () => {
    const { startSharing, isSharing } = useLocationSharing()

    await startSharing()

    expect(isSharing.value).toBe(true)
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1)
    expect(axios.post).toHaveBeenCalledWith(
      '/api/position/share',
      {
        latitude: 59.9139,
        longitude: 10.7522
      },
      { withCredentials: true }
    )
    expect(window.setInterval).toHaveBeenCalledTimes(1)
  })

  it('should use custom interval when provided', async () => {
    const customInterval = 60000
    const { startSharing } = useLocationSharing(customInterval)

    await startSharing()

    expect(window.setInterval).toHaveBeenCalledWith(expect.any(Function), customInterval)
  })

  it('should stop sharing location', async () => {
    const { startSharing, stopSharing, isSharing } = useLocationSharing()

    await startSharing()
    stopSharing()

    expect(isSharing.value).toBe(false)
    expect(window.clearInterval).toHaveBeenCalledWith(123)
  })

  it('should not start sharing if already sharing', async () => {
    const { startSharing } = useLocationSharing()

    await startSharing()

    vi.mocked(axios.post).mockClear()
    mockGeolocation.getCurrentPosition.mockClear()

    await startSharing()

    expect(mockGeolocation.getCurrentPosition).not.toHaveBeenCalled()
    expect(axios.post).not.toHaveBeenCalled()
  })

  it('should handle API error', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network error'))

    const { startSharing, error } = useLocationSharing()
    await startSharing()

    expect(error.value).toBe('Network error')
    expect(window.setInterval).toHaveBeenCalled()
  })

  it('should clean up on unmount', () => {
    useLocationSharing()

    const unmountCallback = vi.mocked(vue.onUnmounted).mock.calls[0][0]

    unmountCallback()

    expect(window.clearInterval).not.toHaveBeenCalled()
  })

  it('should clean up interval on unmount when sharing', async () => {
    const { startSharing } = useLocationSharing()
    await startSharing()

    const unmountCallback = vi.mocked(vue.onUnmounted).mock.calls[0][0]

    unmountCallback()

    expect(window.clearInterval).toHaveBeenCalledWith(123)
  })
})
