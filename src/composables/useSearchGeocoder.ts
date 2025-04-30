import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { createSearchableGeoJSON } from '@/utils/mapUtils';
import type { LocationData } from '@/types/mapTypes';

export function useSearchGeocoder(
  map: Ref<mapboxgl.Map | null>,
  locationData: Ref<LocationData>,
  markers: Ref<mapboxgl.Marker[]>
) {
  const geocoder = ref<MapboxGeocoder | null>(null);

  const initializeSearch = () => {
    if (!map.value) return;

    // Create custom geocoder
    geocoder.value = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: 'Search locations...',
      localGeocoder: (query) => customGeocoder(query, locationData.value),
      render: (item) => {
        if (item.properties && item.properties.title) {
          // Custom POI result
          const name = item.properties.title;
          const category = item.properties.description || '';
          return `<div class="geocoder-result">
            <strong>${name}</strong>
            <span>${category}</span>
          </div>`;
        } else {
          const name = item.text || '';
          const placeName = item.place_name || '';

          // Show more details for global results
          return `<div class="geocoder-result global-location">
            <strong>${name}</strong>
            <span class="location-details">${placeName}</span>
          </div>`;
        }
      },
      localGeocoderOnly: false
    });

    // Add geocoder to map
    map.value.addControl(geocoder.value, 'top-left');

    // Handle selection of a point of interest
    geocoder.value.on('result', (event) => {
      // If it's our custom result, zoom to it
      if (event.result && event.result.properties && event.result.properties.id) {
        const id = event.result.properties.id.toString();
        const coordinates = event.result.geometry.coordinates;

        // Find and open popup for this marker
        markers.value.forEach(marker => {
          const element = marker.getElement();
          if (element.getAttribute('data-id') === id) {
            marker.togglePopup();
          }
        });

        // Fly to the location
        map.value.flyTo({
          center: coordinates,
          zoom: 15,
          essential: true
        });
      }
    });
  };

  // Custom geocoder to search our points of interest
  const customGeocoder = (query: string, data: LocationData) => {
    if (!query || query.length < 2) return [];

    const geoJSON = createSearchableGeoJSON(data);
    const lowerQuery = query.toLowerCase();

    return geoJSON.features.filter(feature => {
      const title = (feature.properties?.title || '').toLowerCase();
      const description = (feature.properties?.description || '').toLowerCase();

      if (title.includes(lowerQuery) || description.includes(lowerQuery)) {
        feature.place_name = feature.properties?.title || 'Location';
        feature.text = feature.properties?.title || 'Location';
        return true;
      }
      return false;
    });
  };

  // Update search when data changes
  watch(() => locationData.value, () => {
    if (geocoder.value) {
      geocoder.value.setProximity(null);
    }
  }, { deep: true });

  return {
    geocoder,
    initializeSearch
  };
}
