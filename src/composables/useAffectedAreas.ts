import { ref } from 'vue'
import type { Ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'
import type { LocationData, Filters, AffectedArea } from '@/types/mapTypes'
import type { Feature, Polygon, GeoJsonProperties } from 'geojson'
import { useRouter } from 'vue-router'
import mapService from '@/services/mapService'

export function useMapLayers(
  map: Ref<mapboxgl.Map | null>,
  locationData: Ref<LocationData>,
  filters: Ref<Filters>,
  isAdminPage: Ref<boolean>,
  router: ReturnType<typeof useRouter>,
  emit: (event: 'map-click' | 'edit-poi' | 'edit-affected-area', ...args: any[]) => void, // Add emit as a parameter
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

  const addPopupHandler = (
    layerId: string,
     area: AffectedArea,
    emit: (event: 'map-click' | 'edit-poi' | 'edit-affected-area', ...args: any[]) => void,
  ) => {
    map.value?.on('click', layerId, (e) => {
      if (e.features && e.features.length > 0) {
        const popupContent = `
          <div class="popup-content">
            <h3>Emergency alert!</h3>
            <p>${area.description}</p>
            <h4>Severity: ${area.severityLevel}</h4>
            <h4>Started: ${new Date(area.startDate).toLocaleString()}</h4>
            ${
              isAdminPage.value
                ? `
                <div class="admin-buttons">
                  <button class="edit-affected-area" data-id="${area.id}" type="button">Edit</button>
                  <button class="delete-affected-area" data-id="${area.id}" type="button">Delete</button>
                </div>
                `
                : ''
            }
          </div>
        `

        const popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: true,
        })
          .setLngLat(e.lngLat)
          .setHTML(popupContent)
          .addTo(map.value!)

        const popupElement = popup.getElement()

        if (popupElement) {
          const editButton = popupElement.querySelector('.edit-affected-area')
          if (editButton) {
            editButton.addEventListener('click', () => {
              console.log(`Edit button clicked for Affected Area ID: ${area.id}`)
              emit('edit-affected-area', area.id) // Use the emit function passed as a parameter
              popup.remove()
            })
          } else {
            console.error('Edit button not found in popup')
          }

          const deleteButton = popupElement.querySelector('.delete-affected-area')
          if (deleteButton) {
            deleteButton.addEventListener('click', async () => {
              const confirmed = confirm('Are you sure you want to delete this Affected Area?')
              if (confirmed) {
                try {
                  console.log(`Deleting Affected Area with ID: ${area.id}`)
                  await mapService.deleteAffectedArea(area.id)
                  alert('Affected Area deleted successfully!')

                  locationData.value.affectedAreas = locationData.value.affectedAreas.filter(
                    (a) => a.id !== area.id,
                  )

                  initializeLayers()
                } catch (error) {
                  console.error('Error deleting Affected Area:', error)
                  alert('Failed to delete Affected Area. Please try again.')
                }
              }
            })
          } else {
            console.error('Delete button not found in popup')
          }
        }
      }
    })
  }

  /**
   * Initializes and renders affected area layers on the map.
   *
   * This function creates visual representations of affected areas with different danger levels
   * (high, medium, low) as concentric circles on the map. Each danger level has its own color:
   * - High: Red (innermost circle)
   * - Medium: Orange (middle ring)
   * - Low: Yellow (outer ring)
   */
  const initializeLayers = () => {
    if (!map.value) {
      console.warn('Map not initialized when adding layers')
      return
    }

    if (layersInitialized.value) {
      removeAllLayers()
    }

    locationData.value.affectedAreas.forEach((area, index) => {
      try {
        if (!map.value) return
        const mapInstance = map.value

        const areaId = `affected-area-${index}`

        if (area.highDangerRadiusKm) {
          const highLayerId = `${areaId}-high`
          circleLayers.value.push(highLayerId)

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
              'fill-color': 'rgba(255, 0, 0, 0.4)',
              'fill-outline-color': '#ff0000',
            },
          })

          addPopupHandler(highLayerId, area, emit)
        }

        if (area.mediumDangerRadiusKm && area.highDangerRadiusKm) {
          const mediumLayerId = `${areaId}-medium`
          circleLayers.value.push(mediumLayerId)

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

          const donut: Feature<Polygon, GeoJsonProperties> = {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [
                outerCircle.geometry.coordinates[0],
                [...innerCircle.geometry.coordinates[0]].reverse(),
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
              'fill-color': 'rgba(255, 165, 0, 0.3)',
              'fill-outline-color': '#ffa500',
            },
          })

          addPopupHandler(mediumLayerId, area, emit)
        }

        if (area.lowDangerRadiusKm && area.mediumDangerRadiusKm) {
          const lowLayerId = `${areaId}-low`
          circleLayers.value.push(lowLayerId)

          const outerCircle = turf.circle([area.longitude, area.latitude], area.lowDangerRadiusKm, {
            steps: 64,
            units: 'kilometers',
          })

          const innerCircle = turf.circle(
            [area.longitude, area.latitude],
            area.mediumDangerRadiusKm,
            { steps: 64, units: 'kilometers' },
          )

          const donut: Feature<Polygon, GeoJsonProperties> = {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [
                outerCircle.geometry.coordinates[0],
                [...innerCircle.geometry.coordinates[0]].reverse(),
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
              'fill-color': 'rgba(255, 255, 0, 0.2)',
              'fill-outline-color': '#ffff00',
            },
          })

          addPopupHandler(lowLayerId, area, emit)
        }

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

  /**
   * Removes all circle layers and their associated resources from the map.
   *
   * This function:
   * - Removes each circle layer from the map
   * - Removes each circle layer's outline from the map
   * - Removes the source data associated with each layer
   * - Catches and logs any errors that occur during removal
   * - Clears the circleLayers array when complete
   */
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

  /**
   * Attempts to initialize map layers once the map style is loaded.
   * Implements a retry mechanism to handle cases where the map style isn't immediately available.
   *
   * @param maxAttempts - The maximum number of attempts to initialize layers. Defaults to 5.
   * @remarks
   * The function checks if the map style is loaded. If it is, it initializes the layers immediately.
   * If not, it will retry every 200ms until either the style loads or the maximum number of attempts is reached.
   */
  const tryInitializeLayers = (maxAttempts = 5) => {
    let attempts = 0

    const attemptInit = () => {
      if (!map.value) return

      if (map.value.isStyleLoaded()) {
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
    attemptInit()
  }

  /**
   * Updates the visibility of affected area layers and their outlines on the map.
   *
   * @param showAffectedAreas - Boolean flag that determines whether to show (true) or hide (false) the affected areas
   */
  const updateLayerVisibility = (showAffectedAreas: boolean) => {
    if (!map.value) return
    const mapInstance = map.value

    circleLayers.value.forEach((layerId) => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.setLayoutProperty(layerId, 'visibility', showAffectedAreas ? 'visible' : 'none')

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

export function useAffectedAreaManagement(
  map: Ref<mapboxgl.Map | null>,
  locationData: Ref<LocationData>,
  isAdminPage: Ref<boolean>,
  router: ReturnType<typeof useRouter>,
  emit: (event: 'map-click' | 'edit-poi' | 'edit-affected-area', ...args: any[]) => void, // Add emit as a parameter
) {
  const initializeAffectedAreaPopups = () => {
    if (!map.value) return

    console.log('Initializing affected area popups...')

    locationData.value.affectedAreas.forEach((area) => {
      const popupContent = `
        <div class="popup-content">
          <h3>Emergency alert!</h3>
          <p>${area.description}</p>
          <h4>Severity: ${area.severityLevel}</h4>
          <h4>Started: ${new Date(area.startDate).toLocaleString()}</h4>
          ${
            isAdminPage.value
              ? `
              <div class="admin-buttons">
                <button class="edit-affected-area" data-id="${area.id}" type="button">Edit</button>
                <button class="delete-affected-area" data-id="${area.id}" type="button">Delete</button>
              </div>
              `
              : ''
          }
        </div>
      `

      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
      })
        .setLngLat([area.longitude, area.latitude])
        .setHTML(popupContent)
        .addTo(map.value!)

      const popupElement = popup.getElement()

      if (popupElement) {
        const editButton = popupElement.querySelector('.edit-affected-area')
        if (editButton) {
          editButton.addEventListener('click', () => {
            console.log(`Edit button clicked for Affected Area ID: ${area.id}`)
            emit('edit-affected-area', area.id) // Use the emit function passed as a parameter
            popup.remove()
          })
        } else {
          console.error('Edit button not found in popup')
        }
      }
    })
  }

  return {
    initializeAffectedAreaPopups,
  }
}
