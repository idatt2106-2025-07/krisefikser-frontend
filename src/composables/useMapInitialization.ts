import mapboxgl from 'mapbox-gl';
import { ref, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import { mapboxConfig } from '@/config/mapboxConfig';

export function useMapInitialization(containerRef: Ref<HTMLElement | null, HTMLElement | null>) {
  const map = ref<mapboxgl.Map | null>(null);
  const isMapLoaded = ref(false);
  const isStyleLoaded = ref(false);

  onMounted(() => {
    if (!containerRef.value) {
      console.error('Map container not found');
      return;
    }

    if (!mapboxConfig.accessToken) {
      console.error('Mapbox API key is missing. Check your .env file for VITE_MAPBOX_API_KEY');
      return;
    }

    mapboxgl.accessToken = mapboxConfig.accessToken;

    map.value = new mapboxgl.Map({
      container: containerRef.value,
      style: mapboxConfig.defaultStyle,
      center: mapboxConfig.defaultCenter as [number, number],
      zoom: mapboxConfig.defaultZoom
    });

    map.value.addControl(new mapboxgl.NavigationControl());

    map.value.on('load', () => {
      isMapLoaded.value = true;
    });

    map.value.on('click', (e) => {
      const coordinates = e.lngLat;
      console.log('[' + coordinates.lng + ', ' + coordinates.lat + ']');
    });

    map.value.on('style.load', () => {
      isStyleLoaded.value = true;
      console.log('Map style loaded');
    });
  });

  onUnmounted(() => {
    if (map.value) {
      map.value.remove();
    }
  });

  return {
    map,
    isMapLoaded,
    isStyleLoaded
  };
}
