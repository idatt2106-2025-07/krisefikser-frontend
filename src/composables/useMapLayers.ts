import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import type { AffectedArea, Filters } from '@/types/mapTypes';

export function useMapLayers(
  map: Ref<mapboxgl.Map | null>,
  affectedAreas: AffectedArea[],
  filters: Ref<Filters>
) {
  const circleLayers = ref<string[]>([]);

  const initializeLayers = () => {
    console.log('Initializing layers, map ready:', !!map.value);
    console.log('Affected areas data:', affectedAreas);
    console.log('Current filters:', filters.value);

    if (!map.value) return;

    affectedAreas.forEach((area, index) => {
      const layerId = `affected-area-${index}`;
      circleLayers.value.push(layerId);

      // Create a circle as a polygon (in meters)
      const circlePolygon = turf.circle(
        area.coordinates,
        area.radius / 1000, // Convert to km
        { steps: 64, units: 'kilometers' }
      );

      map.value!.addSource(layerId, {
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
      map.value!.addLayer({
        'id': layerId,
        'type': 'fill',
        'source': layerId,
        'paint': {
          'fill-color': 'rgba(255, 0, 0, 0.1)',
          'fill-outline-color': '#ff0000'
        },
        'layout': {
          'visibility': filters.value.affectedAreas !== false ? 'visible' : 'none'
        }
      });

      // Add stroke layer
      map.value!.addLayer({
        'id': `${layerId}-outline`,
        'type': 'line',
        'source': layerId,
        'paint': {
          'line-color': '#ff0000',
          'line-width': 2
        },
        'layout': {
          'visibility': filters.value.affectedAreas !== false ? 'visible' : 'none'
        }
      });

      // Add popup for affected area
      map.value!.on('click', layerId, (e) => {
        if (e.features && e.features.length > 0) {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<h3>${area.name}</h3>`)
            .addTo(map.value!);
        }
      });

      // Change cursor when hovering over affected area
      map.value!.on('mouseenter', layerId, () => {
        map.value!.getCanvas().style.cursor = 'pointer';
      });

      map.value!.on('mouseleave', layerId, () => {
        map.value!.getCanvas().style.cursor = '';
      });
    });
  };

  const applyLayerFilters = (newFilters: Filters) => {
    if (!map.value) return;

    // Show/hide affected areas
    circleLayers.value.forEach(layerId => {
      if (map.value && map.value.getLayer(layerId)) {
        const visibility = newFilters.affectedAreas !== false ? 'visible' : 'none';
        map.value.setLayoutProperty(layerId, 'visibility', visibility);

        // Also update the outline layer visibility
        if (map.value.getLayer(`${layerId}-outline`)) {
          map.value.setLayoutProperty(`${layerId}-outline`, 'visibility', visibility);
        }
      }
    });
  };

  // Watch for filter changes
  watch(() => filters.value, applyLayerFilters, { deep: true });

  return {
    circleLayers,
    initializeLayers,
    applyLayerFilters
  };
}
