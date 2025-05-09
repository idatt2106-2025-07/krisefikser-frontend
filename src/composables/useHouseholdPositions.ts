import { ref, watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import { h, render } from 'vue'
import MapIcon from '@/components/map/MapIcon.vue'
import mapService from '@/services/mapService'
import type { HouseholdPosition } from '@/types/mapTypes'

interface HouseholdPositionsReturn {
  householdPositions: Ref<HouseholdPosition[]>
  positionMarkers: Ref<any[]>
  fetchPositions: () => Promise<HouseholdPosition[]>
  createPositionMarkers: () => void
  clearPositionMarkers: () => void
  startPositionTracking: () => Promise<void>
  stopPositionTracking: () => void
  isTrackingActive: Ref<boolean>
}

export function useHouseholdPositions(
  map: Ref<mapboxgl.Map | null>,
  isMapLoaded: Ref<boolean>,
  isStyleLoaded: Ref<boolean>,
): HouseholdPositionsReturn {
  const householdPositions = ref<HouseholdPosition[]>([])
  const positionMarkers = ref<mapboxgl.Marker[]>([])
  const isTrackingActive = ref(false)
  let trackingInterval: number | null = null

  /**
   * Fetches the positions of household members from the map service and updates the `householdPositions` state.
   * Logs the updated positions to the console upon success.
   * In case of an error, logs the error to the console and returns an empty array.
   *
   * @returns {Promise<any[]>} A promise that resolves to an array of household member positions.
   */
  const fetchPositions = async () => {
    try {
      const positions = await mapService.getHouseholdMemberPositions()
      householdPositions.value = positions
      return positions
    } catch (error) {
      console.error('Error fetching household positions:', error)
      return []
    }
  }

  /**
   * Creates position markers on the map for each household position.
   *
   * This function first checks if the map instance is available. If not, it logs a message
   * and exits early. It then clears any existing position markers before iterating over
   * the `householdPositions` array to create new markers.
   *
   */
  const createPositionMarkers = () => {
    if (!map.value) {
      console.error('Map not available, cannot create position markers')
      return
    }

    clearPositionMarkers()

    householdPositions.value.forEach((position) => {
      const el = document.createElement('div')
      el.className = 'household-member-marker'

      const vNode = h(MapIcon, {
        type: 'household_member',
        size: 'small',
        withBackground: true,
      })
      render(vNode, el)

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="popup-content">
          <h3>${position.name}</h3>
          <p>Household Member</p>
          <p>Last updated: ${new Date().toLocaleTimeString()}</p>
        </div>
      `)

      const marker = new mapboxgl.Marker(el)
        .setLngLat([position.longitude, position.latitude])
        .setPopup(popup)
        .addTo(map.value!)
      //@ts-expect-error fix
      positionMarkers.value.push(marker)
    })
  }

  /**
   * Clears all position markers from the map and resets the position markers array.
   *
   * This function iterates through the `positionMarkers` array, removes each marker
   * from the map, and then resets the array to an empty state.
   */
  const clearPositionMarkers = () => {
    positionMarkers.value.forEach((marker) => marker.remove())
    positionMarkers.value = []
  }

  const startPositionTracking = async () => {
    stopPositionTracking()

    isTrackingActive.value = true

    try {
      console.log('Fetching household positions...')
      const positions = await fetchPositions()

      if (map.value && isMapLoaded.value && isStyleLoaded.value) {
        createPositionMarkers()
      } else {
        console.log('Map not ready, will create markers when map loads')
      }

      trackingInterval = window.setInterval(async () => {
        try {
          await fetchPositions()
          if (map.value) createPositionMarkers()
        } catch (err) {
          console.error('Error in tracking interval:', err)
        }
      }, 30000)
    } catch (error) {
      console.error('Error starting position tracking:', error)
      isTrackingActive.value = false
    }
  }

  /**
   * Stops the position tracking process by clearing the tracking interval,
   * resetting the tracking state, and removing position markers.
   */
  const stopPositionTracking = () => {
    if (trackingInterval) {
      clearInterval(trackingInterval)
      trackingInterval = null
    }

    isTrackingActive.value = false
    clearPositionMarkers()
  }

  watch([isMapLoaded, isStyleLoaded], ([mapLoaded, styleLoaded]) => {
    if (mapLoaded && styleLoaded && isTrackingActive.value && householdPositions.value.length > 0) {
      createPositionMarkers()
    }
  })

  onUnmounted(() => {
    stopPositionTracking()
  })

  return {
    householdPositions,
    positionMarkers,
    fetchPositions,
    createPositionMarkers,
    clearPositionMarkers,
    startPositionTracking,
    stopPositionTracking,
    isTrackingActive,
  }
}
