import { ref, onUnmounted } from 'vue'
import axios from 'axios'

interface LocationSharingReturn {
  isSharing: Readonly<import('vue').Ref<boolean>>
  startSharing: () => void
  stopSharing: () => void
  error: import('vue').Ref<string | null>
}

export function useLocationSharing(intervalMs = 30000): LocationSharingReturn {
  const isSharing = ref(false)
  const error = ref<string | null>(null)
  let intervalId: number | null = null

  /**
   * Shares the user's current geographical position with the server.
   *
   * This function retrieves the user's current location using `getCurrentPosition`
   * and sends the latitude and longitude to the `/api/position/share` endpoint via a POST request.
   * If the operation is successful, any existing error is cleared. If an error occurs,
   * it is captured and logged to the console.
   *
   * @async
   * @function
   * @throws {Error} If there is an issue retrieving the position or sending the data.
   */
  const sharePosition = async () => {
    try {
      const position = await getCurrentPosition()

      await axios.post(
        '/api/position/share',
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        { withCredentials: true },
      )

      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error sharing location'
      console.error('Location sharing error:', error.value)
    }
  }

  /**
   * Retrieves the current geographical position of the user's device.
   *
   * This function returns a promise that resolves with the `GeolocationPosition`
   * object containing the latitude, longitude, and other location details.
   *
   * @returns {Promise<GeolocationPosition>} A promise that resolves with the user's current position.
   *
   * @throws {Error} If geolocation is not supported by the browser.
   * @throws {Error} If an error occurs while retrieving the geolocation, with the error message included.
   */
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (err) => reject(new Error(`Geolocation error: ${err.message}`)),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      )
    })
  }

  const startSharing = async () => {
    if (isSharing.value) return

    try {
      isSharing.value = true

      await sharePosition()
      console.log('Location sharing started')
      intervalId = window.setInterval(sharePosition, intervalMs)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to start location sharing'
      isSharing.value = false
    }
  }

  const stopSharing = () => {
    if (intervalId) {
      window.clearInterval(intervalId)
      intervalId = null
    }
    isSharing.value = false
  }

  onUnmounted(() => {
    stopSharing()
  })

  return {
    isSharing,
    startSharing,
    stopSharing,
    error,
  }
}
