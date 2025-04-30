import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import { createCustomMarker, getTypeDisplayName } from '@/utils/mapUtils'
import type { LocationData, Filters, PointOfInterest } from '@/types/mapTypes'

export function useMarkerManagement(
  map: Ref<mapboxgl.Map | null>,
  locationData: Ref<LocationData>,
  filters: Ref<Filters>,
) {
  const markers = ref<mapboxgl.Marker[]>([])

  const typeToFilterKey = {
    HOSPITAL: 'hospital',
    SHELTER: 'shelter',
    DEFIBRILLATOR: 'defibrillator',
    WATER_STATION: 'water_station',
    FOOD_CENTRAL: 'food_central',
  }

  const getMarkerType = (poiType: string): string => {
    return poiType.toLowerCase()
  }

  const initializeMarkers = () => {
    if (!map.value) return

    // Clear existing markers
    removeAllMarkers()

    // Add markers for each point of interest
    locationData.value.pointsOfInterest.forEach((poi) => {
      // Get filter key for this type
      const filterKey = typeToFilterKey[poi.type]

      // Check if this type is enabled in filters
      if (filters.value[filterKey] !== false) {
        const markerType = getMarkerType(poi.type)
        const el = createCustomMarker(markerType)
        el.setAttribute('data-id', poi.id.toString())
        el.setAttribute('data-type', poi.type)

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([poi.longitude, poi.latitude])
          .setPopup(
            new mapboxgl.Popup().setHTML(`
            <div class="popup-content">
              <h3>${getTypeDisplayName(poi.type)}</h3>
              <h4>${poi.description}</h4>
              ${poi.opensAt ? `<h4>Open: ${poi.opensAt} - ${poi.closesAt}</h4>` : ''}
              ${poi.contactNumber ? `<h4>Contact: ${poi.contactNumber}</h4>` : ''}
            </div>
          `),
          )

        marker.addTo(map.value)
        markers.value.push(marker)
      }
    })
  }

  const updateMarkers = () => {
    if (!map.value) return
    initializeMarkers()
  }

  const removeAllMarkers = () => {
    markers.value.forEach((marker) => marker.remove())
    markers.value = []
  }

  // Apply filters when they change
  watch(
    () => filters.value,
    (newFilters) => {
      if (!map.value) return

      // Remove all markers and re-add them based on current filters
      updateMarkers()
    },
    { deep: true },
  )

  // Update markers when data changes
  watch(
    () => locationData.value,
    () => {
      if (map.value) {
        updateMarkers()
      }
    },
    { deep: true },
  )

  return {
    markers,
    initializeMarkers,
    updateMarkers,
  }
}
