import { ref, watch, createApp } from 'vue'
import type { Ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import { getTypeDisplayName } from '@/utils/mapUtils'
import type { LocationData, Filters, PointOfInterest } from '@/types/mapTypes'
import MapIcon from '@/components/map/MapIcon.vue'

interface SimpleMarker {
  remove(): void
  addTo(map: mapboxgl.Map): this
  setLngLat(lngLat: [number, number]): this
  setPopup(popup?: mapboxgl.Popup): this
}

export function useMarkerManagement(
  map: Ref<mapboxgl.Map | null>,
  locationData: Ref<LocationData>,
  filters: Ref<Filters>,
) {
  const markers = ref<SimpleMarker[]>([])

  const typeToFilterKey: Record<string, keyof Filters> = {
    HOSPITAL: 'hospital',
    SHELTER: 'shelter',
    DEFIBRILLATOR: 'defibrillator',
    WATER_STATION: 'water_station',
    FOOD_CENTRAL: 'food_central',
    MEETING_PLACE: 'meeting_place',
  }

  /**
   * Converts the point of interest type to lowercase to determine the marker type.
   *
   * @param poiType - The point of interest type string to convert
   * @returns The lowercase version of the point of interest type
   */
  const getMarkerType = (poiType: string): string => {
    return poiType.toLowerCase()
  }

  /**
   * Creates a custom marker element for a point of interest (POI) on a map.
   *
   * This function generates a DOM element and mounts a Vue component (`MapIcon`)
   * into it, allowing for a customizable marker appearance based on the provided
   * POI type and other properties.
   *
   * @param poiType - A string representing the type of the point of interest.
   *                  This determines the appearance of the marker.
   * @returns A DOM element containing the mounted `MapIcon` component,
   *          which can be used as a marker on a map.
   */
  const createMarker = (poiType: string) => {
    const el = document.createElement('div')

    const markerApp = createApp(MapIcon, {
      type: poiType,
      size: 'small',
      withBackground: true,
    })

    markerApp.mount(el)

    return el
  }

  /**
   * Initializes and adds markers to the map for each point of interest (POI) based on the provided location data.
   *
   * This function performs the following steps:
   * 1. Ensures the map instance is available.
   * 2. Clears any existing markers from the map.
   * 3. Iterates through the points of interest and adds markers for each POI that passes the filter criteria.
   * 4. Creates a custom marker element for each POI and attaches it to the map.
   * 5. Configures a popup for each marker with details about the POI, such as its type, description, opening hours, and contact information.
   *
   * Markers are only added for POIs whose types are enabled in the filters.
   */
  const initializeMarkers = () => {
    if (!map.value) return

    const mapInstance = map.value

    removeAllMarkers()

    locationData.value.pointsOfInterest.forEach((poi: PointOfInterest) => {
      const filterKey = typeToFilterKey[poi.type]

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

        marker.addTo(mapInstance)
        markers.value.push(marker)
      }
    })
  }

  /**
   * Updates the markers on the map. If the map instance is not available, the function exits early.
   * Calls `initializeMarkers` to refresh or initialize the markers on the map.
   */
  const updateMarkers = () => {
    if (!map.value) return
    initializeMarkers()
  }

  /**
   * Removes all markers from the map and clears the markers array.
   *
   * This function iterates through the `markers` array, removes each marker
   * from the map, and then resets the `markers` array to an empty state.
   */
  const removeAllMarkers = () => {
    markers.value.forEach((marker) => marker.remove())
    markers.value = []
  }

  watch(
    () => filters.value,
    (newFilters) => {
      if (!map.value) return

      updateMarkers()
    },
    { deep: true },
  )

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
