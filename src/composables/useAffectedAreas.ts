// src/composables/useMapLayers.ts
import { ref } from 'vue'
import type { Ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'
import type { LocationData, Filters, AffectedArea } from '@/types/mapTypes'
import type { Feature, Polygon, GeoJsonProperties } from 'geojson'

export function useMapLayers(
  map: Ref<mapboxgl.Map | null>,
  locationData: Ref<LocationData>,
  filters: Ref<Filters>,
) {
  const circleLayers = ref<string[]>([])
  const layersInitialized = ref(false)

  function getDangerRadius(area: AffectedArea, level: string): number | undefined {
    switch (level) {
      case 'high':
        return area.highDangerRadiusKm
      case 'medium':
        return area.mediumDangerRadiusKm
      case 'low':
        return area.lowDangerRadiusKm
      default:
        return undefined
    }
  }

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
        if (!map.value) return
        const mapInstance = map.value

        const areaId = `affected-area-${index}`

        // Create a single popup for the entire affected area
        const addPopupHandler = (layerId: string) => {
          mapInstance.on('click', layerId, (e) => {
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

          mapInstance.addSource(highLayerId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: highCircle.geometry,
              properties: { description: area.description },
            },
          })

          mapInstance.addLayer({
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

          // Then in your code where you create the donut:
          const donut: Feature<Polygon, GeoJsonProperties> = {
            type: 'Feature', // Use literal "Feature" instead of 'Feature'
            properties: {},
            geometry: {
              type: 'Polygon', // Use literal "Polygon" instead of 'Polygon'
              coordinates: [
                outerCircle.geometry.coordinates[0], // Outer ring
                [...innerCircle.geometry.coordinates[0]].reverse(), // Inner ring (hole)
              ],
            },
          }

          mapInstance.addSource(mediumLayerId, {
            type: 'geojson',
            data: donut,
          })

          mapInstance.addLayer({
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
          const donut: Feature<Polygon, GeoJsonProperties> = {
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

          mapInstance.addSource(lowLayerId, {
            type: 'geojson',
            data: donut,
          })

          mapInstance.addLayer({
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
          const radius = getDangerRadius(area, level)
          if (radius) {
            const outlineId = `${areaId}-${level}-outline`
            circleLayers.value.push(outlineId)

            const circle = turf.circle([area.longitude, area.latitude], radius, {
              steps: 64,
              units: 'kilometers',
            })

            mapInstance.addSource(outlineId, {
              type: 'geojson',
              data: circle,
            })

            mapInstance.addLayer({
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
    const mapInstance = map.value

    circleLayers.value.forEach((layerId) => {
      try {
        if (mapInstance.getLayer(layerId)) {
          mapInstance.removeLayer(layerId)
        }
        if (mapInstance.getLayer(`${layerId}-outline`)) {
          mapInstance.removeLayer(`${layerId}-outline`)
        }
        if (mapInstance.getSource(layerId)) {
          mapInstance.removeSource(layerId)
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
    const mapInstance = map.value

    circleLayers.value.forEach((layerId) => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.setLayoutProperty(layerId, 'visibility', showAffectedAreas ? 'visible' : 'none')

        // Also update outline layers
        const outlineLayerId = `${layerId}-outline`
        if (mapInstance.getLayer(outlineLayerId)) {
          mapInstance.setLayoutProperty(
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
