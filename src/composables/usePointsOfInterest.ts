import { ref, watch, createApp } from 'vue'
import type { Ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import { getTypeDisplayName } from '@/utils/mapUtils'
import type { LocationData, Filters, PointOfInterest } from '@/types/mapTypes'
import MapIcon from '@/components/map/MapIcon.vue'
import { useRouter } from 'vue-router'
import mapService from '@/services/mapService'

interface SimpleMarker {
  remove(): void
  addTo(map: mapboxgl.Map): this
  setLngLat(lngLat: [number, number]): this
  setPopup(popup?: mapboxgl.Popup): this
}

export function useMarkerManagement(
  map: Ref<mapboxgl.Map | null>,
  locationData: Ref<LocationData>,
  filters: Ref<Filters>,
  isAdminPage: Ref<boolean>,
  router: ReturnType<typeof useRouter>,
) {
  const markers = ref<SimpleMarker[]>([])

  const typeToFilterKey: Record<string, keyof Filters> = {
    HOSPITAL: 'hospital',
    SHELTER: 'shelter',
    DEFIBRILLATOR: 'defibrillator',
    WATER_STATION: 'water_station',
    FOOD_CENTRAL: 'food_central',
    MEETING_PLACE: 'meeting_place',
  }

  /**
   * Converts the point of interest type to lowercase to determine the marker type.
   *
   * @param poiType - The point of interest type string to convert
   * @returns The lowercase version of the point of interest type
   */
  const getMarkerType = (poiType: string): string => {
    return poiType.toLowerCase()
  }

  /**
   * Creates a custom marker element for a point of interest (POI) on a map.
   *
   * This function generates a DOM element and mounts a Vue component (`MapIcon`)
   * into it, allowing for a customizable marker appearance based on the provided
   * POI type and other properties.
   *
   * @param poiType - A string representing the type of the point of interest.
   *                  This determines the appearance of the marker.
   * @returns A DOM element containing the mounted `MapIcon` component,
   *          which can be used as a marker on a map.
   */
  const createMarker = (poiType: string) => {
    const el = document.createElement('div')

    const markerApp = createApp(MapIcon, {
      type: poiType,
      size: 'small',
      withBackground: true,
    })

    markerApp.mount(el)

    return el
  }

  /**
   * Initializes and adds markers to the map for each point of interest (POI) based on the provided location data.
   *
   * This function performs the following steps:
   * 1. Ensures the map instance is available.
   * 2. Clears any existing markers from the map.
   * 3. Iterates through the points of interest and adds markers for each POI that passes the filter criteria.
   * 4. Creates a custom marker element for each POI and attaches it to the map.
   * 5. Configures a popup for each marker with details about the POI, such as its type, description, opening hours, and contact information.
   *
   * Markers are only added for POIs whose types are enabled in the filters.
   */
  const initializeMarkers = () => {
    if (!map.value) return

    const mapInstance = map.value

    removeAllMarkers()

    locationData.value.pointsOfInterest.forEach((poi: PointOfInterest) => {
      const filterKey = typeToFilterKey[poi.type]

      if (filters.value[filterKey] !== false) {
        const markerType = getMarkerType(poi.type)
        const el = createMarker(markerType)
        el.setAttribute('data-id', poi.id.toString())
        el.setAttribute('data-type', poi.type)

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([poi.longitude, poi.latitude])
          .setPopup(
            new mapboxgl.Popup().setHTML(`
              <div class="popup-content">
                <h3>${getTypeDisplayName(poi.type)}</h3>
                <p>${poi.description}</p>
                ${poi.opensAt ? `<h4>Open: ${poi.opensAt} - ${poi.closesAt}</h4>` : ''}
                ${poi.contactNumber ? `<h4>Contact: ${poi.contactNumber}</h4>` : ''}
                ${
                  isAdminPage.value
                    ? `
                    <div class="admin-buttons">
                      <button class="edit-poi" data-id="${poi.id}" type="button">Edit</button>
                      <button class="delete-poi" data-id="${poi.id}" type="button">Delete</button>
                    </div>
                    `
                    : ''
                }
              </div>
            `),
          )
          .addTo(mapInstance)

        markers.value.push(marker)

        // Attach event listener for the "Edit" button after the popup is added
        marker.getPopup()?.on('open', () => {
          const editButton = marker.getPopup()?.getElement()?.querySelector('.edit-poi')
          console.log('Edit button:', editButton)
          if (editButton) {
            editButton.addEventListener('click', async () => {
              console.log(`Navigating to Update POI View for ID: ${poi.id}`)

              // Ensure locationData is populated
              if (!locationData.value.pointsOfInterest.length) {
                try {
                  console.log('Fetching POI data before navigation...')
                  const response = await mapService.getAllPointsOfInterest() // Fetch POIs
                  locationData.value.pointsOfInterest = response // Update locationData
                } catch (error) {
                  console.error('Failed to fetch POIs:', error)
                  alert('Failed to load POI data. Please try again.')
                  return
                }
              }

              router.push({
                name: 'updatePOI',
                query: { id: poi.id.toString() },
              })
            })
          } else {
            console.error('Edit button not found in popup')
          }
        })

        // Attach event listener for the "Delete" button after the popup is added
        marker.getPopup()?.on('open', () => {
          const deleteButton = marker.getPopup()?.getElement()?.querySelector('.delete-poi')
          if (deleteButton) {
            deleteButton.addEventListener('click', async () => {
              console.log(`Attempting to delete POI with ID: ${poi.id}`)

              // Show a confirmation dialog
              const confirmed = confirm('Are you sure you want to delete this Point of Interest?')
              if (!confirmed) {
                return
              }

              try {
                // Call the deletePointOfInterest method from mapService
                await mapService.deletePointOfInterest(poi.id)
                alert('POI deleted successfully!')

                // Remove the marker from the map
                marker.remove()

                // Update the locationData to remove the deleted POI
                locationData.value.pointsOfInterest = locationData.value.pointsOfInterest.filter(
                  (p) => p.id !== poi.id,
                )
              } catch (error) {
                console.error('Error deleting POI:', error)
                alert('Failed to delete POI. Please try again.')
              }
            })
          } else {
            console.error('Delete button not found in popup')
          }
        })
      }
    })
  }

  /**
   * Updates the markers on the map. If the map instance is not available, the function exits early.
   * Calls `initializeMarkers` to refresh or initialize the markers on the map.
   */
  const updateMarkers = () => {
    if (!map.value) return
    initializeMarkers()
  }

  /**
   * Removes all markers from the map and clears the markers array.
   *
   * This function iterates through the `markers` array, removes each marker
   * from the map, and then resets the `markers` array to an empty state.
   */
  const removeAllMarkers = () => {
    markers.value.forEach((marker) => marker.remove())
    markers.value = []
  }

  watch(
    () => filters.value,
    (newFilters) => {
      if (!map.value) return

      updateMarkers()
    },
    { deep: true },
  )

  watch(
    () => locationData.value,
    () => {
      if (map.value) {
        updateMarkers()
      }
    },
    { deep: true },
  )

  return {
    markers,
    initializeMarkers,
    updateMarkers,
  }
}
