// src/composables/useMapLayers.ts
import { ref, watch } from 'vue';
import type { Ref} from 'vue';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import type { LocationData, Filters } from '@/types/mapTypes';

export function useMapLayers(
  map: Ref<mapboxgl.Map | null>,
  locationData: Ref<LocationData>,
  filters: Ref<Filters>
) {
  const circleLayers = ref<string[]>([]);
  const layersInitialized = ref(false);

  const initializeLayers = () => {
    if (!map.value) {
      console.warn('Map not initialized when adding layers');
      return;
    }

    // If layers are already initialized, remove them first
    if (layersInitialized.value) {
      removeAllLayers();
    }

    try {
      console.log('Initializing map layers with affected areas:',
                 locationData.value.affectedAreas.length);

      locationData.value.affectedAreas.forEach((area, index) => {
        const layerId = `affected-area-${index}`;
        circleLayers.value.push(layerId);

        // Create a circle as a polygon (in meters)
        const circlePolygon = turf.circle(
          [area.longitude, area.latitude],
          area.radius / 1000, // Convert to km
          { steps: 64, units: 'kilometers' }
        );

        // Only add source if it doesn't exist
        if (!map.value.getSource(layerId)) {
          map.value.addSource(layerId, {
            'type': 'geojson',
            'data': {
              'type': 'Feature',
              'geometry': circlePolygon.geometry,
              'properties': {
                'name': area.name
              }
            }
          });
        }

        // Only add layer if it doesn't exist
        if (!map.value.getLayer(layerId)) {
          map.value.addLayer({
            'id': layerId,
            'type': 'fill',
            'source': layerId,
            'paint': {
              'fill-color': 'rgba(255, 0, 0, 0.1)',
              'fill-outline-color': '#ff0000'
            },
            'layout': {
              'visibility': filters.value.affected_areas !== false ? 'visible' : 'none'
            }
          });
        }

        // Only add outline layer if it doesn't exist
        if (!map.value.getLayer(`${layerId}-outline`)) {
          map.value.addLayer({
            'id': `${layerId}-outline`,
            'type': 'line',
            'source': layerId,
            'paint': {
              'line-color': '#ff0000',
              'line-width': 2
            },
            'layout': {
              'visibility': filters.value.affected_areas !== false ? 'visible' : 'none'
            }
          });
        }

        // Add click handler for the layer
        map.value.on('click', layerId, (e) => {
          if (e.features && e.features.length > 0) {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`<h3>${area.name}</h3>`)
              .addTo(map.value!);
          }
        });
      });

      layersInitialized.value = true;
      console.log('Layers successfully initialized:', circleLayers.value.length);
    } catch (error) {
      console.error('Error initializing layers:', error);
    }
  };

  const removeAllLayers = () => {
    if (!map.value) return;

    circleLayers.value.forEach(layerId => {
      try {
        if (map.value.getLayer(layerId)) {
          map.value.removeLayer(layerId);
        }
        if (map.value.getLayer(`${layerId}-outline`)) {
          map.value.removeLayer(`${layerId}-outline`);
        }
        if (map.value.getSource(layerId)) {
          map.value.removeSource(layerId);
        }
      } catch (error) {
        console.warn(`Error removing layer ${layerId}:`, error);
      }
    });

    circleLayers.value = [];
  };

  // Return a tryInitializeLayers function that will attempt to initialize with retry logic
  const tryInitializeLayers = (maxAttempts = 5) => {
    let attempts = 0;

    const attemptInit = () => {
      if (!map.value) return;

      if (map.value.isStyleLoaded()) {
        console.log('Map style is loaded, initializing layers now');
        initializeLayers();
      } else if (attempts < maxAttempts) {
        attempts++;
        console.log(`Map style not loaded yet, retrying in 200ms (attempt ${attempts}/${maxAttempts})`);
        setTimeout(attemptInit, 200);
      } else {
        console.error('Failed to initialize layers after max attempts');
      }
    };

    // Start the attempt process
    attemptInit();
  };

  return {
    circleLayers,
    initializeLayers,
    tryInitializeLayers
  };
}
