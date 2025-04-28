import type { Ref } from 'vue';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import mapboxgl from 'mapbox-gl';
import { mapboxConfig } from '@/config/mapboxConfig';
import { createSearchableGeoJSON } from '@/utils/mapUtils';
import type { LocationData, MarkerCollections } from '@/types/mapTypes';

export function useSearchGeocoder(
  map: Ref<mapboxgl.Map | null>,
  locationData: LocationData,
  markers: Ref<MarkerCollections>
) {
  const initializeSearch = () => {
    if (!map.value) return;

    // Create searchable data
    const customSearchData = createSearchableGeoJSON(locationData);

    // Configure the geocoder with custom data
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxConfig.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
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
              isCustomResult: true,
              customCategory: feature.properties.category
            };
            matches.push(match);
          }
        });

        return matches;
      },
      localGeocoderOnly: false,
      zoom: 15,
      types: 'poi,address,place'
    });

    // Handle selection in search results
    geocoder.on('result', (event) => {
      const selectedResult = event.result;

      // If it's one of our custom features
      if (selectedResult.properties && selectedResult.properties.category) {
        const { category, id } = selectedResult.properties;

        // Fly to the location
        map.value!.flyTo({
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
                .addTo(map.value!);
            }
            return; // Skip the marker popup code below
        }

        // Show popup for the marker
        if (selectedMarker) {
          selectedMarker.togglePopup();
        }
      }
    });

    // Apply custom styling to search results
    geocoder.on('render', () => {
      setTimeout(() => {
        const suggestionElements = document.querySelectorAll('.mapboxgl-ctrl-geocoder .suggestions > li');

        suggestionElements.forEach(el => {
          const anchor = el.querySelector('a');
          if (!anchor) return;

          const placeName = anchor.textContent || '';

          if (placeName.includes('(Hospital)')) {
            el.setAttribute('data-custom', 'true');
            el.setAttribute('data-category', 'hospital');
          } else if (placeName.includes('(Shelter)')) {
            el.setAttribute('data-custom', 'true');
            el.setAttribute('data-category', 'shelter');
          } else if (placeName.includes('(Defibrillator)')) {
            el.setAttribute('data-custom', 'true');
            el.setAttribute('data-category', 'defibrillator');
          } else if (placeName.includes('(Water Station)')) {
            el.setAttribute('data-custom', 'true');
            el.setAttribute('data-category', 'waterStation');
          } else if (placeName.includes('(Food Central)')) {
            el.setAttribute('data-custom', 'true');
            el.setAttribute('data-category', 'foodCentral');
          } else if (placeName.includes('(Affected Area)')) {
            el.setAttribute('data-custom', 'true');
            el.setAttribute('data-category', 'affectedArea');
          }
        });
      }, 10);
    });

    map.value.addControl(geocoder, 'top-left');
  };

  return {
    initializeSearch
  };
}
