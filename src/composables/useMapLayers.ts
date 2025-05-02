// src/composables/useMapLayers.ts
import { ref } from 'vue'
import type { Ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'
import type { LocationData, Filters } from '@/types/mapTypes'

export function useMapLayers(
  map: Ref<mapboxgl.Map | null>,
  locationData: Ref<LocationData>,
  filters: Ref<Filters>,
) {
  const circleLayers = ref<string[]>([])
  const layersInitialized = ref(false)

  const initializeLayers = () => {
    if (!map.value) {
      console.warn('Map not initialized when adding layers')
      return
    }

    // If layers are already initialized, remove them first
    if (layersInitialized.value) {
      removeAllLayers()
    }

    locationData.value.affectedAreas.forEach((area, index) => {
      try {
        const layerId = `affected-area-${index}`
        circleLayers.value.push(layerId)

        // Debug info
        console.log(`Creating layer ${layerId} for area:`, area)

        // Create a circle as a polygon (in km)
        const circlePolygon = turf.circle([area.longitude, area.latitude], area.dangerRadiusKm, {
          steps: 64,
          units: 'kilometers',
        })

        // Use severity level to determine color
        let fillColor = 'rgba(255, 0, 0, 0.1)'
        let strokeColor = '#ff0000'

        switch (area.severityLevel) {
          case 1: // Low severity
            fillColor = 'rgba(255, 255, 0, 0.2)' // Yellow, more visible
            strokeColor = '#ffff00'
            break
          case 2: // Medium severity
            fillColor = 'rgba(255, 165, 0, 0.2)' // Orange, more visible
            strokeColor = '#ffa500'
            break
          case 3: // High severity
            fillColor = 'rgba(255, 0, 0, 0.2)' // Red, more visible
            strokeColor = '#ff0000'
            break
        }

        // Check if source already exists
        if (map.value.getSource(layerId)) {
          map.value.removeSource(layerId)
        }

        // Add source for the circle
        map.value.addSource(layerId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: circlePolygon.geometry,
            properties: {
              description: area.description,
              severity: area.severityLevel,
              startDate: area.startDate,
            },
          },
        })

        // Add fill layer
        map.value.addLayer({
          id: layerId,
          type: 'fill',
          source: layerId,
          layout: {
            visibility: filters.value.affected_areas !== false ? 'visible' : 'none',
          },
          paint: {
            'fill-color': fillColor,
            'fill-opacity': 0.6, // Increased opacity for visibility
          },
        })

        // Add outline layer
        const outlineLayerId = `${layerId}-outline`
        map.value.addLayer({
          id: outlineLayerId,
          type: 'line',
          source: layerId,
          layout: {
            visibility: filters.value.affected_areas !== false ? 'visible' : 'none',
          },
          paint: {
            'line-color': strokeColor,
            'line-width': 2,
            'line-opacity': 0.8,
          },
        })

        console.log(`Successfully created layers: ${layerId}, ${outlineLayerId}`)

        // Add popup for the circle with updated properties
        map.value.on('click', layerId, (e) => {
          if (e.features && e.features.length > 0) {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(
                `
                <div class="popup-content">
                  <h3>Emergancy alert!</h3>
                  <p>${area.description}</p>
                  <h4>Severity: ${area.severityLevel}</h4>
                  <h4>Started: ${new Date(area.startDate).toLocaleString()}</h4>
                </div>
              `,
              )
              .addTo(map.value!)
          }
        })
      } catch (err) {
        console.error(`Error creating layer for area ${index}:`, err)
      }
    })
  }

  const removeAllLayers = () => {
    if (!map.value) return

    circleLayers.value.forEach((layerId) => {
      try {
        if (map.value.getLayer(layerId)) {
          map.value.removeLayer(layerId)
        }
        if (map.value.getLayer(`${layerId}-outline`)) {
          map.value.removeLayer(`${layerId}-outline`)
        }
        if (map.value.getSource(layerId)) {
          map.value.removeSource(layerId)
        }
      } catch (error) {
        console.warn(`Error removing layer ${layerId}:`, error)
      }
    })

    circleLayers.value = []
  }

  // Return a tryInitializeLayers function that will attempt to initialize with retry logic
  const tryInitializeLayers = (maxAttempts = 5) => {
    let attempts = 0

    const attemptInit = () => {
      if (!map.value) return

      if (map.value.isStyleLoaded()) {
        console.log('Map style is loaded, initializing layers now')
        initializeLayers()
      } else if (attempts < maxAttempts) {
        attempts++
        console.log(
          `Map style not loaded yet, retrying in 200ms (attempt ${attempts}/${maxAttempts})`,
        )
        setTimeout(attemptInit, 200)
      } else {
        console.error('Failed to initialize layers after max attempts')
      }
    }

    // Start the attempt process
    attemptInit()
  }

  const updateLayerVisibility = (showAffectedAreas: boolean) => {
    if (!map.value) return

    circleLayers.value.forEach((layerId) => {
      if (map.value.getLayer(layerId)) {
        map.value.setLayoutProperty(layerId, 'visibility', showAffectedAreas ? 'visible' : 'none')

        // Also update outline layers
        const outlineLayerId = `${layerId}-outline`
        if (map.value.getLayer(outlineLayerId)) {
          map.value.setLayoutProperty(
            outlineLayerId,
            'visibility',
            showAffectedAreas ? 'visible' : 'none',
          )
        }
      }
    })
  }

  return {
    circleLayers,
    initializeLayers,
    tryInitializeLayers,
    updateLayerVisibility,
  }
}
