<script setup lang="ts">
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import { mapboxConfig } from '@/config/mapboxConfig'
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const mapContainer = ref<HTMLElement | null>(null)
let map: mapboxgl.Map | null = null

const mapboxglCasted = mapboxgl as unknown as typeof import('mapbox-gl')

onMounted(() => {
  try {
    if (!mapContainer.value) {
      console.error('Map container not found')
      return
    }

    if (!mapboxConfig.accessToken) {
      console.error('Mapbox API key is missing. Check your .env file for VITE_MAPBOX_API_KEY')
      return
    }

    mapboxgl.accessToken = mapboxConfig.accessToken

    map = new mapboxgl.Map({
      container: mapContainer.value,
      style: mapboxConfig.defaultStyle,
      center: mapboxConfig.defaultCenter as [number, number],
      zoom: mapboxConfig.defaultZoom,
    })

    map.addControl(new mapboxgl.NavigationControl())

    let popup: mapboxgl.Popup | null = null

    function createAddPoiPopup(lng: number, lat: number) {
      const popupContent = document.createElement('div')
      popupContent.innerHTML = `
        <button
          id="add-poi-button"
          style="color: white; border: none; padding: 6px 12px; cursor: pointer;"
        >
          Add Point Of Interest
        </button>
      `

      popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: true,
      })
        .setLngLat([lng, lat])
        .setDOMContent(popupContent)
        .addTo(map!)

      popupContent.querySelector('#add-poi-button')?.addEventListener('click', () => {
        window.location.href = `/admin/add/poi?lng=${lng}&lat=${lat}`
      })
    }

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat

      if (popup) {
        popup.remove()
        popup = null
        return
      }

      createAddPoiPopup(lng, lat)
    })

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxConfig.accessToken,
      mapboxgl: mapboxglCasted,
      marker: false,
      placeholder: 'Search for location',
    })

    geocoder.on('result', (e) => {
      const [lng, lat] = e.result.center || []

      if (isNaN(lng) || isNaN(lat)) {
        console.error('Invalid coordinates:', { lng, lat })
        return
      }

      if (popup) {
        popup.remove()
        popup = null
      }

      createAddPoiPopup(lng, lat)
    })

    map.addControl(geocoder, 'top-left')
  } catch (error) {
    console.error('Error initializing Mapbox:', error)
  }
})
</script>

<template>
  <main>
    <div ref="mapContainer" class="map-container"></div>
  </main>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
  position: relative;
  border: 1px solid slategrey;
  overflow: hidden;
}
</style>
