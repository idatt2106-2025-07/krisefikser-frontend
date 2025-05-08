import { ref, watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import { h, render } from 'vue'
import MapIcon from '@/components/map/MapIcon.vue'
import mapService from '@/services/mapService'
import type { HouseholdPosition } from '@/types/mapTypes'

interface HouseholdPositionsReturn {
  householdPositions: Ref<HouseholdPosition[]>
  positionMarkers: Ref<mapboxgl.Marker[]>
  fetchPositions: () => Promise<void>
  createPositionMarkers: () => void
  clearPositionMarkers: () => void
  startPositionTracking: () => void
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

  const fetchPositions = async () => {
    try {
      const positions = await mapService.getHouseholdMemberPositions()
      householdPositions.value = positions
      console.log('Household positions updated:', positions)
      return positions
    } catch (error) {
      console.error('Error fetching household positions:', error)
      return []
    }
  }

  const createPositionMarkers = () => {
    if (!map.value) {
      console.log('Map not available, cannot create position markers')
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

      positionMarkers.value.push(marker)
    })
  }

  const clearPositionMarkers = () => {
    positionMarkers.value.forEach((marker) => marker.remove())
    positionMarkers.value = []
  }

  const startPositionTracking = async () => {
    stopPositionTracking();

    console.log('Starting position tracking')
    isTrackingActive.value = true

    try {
      console.log('Fetching household positions...')
      const positions = await fetchPositions()
      console.log(`Fetched ${positions.length} household positions`)

      if (map.value && isMapLoaded.value && isStyleLoaded.value) {
        console.log('Map ready, creating markers immediately')
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

  const stopPositionTracking = () => {
    console.log('Stopping position tracking')
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

  //@ts-expect-error fix
  return {
    householdPositions,
    //@ts-expect-error fix
    positionMarkers,
    //@ts-expect-error fix
    fetchPositions,
    createPositionMarkers,
    clearPositionMarkers,
    startPositionTracking,
    stopPositionTracking,
    isTrackingActive,
  }
}
