import { ref, watch, createApp } from 'vue'
import type { Ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import { getTypeDisplayName } from '@/utils/mapUtils'
import type { LocationData, Filters, PointOfInterest } from '@/types/mapTypes'
import MapIcon from '@/components/map/MapIcon.vue'

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
    MEETING_PLACE: 'meeting_place',
  }

  const getMarkerType = (poiType: string): string => {
    return poiType.toLowerCase()
  }

  const createMarker = (poiType: string) => {
    // Create a wrapper element for the marker
    const el = document.createElement('div')

    // Mount our POIIcon component into this element
    const markerApp = createApp(MapIcon, {
      type: poiType,
      size: 'small',
      withBackground: true,
    })

    // Mount the app to the element
    markerApp.mount(el)

    return el
  }

  const initializeMarkers = () => {
    if (!map.value) return

    // Clear existing markers
    removeAllMarkers()

    // Add markers for each point of interest
    locationData.value.pointsOfInterest.forEach((poi: PointOfInterest) => {
      // Get filter key for this type
      const filterKey = typeToFilterKey[poi.type]

      // Check if this type is enabled in filters
      if (filters.value[filterKey] !== false) {
        const markerType = getMarkerType(poi.type)
        const el = createMarker(markerType)
        el.setAttribute('data-id', poi.id.toString())
        el.setAttribute('data-type', poi.type)

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([poi.longitude, poi.latitude])
          .setPopup(
            new mapboxgl.Popup().setHTML(`
            <div class="popup-content">
              <h3>${getTypeDisplayName(poi.type)}</h3>
              <p>${poi.description}</p>
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
