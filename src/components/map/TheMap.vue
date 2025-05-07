<script setup lang="ts">
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { ref, onMounted, watch, computed, nextTick, shallowRef } from 'vue'
import type { Ref } from 'vue'
import { useMapInitialization } from '@/composables/useMapInitialization'
import { useMarkerManagement } from '@/composables/usePointsOfInterest'
import { useMapLayers } from '@/composables/useAffectedAreas'
import { useSearchGeocoder } from '@/composables/useSearchGeocoder'
import type { LocationData } from '@/types/mapTypes'
import mapService from '@/services/mapService'

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
})

const filtersRef = computed(() => props.filters)

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
    console.log('Fetching POIs with filters:', filters)
    const response = await mapService.getPointsOfInterest(filters)

    const newData = {
      pointsOfInterest: response,
      affectedAreas: locationData.value.affectedAreas,
    }

    locationData.value = newData
    needsMarkerUpdate.value = true

    console.log('Data updated, will refresh markers on next tick')
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
    console.log('Home page: Fetching all POIs')

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
    console.log('Fetching affected areas')
    const response = await mapService.getAffectedAreas()

    const newData = {
      pointsOfInterest: locationData.value.pointsOfInterest,
      affectedAreas: response,
    }

    locationData.value = newData
    console.log('Affected areas updated')

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

    const poiFilters = getEnabledFilters(newFilters).filter((f) => f !== 'affected_areas')

    const filtersStr = poiFilters.sort().join(',')
    const prevFiltersStr = prevFilters.value.sort().join(',')

    if (filtersStr === prevFiltersStr) {
      console.log('Skipping duplicate request with same filters')
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
const { map, isMapLoaded, isStyleLoaded } = useMapInitialization(mapContainer)
const {
  markers,
  initializeMarkers,
  updateMarkers,
}: {
  markers: any
  initializeMarkers: () => void
  updateMarkers: () => void
} = useMarkerManagement(map as Ref<mapboxgl.Map | null>, locationData, filtersRef)
const { tryInitializeLayers, updateLayerVisibility } = useMapLayers(
  map as Ref<mapboxgl.Map | null>,
  locationData,
  filtersRef,
)
const { initializeSearch } = useSearchGeocoder(
  map as Ref<mapboxgl.Map | null>,
  locationData,
  markers,
)

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
 * onMounted function that initializes POI markers and affected area layers.
 * Waits for the map to be loaded.
 */
onMounted(() => {
  watch([isMapLoaded, isStyleLoaded], ([mapLoaded, styleLoaded]) => {
    if (mapLoaded && styleLoaded) {
      console.log('Map and style loaded, initializing components')

      setTimeout(() => {
        tryInitializeLayers(5)
        initializeMarkers()
        if (!props.isHomePage) {
          initializeSearch()
        }

        if (!initialLoaded.value) {
          initialLoaded.value = true
          fetchAffectedAreas()

          if (props.isHomePage) {
            fetchAllPointsOfInterest()
          } else {
            const poiFilters = getEnabledFilters(filtersRef.value).filter(
              (f) => f !== 'affected_areas',
            )

            if (poiFilters.length > 0) {
              fetchPointsOfInterest(poiFilters)
            }
          }
        }
      }, 100)
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

:deep(.popup-content p:last-of-type),
:deep(.popup-content h4:last-of-type) {
  margin-bottom: 0;
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
