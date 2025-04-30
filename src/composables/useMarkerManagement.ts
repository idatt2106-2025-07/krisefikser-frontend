import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import mapboxgl from 'mapbox-gl';
import { createCustomMarker } from '@/utils/mapUtils';
import type { LocationData, MarkerCollections, Filters } from '@/types/mapTypes';

export function useMarkerManagement(
  map: Ref<mapboxgl.Map | null>,
  locationData: LocationData,
  filters: Ref<Filters>
) {
  const markers = ref<MarkerCollections>({
    hospitals: [],
    shelters: [],
    defibrillators: [],
    water_stations: [],
    food_centrals: []
  });

  const initializeMarkers = () => {
    if (!map.value) return;

    // Add hospital markers
    locationData.hospitals.forEach(hospital => {
      const el = createCustomMarker('hospital');
      el.setAttribute('data-id', hospital.id);
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(hospital.coordinates as [number, number])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${hospital.name}</h3>`));

      markers.value.hospitals.push(marker);

      if (filters.value.hospital !== false) {
        marker.addTo(map.value!);
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

      if (filters.value.shelter !== false) {
        marker.addTo(map.value!);
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

      if (filters.value.defibrillator !== false) {
        marker.addTo(map.value!);
      }
    });

    // Add water station markers
    locationData.water_stations.forEach(water_station => {
      const el = createCustomMarker('waterStation');
      el.setAttribute('data-id', water_station.id);
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(water_station.coordinates as [number, number])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${water_station.name}</h3>`));

      markers.value.water_stations.push(marker);

      if (filters.value.water_station !== false) {
        marker.addTo(map.value!);
      }
    });

    // Add food central markers
    locationData.food_centrals.forEach(food_central => {
      const el = createCustomMarker('foodCentral');
      el.setAttribute('data-id', food_central.id);
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(food_central.coordinates as [number, number])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${food_central.name}</h3>`));

      markers.value.food_centrals.push(marker);

      if (filters.value.food_central !== false) {
        marker.addTo(map.value!);
      }
    });
  };

  const applyFilters = (newFilters: Filters) => {
    if (!map.value) return;

    // Show/hide hospital markers
    markers.value.hospitals.forEach(marker => {
      if (newFilters.hospital !== false) {
        marker.addTo(map.value!);
      } else {
        marker.remove();
      }
    });

    // Show/hide shelter markers
    markers.value.shelters.forEach(marker => {
      if (newFilters.shelter !== false) {
        marker.addTo(map.value!);
      } else {
        marker.remove();
      }
    });

    // Show/hide defibrillator markers
    markers.value.defibrillators.forEach(marker => {
      if (newFilters.defibrillator !== false) {
        marker.addTo(map.value!);
      } else {
        marker.remove();
      }
    });

    // Show/hide water station markers
    markers.value.water_stations.forEach(marker => {
      if (newFilters.water_station !== false) {
        marker.addTo(map.value!);
      } else {
        marker.remove();
      }
    });

    // Show/hide food central markers
    markers.value.food_centrals.forEach(marker => {
      if (newFilters.food_central !== false) {
        marker.addTo(map.value!);
      } else {
        marker.remove();
      }
    });
  };

  // Watch for filter changes
  watch(() => filters.value, applyFilters, { deep: true });

  return {
    markers,
    initializeMarkers,
    applyFilters
  };
}
