import mapboxgl from 'mapbox-gl'
import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { mapboxConfig } from '@/config/mapboxConfig'

declare global {
  interface Window {
    clearMapDirections: () => void
  }
}

interface DirectionsResult {
  routeGeometry: GeoJSON.LineString
  distance: number
  duration: number
  steps: Array<{
    instruction: string
    distance: number
    duration: number
  }>
}

interface MapInitializationReturn {
  map: Ref<mapboxgl.Map | null>
  isMapLoaded: Ref<boolean>
  isStyleLoaded: Ref<boolean>
  showDirections: (
    origin: [number, number],
    destination: [number, number],
  ) => Promise<DirectionsResult | null>
  clearDirections: () => void
}

export function useMapInitialization(
  containerRef: Ref<HTMLElement | null>,
): MapInitializationReturn {
  const map = ref<mapboxgl.Map | null>(null)
  const isMapLoaded = ref(false)
  const isStyleLoaded = ref(false)

  const currentRouteId = ref<string | null>(null)
  const currentMarkers = ref<mapboxgl.Marker[]>([])
  const directionsPopup = ref<mapboxgl.Popup | null>(null)

  /**
   * Clear any existing directions from the map
   */
  const clearDirections = () => {
    if (!map.value) return

    if (currentRouteId.value) {
      if (map.value.getLayer(`${currentRouteId.value}-layer`)) {
        map.value.removeLayer(`${currentRouteId.value}-layer`)
      }
      if (map.value.getSource(currentRouteId.value)) {
        map.value.removeSource(currentRouteId.value)
      }
      currentRouteId.value = null
    }

    currentMarkers.value.forEach((marker) => marker.remove())
    currentMarkers.value = []

    if (directionsPopup.value) {
      directionsPopup.value.remove()
      directionsPopup.value = null
    }
  }

  /**
   * Get and display directions between two points using Mapbox Directions API
   * @param origin Starting point coordinates [lng, lat]
   * @param destination Ending point coordinates [lng, lat]
   * @returns Promise containing directions data or null if error occurred
   */
  const showDirections = async (
    origin: [number, number],
    destination: [number, number],
  ): Promise<DirectionsResult | null> => {
    if (!map.value) return null

    try {
      clearDirections()

      currentRouteId.value = `route-${Date.now()}`

      const profile = 'walking'
      const url =
        `https://api.mapbox.com/directions/v5/mapbox/${profile}/` +
        `${origin[0]},${origin[1]};${destination[0]},${destination[1]}` +
        `?steps=true&geometries=geojson&overview=full&access_token=${mapboxConfig.accessToken}`

      const response = await fetch(url)
      const data = await response.json()

      if (!data.routes || data.routes.length === 0) {
        console.error('No routes found', data)
        return null
      }

      const route = data.routes[0]
      const routeGeometry = route.geometry

      map.value.addSource(currentRouteId.value, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: routeGeometry,
        },
      })

      map.value.addLayer({
        id: `${currentRouteId.value}-layer`,
        type: 'line',
        source: currentRouteId.value,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#0080ff',
          'line-width': 5,
          'line-opacity': 0.75,
        },
      })

      const startMarker = new mapboxgl.Marker({ color: '#00cc00' })
        .setLngLat(origin)
        .setPopup(new mapboxgl.Popup().setHTML('<strong>Starting Point</strong>'))
        .addTo(map.value as unknown as mapboxgl.Map)

      const endMarker = new mapboxgl.Marker({ color: '#ff3300' })
        .setLngLat(destination)
        .setPopup(new mapboxgl.Popup().setHTML('<strong>Destination</strong>'))
        .addTo(map.value as unknown as mapboxgl.Map)

      //@ts-expect-error fix
      currentMarkers.value.push(startMarker, endMarker)

      const bounds = new mapboxgl.LngLatBounds().extend(origin).extend(destination)

      for (const coord of routeGeometry.coordinates) {
        bounds.extend(coord as [number, number])
      }

      map.value.fitBounds(bounds, {
        padding: 80,
        maxZoom: 15,
      })

      const result: DirectionsResult = {
        routeGeometry,
        distance: route.distance,
        duration: route.duration,
        steps: route.legs[0].steps.map(
          (step: { maneuver: { instruction: string }; distance: number; duration: number }) => ({
            instruction: step.maneuver.instruction,
            distance: step.distance,
            duration: step.duration,
          }),
        ),
      }

      const minutes = Math.round(route.duration / 60)
      const distance = (route.distance / 1000).toFixed(1)

      directionsPopup.value = new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(destination)
        .setHTML(
          `
          <div class="directions-summary">
            <h3>Directions</h3>
            <h4>Distance:</strong> ${distance} km</h4>
            <h4>Duration:</strong> ${minutes} minutes</h4>
            <button class="close-directions-btn" onclick="window.clearMapDirections()">Close Directions</button>
          </div>
        `,
        )
        .addTo(map.value as unknown as mapboxgl.Map)

      window.clearMapDirections = clearDirections
      return result
    } catch (error) {
      console.error('Error fetching directions:', error)
      return null
    }
  }

  onMounted(() => {
    if (!containerRef.value) {
      console.error('Map container not found')
      return
    }

    if (!mapboxConfig.accessToken) {
      console.error('Mapbox API key is missing. Check your .env file for VITE_MAPBOX_API_KEY')
      return
    }

    mapboxgl.accessToken = mapboxConfig.accessToken

    map.value = new mapboxgl.Map({
      container: containerRef.value,
      style: mapboxConfig.defaultStyle,
      center: mapboxConfig.defaultCenter as [number, number],
      zoom: mapboxConfig.defaultZoom,
    })

    map.value.addControl(new mapboxgl.NavigationControl())

    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    })

    map.value.addControl(geolocateControl)

    map.value.on('load', () => {
      isMapLoaded.value = true
    })

    map.value.on('style.load', () => {
      isStyleLoaded.value = true
    })
  })

  onUnmounted(() => {
    clearDirections()
    if (map.value) {
      map.value.remove()
    }
  })
  // @ts-expect-error fix
  return {
    // @ts-expect-error fix
    map,
    isMapLoaded,
    isStyleLoaded,
    showDirections,
    clearDirections,
  }
}
