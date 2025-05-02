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
        const areaId = `affected-area-${index}`

        // Create a single popup for the entire affected area
        const addPopupHandler = (layerId: string) => {
          map.value.on('click', layerId, (e) => {
            if (e.features && e.features.length > 0) {
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(
                  `
                  <div class="popup-content">
                    <h3>Emergency alert!</h3>
                    <p>${area.description}</p>
                    <h4>Severity: ${area.severityLevel}</h4>
                    <h4>Started: ${new Date(area.startDate).toLocaleString()}</h4>
                  </div>
                `,
                )
                .addTo(map.value!)
            }
          })
        }

        // Create non-overlapping rings for each danger level
        // High danger (red) - innermost ring
        if (area.highDangerRadiusKm) {
          const highLayerId = `${areaId}-high`
          circleLayers.value.push(highLayerId)

          // High danger zone - solid circle
          const highCircle = turf.circle([area.longitude, area.latitude], area.highDangerRadiusKm, {
            steps: 64,
            units: 'kilometers',
          })

          map.value.addSource(highLayerId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: highCircle.geometry,
              properties: { description: area.description },
            },
          })

          map.value.addLayer({
            id: highLayerId,
            type: 'fill',
            source: highLayerId,
            layout: {
              visibility: filters.value.affected_areas !== false ? 'visible' : 'none',
            },
            paint: {
              'fill-color': 'rgba(255, 0, 0, 0.4)', // Red
              'fill-outline-color': '#ff0000',
            },
          })

          // Add popup handler
          addPopupHandler(highLayerId)
        }

        // Medium danger (orange) - middle ring (donut shape)
        if (area.mediumDangerRadiusKm && area.highDangerRadiusKm) {
          const mediumLayerId = `${areaId}-medium`
          circleLayers.value.push(mediumLayerId)

          // Create donut shape - outer circle minus inner circle
          const outerCircle = turf.circle(
            [area.longitude, area.latitude],
            area.mediumDangerRadiusKm,
            { steps: 64, units: 'kilometers' },
          )

          const innerCircle = turf.circle(
            [area.longitude, area.latitude],
            area.highDangerRadiusKm,
            { steps: 64, units: 'kilometers' },
          )

          // Create the donut as a polygon with hole
          const donut = {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [
                outerCircle.geometry.coordinates[0], // Outer ring
                [...innerCircle.geometry.coordinates[0]].reverse(), // Inner ring (hole) - note the reversal
              ],
            },
          }

          map.value.addSource(mediumLayerId, {
            type: 'geojson',
            data: donut,
          })

          map.value.addLayer({
            id: mediumLayerId,
            type: 'fill',
            source: mediumLayerId,
            layout: {
              visibility: filters.value.affected_areas !== false ? 'visible' : 'none',
            },
            paint: {
              'fill-color': 'rgba(255, 165, 0, 0.3)', // Orange
              'fill-outline-color': '#ffa500',
            },
          })

          // Add popup handler
          addPopupHandler(mediumLayerId)
        }

        // Low danger (yellow) - outermost ring (donut shape)
        if (area.lowDangerRadiusKm && area.mediumDangerRadiusKm) {
          const lowLayerId = `${areaId}-low`
          circleLayers.value.push(lowLayerId)

          // Create donut shape - outer circle minus medium circle
          const outerCircle = turf.circle([area.longitude, area.latitude], area.lowDangerRadiusKm, {
            steps: 64,
            units: 'kilometers',
          })

          const innerCircle = turf.circle(
            [area.longitude, area.latitude],
            area.mediumDangerRadiusKm,
            { steps: 64, units: 'kilometers' },
          )

          // Create the donut as a polygon with hole
          const donut = {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [
                outerCircle.geometry.coordinates[0], // Outer ring
                [...innerCircle.geometry.coordinates[0]].reverse(), // Inner ring (hole) - note the reversal
              ],
            },
          }

          map.value.addSource(lowLayerId, {
            type: 'geojson',
            data: donut,
          })

          map.value.addLayer({
            id: lowLayerId,
            type: 'fill',
            source: lowLayerId,
            layout: {
              visibility: filters.value.affected_areas !== false ? 'visible' : 'none',
            },
            paint: {
              'fill-color': 'rgba(255, 255, 0, 0.2)', // Yellow
              'fill-outline-color': '#ffff00',
            },
          })

          // Add popup handler
          addPopupHandler(lowLayerId)
        }

        // Add border lines between the danger zones
        ;['high', 'medium', 'low'].forEach((level, i) => {
          const radiusProperty = `${level}DangerRadiusKm`
          if (area[radiusProperty]) {
            const outlineId = `${areaId}-${level}-outline`
            circleLayers.value.push(outlineId)

            const circle = turf.circle([area.longitude, area.latitude], area[radiusProperty], {
              steps: 64,
              units: 'kilometers',
            })

            map.value.addSource(outlineId, {
              type: 'geojson',
              data: circle,
            })

            map.value.addLayer({
              id: outlineId,
              type: 'line',
              source: outlineId,
              layout: {
                visibility: filters.value.affected_areas !== false ? 'visible' : 'none',
              },
              paint: {
                'line-color': i === 0 ? '#ff0000' : i === 1 ? '#ffa500' : '#ffff00',
                'line-width': 2,
                'line-opacity': 0.8,
              },
            })
          }
        })
      } catch (err) {
        console.error(`Error creating layers for area ${index}:`, err)
      }
    })

    layersInitialized.value = true
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
