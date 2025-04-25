<script setup lang="ts">
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import { mapboxConfig } from '@/config/mapboxConfig'
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const mapContainer = ref<HTMLElement | null>(null)
let map: mapboxgl.Map | null = null

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

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxConfig.accessToken,
      mapboxgl: mapboxgl,
      marker: true,
      placeholder: 'Search for location',
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
  position: relative; /* Required for Mapbox */
  border: 1px solid slategrey;
  margin-top: 20px;
  overflow: hidden;
}
</style>
