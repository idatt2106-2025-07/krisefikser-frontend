import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import { createSearchableGeoJSON } from '@/utils/mapUtils'
import type { LocationData } from '@/types/mapTypes'

export function useSearchGeocoder(
  map: Ref<mapboxgl.Map | null>,
  locationData: Ref<LocationData>,
  markers: Ref<mapboxgl.Marker[]>,
  emit?: (event: string, payload: any) => void,
) {
  const geocoder = ref<MapboxGeocoder | null>(null)

/**
   * Initializes the search functionality on the map using Mapbox Geocoder.
   *
   * This function sets up a custom geocoder with a local geocoding function,
   * custom rendering for search results, and integrates it with the map.
   * It also handles the selection of a point of interest (POI) by zooming
   * to the location and toggling the popup for the corresponding marker.
   */
  const initializeSearch = () => {
    if (!map.value) return

    geocoder.value = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken || '',
      mapboxgl: mapboxgl as any,
      placeholder: 'Search locations...',
      localGeocoder: (query): any[] => customGeocoder(query, locationData.value),
      render: (item) => {
        if (item.properties && item.properties.title) {
          const name = item.properties.title
          const category = item.properties.description || ''
          return `<div class="geocoder-result">
            <strong>${name}</strong>
            <span>${category}</span>
          </div>`
        } else {
          const name = item.text || ''
          const placeName = item.place_name || ''

          return `<div class="geocoder-result global-location">
            <strong>${name}</strong>
            <span class="location-details">${placeName}</span>
          </div>`
        }
      },
      localGeocoderOnly: false,
    })

    map.value.addControl(geocoder.value, 'top-left')

    geocoder.value.on('result', (event) => {
      if (event.result && event.result.geometry) {
        const coordinates = event.result.geometry.coordinates
        console.log('Search result coordinates:', coordinates)

        if (emit) {
          emit('search-result', { lng: coordinates[0], lat: coordinates[1] })
        }

        map.value?.flyTo({
          center: coordinates,
          zoom: 15,
          essential: true,
        })
      }
    })
  }

/**
   * Filters and returns a list of GeoJSON features that match the given query string.
   *
   * @param query - The search string to filter GeoJSON features. Must be at least 2 characters long.
   * @param data - The location data used to create a searchable GeoJSON object.
   * @returns An array of GeoJSON features whose `title` or `description` properties contain the query string.
   */
  const customGeocoder = (query: string, data: LocationData) => {
    if (!query || query.length < 2) return []

    const geoJSON = createSearchableGeoJSON(data)
    const lowerQuery = query.toLowerCase()

    return geoJSON.features.filter((feature) => {
      const title = (feature.properties?.title || '').toLowerCase()
      const description = (feature.properties?.description || '').toLowerCase()

      if (title.includes(lowerQuery) || description.includes(lowerQuery)) {
        // @ts-expect-error fix
        feature.place_name = feature.properties?.title || 'Location'
        // @ts-expect-error fix
        feature.text = feature.properties?.title || 'Location'
        return true
      }
      return false
    })
  }

  watch(
    () => locationData.value,
    () => {
      if (geocoder.value) {
        geocoder.value.setProximity(undefined as any)
      }
    },
    { deep: true },
  )

  return {
    geocoder,
    initializeSearch,
  }
}
