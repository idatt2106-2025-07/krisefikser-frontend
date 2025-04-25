<script setup lang="ts">
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { mapboxConfig } from '@/config/mapboxConfig';
import { ref, onMounted, watch } from 'vue';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';

// Placeholder data
// TODO: Replace with api call
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
    { id: 'a1', name: 'Nuclear accident', coordinates: [10.405876, 63.415629], radius: 500 },
    { id: 'a2', name: 'Landslide Area', coordinates: [10.41063276391543, 63.42678272573633], radius: 300 },
  ],
};

// Convert location data to searchable GeoJSON format
const createSearchableGeoJSON = () => {
  const features = [];

  // Add hospitals
  locationData.hospitals.forEach(item => {
    features.push({
      type: 'Feature',
      properties: {
        title: item.name,
        description: 'Hospital',
        category: 'hospital',
        id: item.id
      },
      geometry: {
        type: 'Point',
        coordinates: item.coordinates
      }
    });
  });

  // Add shelters
  locationData.shelters.forEach(item => {
    features.push({
      type: 'Feature',
      properties: {
        title: item.name,
        description: 'Shelter',
        category: 'shelter',
        id: item.id
      },
      geometry: {
        type: 'Point',
        coordinates: item.coordinates
      }
    });
  });

  // Add defibrillators
  locationData.defibrillators.forEach(item => {
    features.push({
      type: 'Feature',
      properties: {
        title: item.name,
        description: 'Defibrillator',
        category: 'defibrillator',
        id: item.id
      },
      geometry: {
        type: 'Point',
        coordinates: item.coordinates
      }
    });
  });

  // Add water stations
  locationData.waterStations.forEach(item => {
    features.push({
      type: 'Feature',
      properties: {
        title: item.name,
        description: 'Water Station',
        category: 'waterStation',
        id: item.id
      },
      geometry: {
        type: 'Point',
        coordinates: item.coordinates
      }
    });
  });

  // Add food centrals
  locationData.foodCentrals.forEach(item => {
    features.push({
      type: 'Feature',
      properties: {
        title: item.name,
        description: 'Food Central',
        category: 'foodCentral',
        id: item.id
      },
      geometry: {
        type: 'Point',
        coordinates: item.coordinates
      }
    });
  });

  // Add affected areas
  locationData.affectedAreas.forEach(item => {
    features.push({
      type: 'Feature',
      properties: {
        title: item.name,
        description: 'Affected Area',
        category: 'affectedArea',
        id: item.id,
        radius: item.radius
      },
      geometry: {
        type: 'Point',
        coordinates: item.coordinates
      }
    });
  });

  return {
    type: 'FeatureCollection',
    features: features
  };
};


//Store markers by type for toggling visibility
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
      if (filters.affectedAreas !== false) {
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
  el.style.width = '24px';
  el.style.height = '24px';
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
    el.setAttribute('data-id', hospital.id);
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
    el.setAttribute('data-id', shelter.id);
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
    el.setAttribute('data-id', defibrillator.id);
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
    el.setAttribute('data-id', waterStation.id);
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
    el.setAttribute('data-id', foodCentral.id);
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(foodCentral.coordinates as [number, number])
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>${foodCentral.name}</h3>`));

    markers.value.foodCentrals.push(marker);

    if (props.filters.foodCentral) {
      marker.addTo(map);
    }
  });

  locationData.affectedAreas.forEach((area, index) => {
    const layerId = `affected-area-${index}`;
    circleLayers.value.push(layerId);

    // Create a circle as a polygon (in meters)
    const circlePolygon = turf.circle(
      area.coordinates,
      area.radius / 1000, // Convert to km
      { steps: 64, units: 'kilometers' }
    );

    map.addSource(layerId, {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'geometry': circlePolygon.geometry,
        'properties': {
          'name': area.name
        }
      }
    });

    // Add fill layer
    map.addLayer({
      'id': layerId,
      'type': 'fill',
      'source': layerId,
      'paint': {
        'fill-color': 'rgba(255, 0, 0, 0.1)',
        'fill-outline-color': '#ff0000'
      },
      'layout': {
        'visibility': props.filters.affectedAreas ? 'visible' : 'none'
      }
    });

    // Add stroke layer
    map.addLayer({
      'id': `${layerId}-outline`,
      'type': 'line',
      'source': layerId,
      'paint': {
        'line-color': '#ff0000',
        'line-width': 2
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

    // Create searchable data
    const customSearchData = createSearchableGeoJSON();

    // Configure the geocoder with custom data
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxConfig.accessToken,
      mapboxgl: mapboxgl,
      marker: false, // Don't add a marker on geocoding results
      placeholder: 'Search for location or facility',
      localGeocoder: (query) => {
        const matches = [];
        if (!query || query.length < 3) return matches;

        const lowerQuery = query.toLowerCase();

        customSearchData.features.forEach(feature => {
          if (
            feature.properties.title.toLowerCase().includes(lowerQuery) ||
            feature.properties.description.toLowerCase().includes(lowerQuery)
          ) {
            // Format the result for display
            const match = {
              ...feature,
              place_name: `${feature.properties.title} (${feature.properties.description})`,
              center: feature.geometry.coordinates,
              place_type: ['poi'],
              isCustomResult: true,  // Add this custom flag
              customCategory: feature.properties.category  // Add category for potential styling
            };
            matches.push(match);
          }
        });

        return matches;
      },
      localGeocoderOnly: false, // Search Mapbox API and local data
      zoom: 15,
      // Limit search results from Mapbox to these types
      types: 'poi,address,place'
    });

    // Handle selection in search results
    geocoder.on('result', (event) => {
      const selectedResult = event.result;

      // If it's one of our custom features
      if (selectedResult.properties && selectedResult.properties.category) {
        const { category, id } = selectedResult.properties;

        // Fly to the location
        map.flyTo({
          center: selectedResult.center,
          zoom: 15,
          essential: true
        });

        // Find the matching marker
        let selectedMarker;

        switch (category) {
          case 'hospital':
            selectedMarker = markers.value.hospitals.find(
              m => m._element.getAttribute('data-id') === id
            );
            break;
          case 'shelter':
            selectedMarker = markers.value.shelters.find(
              m => m._element.getAttribute('data-id') === id
            );
            break;
          case 'defibrillator':
            selectedMarker = markers.value.defibrillators.find(
              m => m._element.getAttribute('data-id') === id
            );
            break;
          case 'waterStation':
            selectedMarker = markers.value.waterStations.find(
              m => m._element.getAttribute('data-id') === id
            );
            break;
          case 'foodCentral':
            selectedMarker = markers.value.foodCentrals.find(
              m => m._element.getAttribute('data-id') === id
            );
            break;
          case 'affectedArea':
            // Handle affected areas differently since they're layers, not markers
            const areaIndex = locationData.affectedAreas.findIndex(area => area.id === id);
            if (areaIndex >= 0) {
              new mapboxgl.Popup()
                .setLngLat(selectedResult.center)
                .setHTML(`<h3>${locationData.affectedAreas[areaIndex].name}</h3>`)
                .addTo(map);
            }
            return; // Skip the marker popup code below
        }

        // Show popup for the marker
        if (selectedMarker) {
          selectedMarker.togglePopup();
        }
      }
    });

        // After creating geocoder instance
    geocoder.on('render', () => {
      // Get all suggestion elements
      const suggestionElements = document.querySelectorAll('.mapboxgl-ctrl-geocoder .suggestions > li');

      // Iterate through them
      suggestionElements.forEach(el => {
        // Get the result id from the element
        const resultId = el.dataset.resultId;
        if (!resultId) return;

        // Find the corresponding result from the last rendered results
        const result = geocoder._typeahead.data.find(r => r.id === resultId);
        if (!result) return;

        // If it's our custom result, add data attributes
        if (result.isCustomResult) {
          el.dataset.custom = 'true';
          if (result.customCategory) {
            el.dataset.category = result.customCategory;
          }
        }
      });
    });

    map.addControl(geocoder, 'top-left');

    const applyCustomStyling = () => {
  // Add a MutationObserver to watch for DOM changes
  const observer = new MutationObserver(() => {
    const suggestionElements = document.querySelectorAll('.mapboxgl-ctrl-geocoder .suggestions > li');

    suggestionElements.forEach(el => {
      const placeName = el.querySelector('a').textContent || '';

      // Check if this is one of our custom results by looking for category indicators
      if (placeName.includes('(Hospital)')) {
        el.dataset.custom = 'true';
        el.dataset.category = 'hospital';
      } else if (placeName.includes('(Shelter)')) {
        el.dataset.custom = 'true';
        el.dataset.category = 'shelter';
      } else if (placeName.includes('(Defibrillator)')) {
        el.dataset.custom = 'true';
        el.dataset.category = 'defibrillator';
      } else if (placeName.includes('(Water Station)')) {
        el.dataset.custom = 'true';
        el.dataset.category = 'waterStation';
      } else if (placeName.includes('(Food Central)')) {
        el.dataset.custom = 'true';
        el.dataset.category = 'foodCentral';
      } else if (placeName.includes('(Affected Area)')) {
        el.dataset.custom = 'true';
        el.dataset.category = 'affectedArea';
      }
    });
  });

  // Start observing when suggestions appear
  const geocoderEl = document.querySelector('.mapboxgl-ctrl-geocoder');
  if (geocoderEl) {
    observer.observe(geocoderEl, { childList: true, subtree: true });
  }
};

    map.on('load', () => {
      applyCustomStyling();
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

/* Target custom search results */
:global(.mapboxgl-ctrl-geocoder .suggestions > li[data-custom="true"].active) {
  background-color: #e3f2fd !important; /* Light blue background */
}

:global(.mapboxgl-ctrl-geocoder .suggestions > li[data-custom="true"]) {
  background-color: #f5f5ff; /* Very light blue background */
}

/* Different colors for different categories */
:global(.mapboxgl-ctrl-geocoder .suggestions > li[data-category="hospital"]) {
  border-left: 4px solid #f96363;
}

:global(.mapboxgl-ctrl-geocoder .suggestions > li[data-category="shelter"]) {
  border-left: 4px solid #4da6ff;
}

:global(.mapboxgl-ctrl-geocoder .suggestions > li[data-category="defibrillator"]) {
  border-left: 4px solid #ffcc00;
}

:global(.mapboxgl-ctrl-geocoder .suggestions > li[data-category="waterStation"]) {
  border-left: 4px solid #00ccff;
}

:global(.mapboxgl-ctrl-geocoder .suggestions > li[data-category="foodCentral"]) {
  border-left: 4px solid #66cc66;
}

:global(.mapboxgl-ctrl-geocoder .suggestions > li[data-category="affectedArea"]) {
  border-left: 4px solid #a10000 !important;
}

</style>
