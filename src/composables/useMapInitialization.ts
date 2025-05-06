import mapboxgl from 'mapbox-gl'
import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { mapboxConfig } from '@/config/mapboxConfig'

interface MapInitializationReturn {
  map: Ref<mapboxgl.Map | null>
  isMapLoaded: Ref<boolean>
  isStyleLoaded: Ref<boolean>
}

export function useMapInitialization(
  containerRef: Ref<HTMLElement | null>,
): MapInitializationReturn {
  const map = ref<mapboxgl.Map | null>(null)
  const isMapLoaded = ref(false)
  const isStyleLoaded = ref(false)

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
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });

    map.value.addControl(geolocateControl);

    map.value.on('load', () => {
      isMapLoaded.value = true
    })

    map.value.on('style.load', () => {
      isStyleLoaded.value = true
    })
  })

  onUnmounted(() => {
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
  }
}
