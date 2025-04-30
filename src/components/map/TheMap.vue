<!-- src/components/map/TheMap.vue -->
<script setup lang="ts">
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ref, onMounted, watch, computed } from 'vue';
import { useMapInitialization } from '@/composables/useMapInitialization';
import { useMarkerManagement } from '@/composables/useMarkerManagement';
import { useMapLayers } from '@/composables/useMapLayers';
import { useSearchGeocoder } from '@/composables/useSearchGeocoder';
import type { LocationData } from '@/types/mapTypes';

// Sample location data
const locationData: LocationData = {
  hospitals: [
    { id: 'h1', name: 'Central Hospital', coordinates: [10.386908626620283, 63.41987409956735] },
    { id: 'h2', name: 'Regional Medical Center', coordinates: [10.431876, 63.445629] },
  ],
  shelters: [
    { id: 's1', name: 'Emergency Shelter A', coordinates: [10.401904909653808, 63.419437224860474] },
    { id: 's2', name: 'Community Center Shelter', coordinates: [10.397017368166019, 63.42698127994322] },
  ],
  defibrillators: [
    { id: 'd1', name: 'Station Defibrillator', coordinates: [10.388450983374923, 63.42901951877633] },
    { id: 'd2', name: 'Mall Defibrillator', coordinates: [10.39211011441759, 63.4211620329142] },
  ],
  waterStations: [
    { id: 'w1', name: 'Clean Water Station 1', coordinates: [10.423231833423785, 63.44108060012897] },
    { id: 'w2', name: 'Emergency Water Supply', coordinates: [10.394279400742164, 63.42409567600333] },
  ],
  foodCentrals: [
    { id: 'f1', name: 'Food Distribution Center', coordinates: [10.395070630744812, 63.42262371444579] },
    { id: 'f2', name: 'Community Kitchen', coordinates: [10.39876097991447, 63.431682219154595] },
  ],
  affectedAreas: [
    { id: 'a1', name: 'Nuclear accident', coordinates: [10.405876, 63.415629], radius: 500 },
    { id: 'a2', name: 'Landslide Area', coordinates: [10.41063276391543, 63.42678272573633], radius: 300 },
  ],
};

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
});

const filtersRef = computed(() => props.filters);

const mapContainer = ref<HTMLElement | null>(null);
const { map, isMapLoaded } = useMapInitialization(mapContainer);
const { markers, initializeMarkers } = useMarkerManagement(map, locationData, filtersRef);
const { initializeLayers } = useMapLayers(map, locationData.affectedAreas, filtersRef);
const { initializeSearch } = useSearchGeocoder(map, locationData, markers);

onMounted(() => {
  // Wait for the map to load before initializing components
  watch(isMapLoaded, (loaded) => {
    if (loaded) {
      initializeMarkers();
      initializeLayers();
      initializeSearch();
    }
  });
});

</script>

<template>
  <div ref="mapContainer" class="map-container">
  </div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
</style>
