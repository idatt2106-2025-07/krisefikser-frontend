<script setup lang="ts">
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { mapboxConfig } from '@/config/mapboxConfig';
import { ref, onMounted, watch } from 'vue';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Sample data - you would replace this with real data from an API
//10.405876, 63.415629]
const locationData = {
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
    { id: 'a1', name: 'Nuclear accident', coordinates: [10.405876, 63.415629], radius: 2000 },
    { id: 'a2', name: 'Landslide Area', coordinates: [10.41063276391543, 63.42678272573633], radius: 800 },
  ],
};

// Store markers by type for toggling visibility
const markers = ref({
  hospitals: [] as mapboxgl.Marker[],
  shelters: [] as mapboxgl.Marker[],
  defibrillators: [] as mapboxgl.Marker[],
  waterStations: [] as mapboxgl.Marker[],
  foodCentrals: [] as mapboxgl.Marker[],
});

// Store circle layers for affected areas
const circleLayers = ref<string[]>([]);

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
});

const mapContainer = ref<HTMLElement | null>(null);
let map: mapboxgl.Map;

// Watch for filter changes
watch(() => props.filters, (newFilters) => {
  if (map) {
    applyFilters(newFilters);
  }
}, { deep: true });

const applyFilters = (filters: Record<string, any>) => {
  console.log('Applying filters:', filters);

  // Show/hide hospital markers
  markers.value.hospitals.forEach(marker => {
    if (filters.hospital !== false) {
      marker.addTo(map!);
    } else {
      marker.remove();
    }
  });

  // Show/hide shelter markers
  markers.value.shelters.forEach(marker => {
    if (filters.shelter !== false) {
      marker.addTo(map!);
    } else {
      marker.remove();
    }
  });

  // Show/hide defibrillator markers
  markers.value.defibrillators.forEach(marker => {
    if (filters.defibrillator !== false) {
      marker.addTo(map!);
    } else {
      marker.remove();
    }
  });

  // Show/hide water station markers
  markers.value.waterStations.forEach(marker => {
    if (filters.waterStation !== false) {
      marker.addTo(map!);
    } else {
      marker.remove();
    }
  });

  // Show/hide food central markers
  markers.value.foodCentrals.forEach(marker => {
    if (filters.foodCentral !== false) {
      marker.addTo(map!);
    } else {
      marker.remove();
    }
  });

  // Show/hide affected areas
  circleLayers.value.forEach(layerId => {
    if (map && map.getLayer(layerId)) {
      if (filters.affectedAreas) {
        map.setLayoutProperty(layerId, 'visibility', 'visible');
      } else {
        map.setLayoutProperty(layerId, 'visibility', 'none');
      }
    }
  });
};

// Inside TheMap.vue script section
// Create custom marker elements
const createCustomMarker = (type: string) => {
  const el = document.createElement('div');

  // Base styles for all markers
  el.style.width = '30px';
  el.style.height = '30px';
  el.style.borderRadius = '50%';
  el.style.display = 'flex';
  el.style.justifyContent = 'center';
  el.style.alignItems = 'center';
  el.style.fontWeight = 'bold';
  el.style.color = 'white';

  // Different styles based on marker type
  switch (type) {
    case 'hospital':
      el.style.backgroundColor = '#ff4d4d'; // Red
      el.textContent = 'H';
      break;
    case 'shelter':
      el.style.backgroundColor = '#4da6ff'; // Blue
      el.textContent = 'S';
      break;
    case 'defibrillator':
      el.style.backgroundColor = '#ffcc00'; // Yellow
      el.textContent = 'D';
      break;
    case 'waterStation':
      el.style.backgroundColor = '#00ccff'; // Light blue
      el.textContent = 'W';
      break;
    case 'foodCentral':
      el.style.backgroundColor = '#66cc66'; // Green
      el.textContent = 'F';
      break;
    default:
      el.style.backgroundColor = '#808080'; // Gray
      el.textContent = '?';
  }

  return el;
};

// Inside TheMap.vue script section
// Initialize markers and add them to the map
const initializeMarkers = () => {
  if (!map) return;

  // Add hospital markers
  locationData.hospitals.forEach(hospital => {
    const el = createCustomMarker('hospital');
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(hospital.coordinates as [number, number])
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>${hospital.name}</h3>`));

    markers.value.hospitals.push(marker);

    if (props.filters.hospital) {
      marker.addTo(map);
    }
  });

  // Add shelter markers
  locationData.shelters.forEach(shelter => {
    const el = createCustomMarker('shelter');
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(shelter.coordinates as [number, number])
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>${shelter.name}</h3>`));

    markers.value.shelters.push(marker);

    if (props.filters.shelter) {
      marker.addTo(map);
    }
  });

  // Add defibrillator markers
  locationData.defibrillators.forEach(defibrillator => {
    const el = createCustomMarker('defibrillator');
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(defibrillator.coordinates as [number, number])
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>${defibrillator.name}</h3>`));

    markers.value.defibrillators.push(marker);

    if (props.filters.defibrillator) {
      marker.addTo(map);
    }
  });

  // Add water station markers
  locationData.waterStations.forEach(waterStation => {
    const el = createCustomMarker('waterStation');
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(waterStation.coordinates as [number, number])
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>${waterStation.name}</h3>`));

    markers.value.waterStations.push(marker);

    if (props.filters.waterStation) {
      marker.addTo(map);
    }
  });

  // Add food central markers
  locationData.foodCentrals.forEach(foodCentral => {
    const el = createCustomMarker('foodCentral');
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(foodCentral.coordinates as [number, number])
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>${foodCentral.name}</h3>`));

    markers.value.foodCentrals.push(marker);

    if (props.filters.foodCentral) {
      marker.addTo(map);
    }
  });

  // Add affected areas as circles
  locationData.affectedAreas.forEach((area, index) => {
    const layerId = `affected-area-${index}`;
    circleLayers.value.push(layerId);

    map.addSource(layerId, {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': area.coordinates
        },
        'properties': {
          'name': area.name
        }
      }
    });

    map.addLayer({
      'id': layerId,
      'type': 'circle',
      'source': layerId,
      'paint': {
        'circle-radius': area.radius / 50, // Scale appropriately
        'circle-color': 'rgba(255, 0, 0, 0.1)',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ff0000'
      },
      'layout': {
        'visibility': props.filters.affectedAreas ? 'visible' : 'none'
      }
    });

    // Add popup for affected area
    map.on('click', layerId, (e) => {
      if (e.features && e.features.length > 0) {
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`<h3>${area.name}</h3>`)
          .addTo(map);
      }
    });

    // Change cursor when hovering over affected area
    map.on('mouseenter', layerId, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = '';
    });
  });
};

onMounted(() => {
  try {
    if (!mapContainer.value) {
      console.error('Map container not found');
      return;
    }

    if (!mapboxConfig.accessToken) {
      console.error('Mapbox API key is missing. Check your .env file for VITE_MAPBOX_API_KEY');
      return;
    }

    mapboxgl.accessToken = mapboxConfig.accessToken;

    map = new mapboxgl.Map({
      container: mapContainer.value,
      style: mapboxConfig.defaultStyle,
      center: mapboxConfig.defaultCenter as [number, number],
      zoom: mapboxConfig.defaultZoom
    });

    map.addControl(new mapboxgl.NavigationControl());

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxConfig.accessToken,
      mapboxgl: mapboxgl,
      marker: true,
      placeholder: 'Search for location'
    });

    map.addControl(geocoder, 'top-left');

    map.on('load', () => {
      initializeMarkers();

      // Apply initial filters if any
      if (props.filters) {
        applyFilters(props.filters);
      }
    });

    map.on('click', (e) => {
      const coordinates = e.lngLat;
      console.log('[' + coordinates.lng + ', ' + coordinates.lat + ']');
    });
  } catch (error) {
    console.error('Error initializing Mapbox:', error);
  }
});
</script>

<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

:global(.mapboxgl-popup) {
  max-width: 200px;
}

:global(.mapboxgl-popup-content) {
  padding: 10px;
  border-radius: 5px;
}
</style>
