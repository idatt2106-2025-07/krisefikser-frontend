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
    waterStations: [],
    foodCentrals: []
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
    locationData.waterStations.forEach(waterStation => {
      const el = createCustomMarker('waterStation');
      el.setAttribute('data-id', waterStation.id);
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(waterStation.coordinates as [number, number])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${waterStation.name}</h3>`));

      markers.value.waterStations.push(marker);

      if (filters.value.waterStation !== false) {
        marker.addTo(map.value!);
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

      if (filters.value.foodCentral !== false) {
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
    markers.value.waterStations.forEach(marker => {
      if (newFilters.waterStation !== false) {
        marker.addTo(map.value!);
      } else {
        marker.remove();
      }
    });

    // Show/hide food central markers
    markers.value.foodCentrals.forEach(marker => {
      if (newFilters.foodCentral !== false) {
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
