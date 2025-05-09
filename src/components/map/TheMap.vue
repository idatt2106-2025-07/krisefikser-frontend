<script setup lang="ts">
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { ref, onMounted, watch, computed, nextTick, shallowRef } from 'vue'
import type { Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMapInitialization } from '@/composables/useMapInitialization'
import { useMarkerManagement } from '@/composables/usePointsOfInterest'
import { useMapLayers } from '@/composables/useAffectedAreas'
import { useSearchGeocoder } from '@/composables/useSearchGeocoder'
import { useAffectedAreaManagement } from '@/composables/useAffectedAreas'
import type { LocationData } from '@/types/mapTypes'
import mapService from '@/services/mapService'
import mapboxgl from 'mapbox-gl'
import { useHouseholdMarker } from '@/composables/useHouseholdMarker'
import { useHouseholdPositions } from '@/composables/useHouseholdPositions'

const locationData = shallowRef<LocationData>({
  pointsOfInterest: [],
  affectedAreas: [],
})

const isLoading = ref(false)
const prevFilters = ref<string[]>([])

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
  isHomePage: {
    type: Boolean,
    default: false,
    required: false,
  },
  isAdminPage: {
    type: Boolean,
    default: false,
    required: false,
  },
})

const emit = defineEmits(['map-click'])
const router = useRouter()

const filtersRef = computed(() => props.filters)
const isAdminPageRef = computed(() => props.isAdminPage)

/**
 * Returns a subset of filters where the value is true (enabled).
 *
 * @param {Record<string, boolean>} filters - An object with filter names as keys and their enabled status as boolean values
 * @returns {Record<string, boolean>} Object containing only the enabled filters
 */
const getEnabledFilters = (filters: Record<string, boolean>) => {
  return Object.keys(filters).filter((key) => filters[key] === true)
}

const needsMarkerUpdate = ref(false)
const initialLoaded = ref(false)

/**
 * Asynchronously fetches points of interest based on the specified filters.
 *
 * @param {string[]} filters - An array of filter strings to apply when fetching points of interest
 * @returns {Promise<any>} A promise that resolves with the fetched points of interest data
 * @throws {Error} Potentially throws errors if the fetch operation fails
 */
const fetchPointsOfInterest = async (filters: string[]) => {
  if (filters.length === 0) return

  try {
    isLoading.value = true
    const response = await mapService.getPointsOfInterest(filters)

    const newData = {
      pointsOfInterest: response,
      affectedAreas: locationData.value.affectedAreas,
    }

    locationData.value = newData
    needsMarkerUpdate.value = true
  } catch (error) {
    console.error('Error fetching POIs:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * Fetches all points of interest from the API
 *
 * This asynchronous function retrieves all points of interest data
 * that will be displayed on the map. It makes an API request and
 * likely updates the component's state with the fetched data.
 *
 * @async
 * @returns {Promise<Array>} A promise that resolves to an array of point of interest objects
 * @throws {Error} If the API request fails
 */
const fetchAllPointsOfInterest = async () => {
  try {
    isLoading.value = true

    const response = await mapService.getAllPointsOfInterest()

    locationData.value = {
      pointsOfInterest: response,
      affectedAreas: locationData.value.affectedAreas,
    }
    needsMarkerUpdate.value = true
  } catch (error) {
    console.error('Error fetching all POIs:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * Fetches data for affected areas to display on the map.
 * This async function retrieves geographical information about crisis-affected regions
 * from the backend service.
 *
 * @async
 * @function fetchAffectedAreas
 * @returns {Promise<Array>} A promise that resolves to an array of affected area objects
 */
const fetchAffectedAreas = async () => {
  try {
    const response = await mapService.getAffectedAreas()

    const newData = {
      pointsOfInterest: locationData.value.pointsOfInterest,
      affectedAreas: response,
    }

    locationData.value = newData

    if (map.value && isStyleLoaded.value) {
      tryInitializeLayers(3)
    }
  } catch (error) {
    console.error('Error fetching affected areas:', error)
  }
}

const isDebouncing = ref(false)

/**
 * Watcher that watches for changes in the filters and fetches new Points of interests based on filters.
 */
watch(
  filtersRef,
  (newFilters) => {
    if (isLoading.value || isDebouncing.value) return

    const poiFilters = getEnabledFilters(newFilters).filter(
      (f) => f !== 'affected_areas' && f !== 'household' && f !== 'household_member',
    )

    const filtersStr = poiFilters.sort().join(',')
    const prevFiltersStr = prevFilters.value.sort().join(',')

    if (filtersStr === prevFiltersStr) {
      return
    }

    prevFilters.value = [...poiFilters]

    isDebouncing.value = true
    setTimeout(() => {
      isDebouncing.value = false
    }, 300)

    fetchPointsOfInterest(poiFilters)
  },
  { deep: true },
)

const mapContainer = ref<HTMLElement | null>(null)
const { map, isMapLoaded, isStyleLoaded, showDirections, clearDirections } =
  useMapInitialization(mapContainer)
const markerManagement = useMarkerManagement(
  map as Ref<mapboxgl.Map | null>,
  locationData,
  filtersRef,
  isAdminPageRef,
  router,
) as unknown as {
  markers: any
  initializeMarkers: () => void
  updateMarkers: () => void
}

const { markers, initializeMarkers, updateMarkers } = markerManagement
const { tryInitializeLayers, updateLayerVisibility } = useMapLayers(
  map as Ref<mapboxgl.Map | null>,
  locationData,
  filtersRef,
  isAdminPageRef,
  router,
)
const { initializeSearch } = useSearchGeocoder(
  map as Ref<mapboxgl.Map | null>,
  locationData,
  markers,
  (event, payload) => {
    if (event === 'search-result') {
      const { lng, lat } = payload
      console.log('Search result received:', lng, lat)

      if (props.isAdminPage) {
        const existingPopup = document.querySelector('.mapboxgl-popup')
        if (existingPopup) {
          existingPopup.remove()
        }

        const popupContent = document.createElement('div')
        popupContent.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px; padding: 10px;">
            <button id="add-poi-button" style="padding: 8px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Add Point Of Interest
            </button>
            <button id="add-affected-area-button" style="padding: 8px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Add Affected Area
            </button>
          </div>
        `

        const popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: true,
        })
          .setLngLat([lng, lat])
          .setDOMContent(popupContent)
          .addTo(map.value!)

        popupContent.querySelector('#add-poi-button')?.addEventListener('click', () => {
          console.log('Navigating to Add POI View')
          emit('map-click', { lng, lat })
          router.push({
            path: '/admin/add/poi',
            query: { lng: lng.toString(), lat: lat.toString() },
          })
        })

        popupContent.querySelector('#add-affected-area-button')?.addEventListener('click', () => {
          console.log('Navigating to Add Affected Area View')
          emit('map-click', { lng, lat })
          router.push({
            path: '/admin/add/affected-area',
            query: { lng: lng.toString(), lat: lat.toString() },
          })
        })
      } else {
        map.value?.flyTo({
          center: [lng, lat],
          zoom: 15,
          essential: true,
        })
      }
    }
  },
)

const { initializeAffectedAreaPopups } = useAffectedAreaManagement(
  map as Ref<mapboxgl.Map | null>,
  locationData,
  isAdminPageRef,
  router,
)
const {
  householdMarker,
  isHouseholdVisible,
  navigateToHousehold,
  createHouseholdMarker,
  initialize: initializeHouseholdMarker,
} = useHouseholdMarker(map, isMapLoaded, isStyleLoaded)
const { householdPositions, isTrackingActive, startPositionTracking, stopPositionTracking } =
  useHouseholdPositions(map, isMapLoaded, isStyleLoaded)

const navigateToPOI = async (poi: {
  longitude: number
  latitude: number
  description?: string
  id?: number
  type?: string
}) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin: [number, number] = [position.coords.longitude, position.coords.latitude]
        const destination: [number, number] = [poi.longitude, poi.latitude]

        showDirections(origin, destination).then((result) => {
          if (result) {
          }
        })
      },
      (error) => {
        console.error('Error getting user location:', error)
        map.value?.flyTo({ center: [poi.longitude, poi.latitude], zoom: 15 })
      },
    )
  } else {
    map.value?.flyTo({ center: [poi.longitude, poi.latitude], zoom: 15 })
  }
}

/**
 * Watcher that checks if the markers need updating.
 */
watch(needsMarkerUpdate, async (needsUpdate) => {
  if (needsUpdate && isMapLoaded.value) {
    await nextTick()
    updateMarkers()
    needsMarkerUpdate.value = false
  }
})

/**
 * Watcher that checks the filter for affected areas, and toggles visibility.
 */
watch(
  () => filtersRef.value.affected_areas,
  (showAffectedAreas) => {
    if (!map.value || !isMapLoaded.value) return
    updateLayerVisibility(showAffectedAreas)
  },
)

/**
 * Watcher that checks the filter for household and toggles filter
 */
watch(
  () => filtersRef.value.household,
  (showHousehold) => {
    if (!map.value || !isMapLoaded.value) return

    if (showHousehold) {
      createHouseholdMarker()
    } else {
      if (householdMarker.value) {
        householdMarker.value.remove()
        isHouseholdVisible.value = false
      }
    }
  },
)

/**
 * Watcher that checks the filter for household member positions
 */
watch(
  () => filtersRef.value.household_member,
  (showPositions) => {
    stopPositionTracking()
    if (showPositions) {
      nextTick(() => {
        startPositionTracking()
      })
    }
  },
)

/**
 * onMounted function that initializes POI markers and affected area layers.
 * Waits for the map to be loaded.
 */
onMounted(() => {
  watch([isMapLoaded, isStyleLoaded], async ([mapLoaded, styleLoaded]) => {
    if (mapLoaded && styleLoaded) {
      // First, check if user is logged in and get household coordinates before other initializations
      await initializeHouseholdMarker()

      // If household marker exists, center map on it
      if (householdMarker.value && isHouseholdVisible.value) {
        const coordinates = householdMarker.value.getLngLat()
        map.value?.flyTo({
          center: [coordinates.lng, coordinates.lat],
          zoom: 9,
          essential: true,
        })
      }

      setTimeout(() => {
        if (filtersRef.value.household_positions) {
          startPositionTracking()
        }
        tryInitializeLayers(5)
        initializeMarkers()
        initializeAffectedAreaPopups()

        if (!props.isHomePage) {
          initializeSearch()
        }

        if (!initialLoaded.value) {
          initialLoaded.value = true
          fetchAffectedAreas()
        }

        if (props.isHomePage || props.isAdminPage) {
          fetchAllPointsOfInterest()
        } else {
          const poiFilters = getEnabledFilters(filtersRef.value).filter(
            (f) => f !== 'affected_areas' && f !== 'household' && f !== 'household_member',
          )

          if (poiFilters.length > 0) {
            fetchPointsOfInterest(poiFilters)
          }
        }

        if (props.isAdminPage) {
          map.value?.on('click', (e: mapboxgl.MapMouseEvent) => {
            const { lng, lat } = e.lngLat
            console.log('Admin map click at:', lng, lat)

            const existingPopup = document.querySelector('.mapboxgl-popup')
            if (existingPopup) {
              existingPopup.remove()
            }

            const popupContent = document.createElement('div')
            popupContent.innerHTML = `
              <div style="display: flex; flex-direction: column; gap: 8px; padding: 10px;">
                <button id="add-poi-button" style="padding: 8px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                  Add Point Of Interest
                </button>
                <button id="add-affected-area-button" style="padding: 8px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                  Add Affected Area
                </button>
              </div>
            `

            const popup = new mapboxgl.Popup({
              closeButton: true,
              closeOnClick: true,
            })
              .setLngLat([lng, lat])
              .setDOMContent(popupContent)
              .addTo(map.value!)

            popupContent.querySelector('#add-poi-button')?.addEventListener('click', () => {
              console.log('Navigating to Add POI View')
              emit('map-click', { lng, lat })
              router.push({
                path: '/admin/add/poi',
                query: { lng: lng.toString(), lat: lat.toString() },
              })
            })

            popupContent
              .querySelector('#add-affected-area-button')
              ?.addEventListener('click', () => {
                console.log('Navigating to Add Affected Area View')
                emit('map-click', { lng, lat })
                router.push({
                  path: '/admin/add/affected-area',
                  query: { lng: lng.toString(), lat: lat.toString() },
                })
              })
          })
        }
      }, 100)

      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        if (target.classList.contains('directions-btn')) {
          const lngAttr = target.getAttribute('data-lng') || '0'
          const latAttr = target.getAttribute('data-lat') || '0'

          const lng = parseFloat(lngAttr)
          const lat = parseFloat(latAttr)

          navigateToPOI({
            longitude: lng,
            latitude: lat,
          })

          // Prevent any additional handling
          e.preventDefault()
          e.stopPropagation()
        }
      })
    }
  })
})
</script>

<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map-container"></div>
    <div v-if="props.isHomePage" class="map-nav-button">
      <router-link to="/map" class="btn-expand-map">
        <span class="icon">⛶</span>
        <span class="text">Full Map</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}

.map-nav-button {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
}

.btn-expand-map {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 12px;
  width: 100%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-expand-map:hover {
  background-color: #f5f5f5;
}

.btn-expand-map .icon {
  font-size: 18px;
}

:deep(.mapboxgl-popup-content) {
  padding: 12px;
  display: flex;
  gap: 10px;
}

:deep(.popup-content h3) {
  font-size: 18px;
}

:deep(.popup-content p) {
  font-size: 14px;
  text-align: left;
}

:deep(.popup-content h4) {
  font-size: 14px;
}

:deep(.popup-content h3:first-of-type) {
  margin-top: 0;
}

:deep(.mapboxgl-ctrl-geocoder--input) {
  width: 100%;
  max-width: 240px !important;
  max-height: 36px !important;
}

:deep(.mapboxgl-ctrl-geocoder.mapboxgl-ctrl) {
  max-width: 240px !important;
  max-height: 36px !important;
}

:deep(.mapboxgl-ctrl-geocoder--icon.mapboxgl-ctrl-geocoder--icon-search) {
  max-width: 20px;
  max-height: 20px;
  top: 8px;
}
</style>
