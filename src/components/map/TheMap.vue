<!-- src/components/map/TheMap.vue -->
<script setup lang="ts">
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { ref, onMounted, watch, computed, nextTick, shallowRef } from 'vue'
import { useMapInitialization } from '@/composables/useMapInitialization'
import { useMarkerManagement } from '@/composables/usePointsOfInterest'
import { useMapLayers } from '@/composables/useAffectedAreas'
import { useSearchGeocoder } from '@/composables/useSearchGeocoder'
import type { LocationData } from '@/types/mapTypes'
import mapService from '@/services/mapService'

// Use shallowRef to prevent deep reactivity
const locationData = shallowRef<LocationData>({
  pointsOfInterest: [],
  affectedAreas: [],
})

// This flag prevents user actions while loading
const isLoading = ref(false)
// Track previous filters to prevent duplicate calls
const prevFilters = ref<string[]>([])

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
  isHomePage: {
    type: Boolean,
    default: false,
    required: false
  }
})

const filtersRef = computed(() => props.filters)

const getEnabledFilters = (filters: Record<string, boolean>) => {
  return Object.keys(filters).filter((key) => filters[key] === true)
}

// Flags to coordinate data loading and map updates
const needsMarkerUpdate = ref(false)
const initialLoaded = ref(false)

// Define this function separately from the watcher
const fetchPointsOfInterest = async (filters: string[]) => {
  if (filters.length === 0) return

  try {
    isLoading.value = true
    console.log('Fetching POIs with filters:', filters)
    const response = await mapService.getPointsOfInterest(filters)

    // Create a new object to replace the old one
    const newData = {
      pointsOfInterest: response,
      affectedAreas: locationData.value.affectedAreas,
    }

    // Replace the entire object
    locationData.value = newData
    needsMarkerUpdate.value = true

    console.log('Data updated, will refresh markers on next tick')
  } catch (error) {
    console.error('Error fetching POIs:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchAllPointsOfInterest = async () => {
  try {
    isLoading.value = true
    console.log('Home page: Fetching all POIs')

    // Get all POIs without any filters
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

const fetchAffectedAreas = async () => {
  try {
    console.log('Fetching affected areas')
    const response = await mapService.getAffectedAreas()

    // Create a new object to replace the old one
    const newData = {
      pointsOfInterest: locationData.value.pointsOfInterest,
      affectedAreas: response,
    }

    // Replace the entire object
    locationData.value = newData
    console.log('Affected areas updated')

    // Make sure layers update
    if (map.value && isStyleLoaded.value) {
      tryInitializeLayers(3)
    }
  } catch (error) {
    console.error('Error fetching affected areas:', error)
  }
}

const isDebouncing = ref(false)

// Use a watcher with immediate false
watch(
  filtersRef,
  (newFilters) => {
    // Skip if loading
    if (isLoading.value || isDebouncing.value) return

    // Get filters except affected_areas
    const poiFilters = getEnabledFilters(newFilters).filter((f) => f !== 'affected_areas')

    // Skip if filters haven't changed
    const filtersStr = poiFilters.sort().join(',')
    const prevFiltersStr = prevFilters.value.sort().join(',')

    if (filtersStr === prevFiltersStr) {
      console.log('Skipping duplicate request with same filters')
      return
    }

    // Update prev filters now
    prevFilters.value = [...poiFilters]

    isDebouncing.value = true
    setTimeout(() => {
      isDebouncing.value = false
    }, 300)

    // Call fetch outside the watcher body
    fetchPointsOfInterest(poiFilters)
  },
  { deep: true },
)

const mapContainer = ref<HTMLElement | null>(null)
const { map, isMapLoaded, isStyleLoaded } = useMapInitialization(mapContainer)
const { markers, initializeMarkers, updateMarkers } = useMarkerManagement(
  map,
  locationData,
  filtersRef,
)
const { tryInitializeLayers, updateLayerVisibility } = useMapLayers(map, locationData, filtersRef)
const { initializeSearch } = useSearchGeocoder(map, locationData, markers)

// Watch for data changes to update markers
watch(needsMarkerUpdate, async (needsUpdate) => {
  if (needsUpdate && isMapLoaded.value) {
    console.log('Updating markers with new data')
    await nextTick()
    updateMarkers()
    needsMarkerUpdate.value = false
  }
})

watch(
  () => filtersRef.value.affected_areas,
  (showAffectedAreas) => {
    if (!map.value || !isMapLoaded.value) return

    console.log('Toggling affected areas visibility:', showAffectedAreas)
    updateLayerVisibility(showAffectedAreas)
  },
)

onMounted(() => {
  // Wait for both the map AND style to load before initializing
  watch([isMapLoaded, isStyleLoaded], ([mapLoaded, styleLoaded]) => {
    if (mapLoaded && styleLoaded) {
      console.log('Map and style loaded, initializing components')

      // Add a slight delay to ensure everything is ready
      setTimeout(() => {
        // Use the retry logic instead of direct initialization
        tryInitializeLayers(5) // Try up to 5 times with 200ms intervals
        initializeMarkers()
        if(!props.isHomePage) {
          initializeSearch()
        }

        // Initial load if we have filters
        if (!initialLoaded.value) {
          initialLoaded.value = true
          fetchAffectedAreas()

          // Simple conditional for home vs map page
          if (props.isHomePage) {
            fetchAllPointsOfInterest()
          } else {
            const poiFilters = getEnabledFilters(filtersRef.value)
              .filter(f => f !== 'affected_areas')

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
  height: 100%;
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
</style>
