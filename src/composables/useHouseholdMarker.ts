import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import mapboxgl from 'mapbox-gl'
import { h, render } from 'vue'
import MapIcon from '@/components/map/MapIcon.vue'

interface HouseholdMarkerReturn {
  householdMarker: Ref<any>
  isHouseholdVisible: Ref<boolean>
  createHouseholdMarker: () => void
  navigateToHousehold: () => void
  initialize: () => Promise<void>
  flyToHome: () => void // Added new function for centering on home
}

export function useHouseholdMarker(
  map: Ref<mapboxgl.Map | null>,
  isMapLoaded: Ref<boolean>,
  isStyleLoaded: Ref<boolean>,
): HouseholdMarkerReturn {
  const userStore = useUserStore()
  const householdMarker = ref<mapboxgl.Marker | null>(null)
  const isHouseholdVisible = ref(false)
  const hasInitiallyNavigated = ref(false) // Track if we've already centered on home

  const createHouseholdMarker = () => {
    if (!userStore.getHouseholdLocation) {
      userStore.fetchUserInfo()
    }

    const location = userStore.getHouseholdLocation

    if (!location || !map.value) {
      console.error('Cannot create marker: location or map missing', {
        hasLocation: !!location,
        hasMap: !!map.value,
      })
      return
    }

    if (householdMarker.value) {
      householdMarker.value.remove()
    }

    const el = document.createElement('div')
    el.className = 'household-marker'

    const vNode = h(MapIcon, {
      type: 'household',
      size: 'small',
      withBackground: true,
    })
    render(vNode, el)

    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="popup-content">
          <h3>Your Household</h3>
          <p>Your registered home location</p>
        </div>
      `)

    householdMarker.value = new mapboxgl.Marker(el)
      .setLngLat([location.longitude, location.latitude])
      .setPopup(popup)
      .addTo(map.value)

    isHouseholdVisible.value = true

    // Auto center on home after creating marker if we haven't done so yet
    if (!hasInitiallyNavigated.value) {
      flyToHome()
      hasInitiallyNavigated.value = true
    }
  }

  const navigateToHousehold = () => {
    const location = userStore.getHouseholdLocation
    if (!location || !map.value) return

    map.value.flyTo({
      center: [location.longitude, location.latitude],
      zoom: 15,
      essential: true,
    })
  }

  // New function that centers the map on household location
  const flyToHome = () => {
    const location = userStore.getHouseholdLocation
    if (!location || !map.value) return

    map.value.flyTo({
      center: [location.longitude, location.latitude],
      zoom: 14, // Slightly zoomed out compared to navigate
      essential: true,
      duration: 1500, // Smooth animation
    })
  }

  const initialize = async () => {
    try {
      await userStore.fetchUserInfo()

      if (userStore.getHouseholdLocation && map.value && isMapLoaded.value && isStyleLoaded.value) {
        createHouseholdMarker()
      }

      watch(
        [isMapLoaded, isStyleLoaded, () => userStore.getHouseholdLocation],
        ([mapLoaded, styleLoaded, location]) => {
          if (mapLoaded && styleLoaded && location) {
            createHouseholdMarker()
          }
        },
        { immediate: true },
      )
    } catch (error) {
      console.error('Error initializing household marker:', error)
    }
  }

  return {
    householdMarker,
    isHouseholdVisible,
    createHouseholdMarker,
    navigateToHousehold,
    initialize,
    flyToHome, // Export the new function
  }
}
