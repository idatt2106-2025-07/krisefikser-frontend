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
      popupContent.style.display = 'flex'
      popupContent.style.flexDirection = 'column'
      popupContent.style.alignItems = 'stretch'
      popupContent.style.padding = '10px'
      popupContent.style.backgroundColor = 'white'
      popupContent.style.borderRadius = '6px'
      popupContent.style.boxSizing = 'border-box'
      popupContent.style.width = '180px'

      const poiButton = document.createElement('button')
      poiButton.id = 'add-poi-button'
      poiButton.textContent = 'Add Point Of Interest'
      poiButton.style.backgroundColor = '#007bff'
      poiButton.style.color = 'white'
      poiButton.style.border = 'none'
      poiButton.style.padding = '10px'
      poiButton.style.marginBottom = '8px'
      poiButton.style.cursor = 'pointer'
      poiButton.style.borderRadius = '4px'
      poiButton.style.width = '100%'

      const affectedAreaButton = document.createElement('button')
      affectedAreaButton.id = 'add-affected-area-button'
      affectedAreaButton.textContent = 'Add Affected Area'
      affectedAreaButton.style.backgroundColor = '#007bff'
      affectedAreaButton.style.color = 'white'
      affectedAreaButton.style.border = 'none'
      affectedAreaButton.style.padding = '10px'
      affectedAreaButton.style.cursor = 'pointer'
      affectedAreaButton.style.borderRadius = '4px'
      affectedAreaButton.style.width = '100%'

      popupContent.appendChild(poiButton)
      popupContent.appendChild(affectedAreaButton)

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
      popupContent.querySelector('#add-affected-area-button')?.addEventListener('click', () => {
        window.location.href = `/admin/add/affected-area?lng=${lng}&lat=${lat}`
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
