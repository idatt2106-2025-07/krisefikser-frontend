import { ref, watch, createApp, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import { getTypeDisplayName } from '@/utils/mapUtils'
import type { LocationData, Filters, PointOfInterest } from '@/types/mapTypes'
import MapIcon from '@/components/map/MapIcon.vue'
import { useRouter } from 'vue-router'
import mapService from '@/services/mapService'

type SimpleMarker = {
  remove(): void
  addTo(map: mapboxgl.Map): SimpleMarker
  setLngLat(lngLat: [number, number]): SimpleMarker
  setPopup(popup?: mapboxgl.Popup): SimpleMarker
  getPopup(): mapboxgl.Popup | null | undefined
}

type MarkerApp = {
  unmount(): void
}

type MarkerWithApp = SimpleMarker & {
  app?: MarkerApp
}

const typeToFilterKey: Record<string, keyof Filters> = {
  HOSPITAL: 'hospital',
  SHELTER: 'shelter',
  DEFIBRILLATOR: 'defibrillator',
  WATER_STATION: 'water_station',
  FOOD_CENTRAL: 'food_central',
  MEETING_PLACE: 'meeting_place',
}

export function useMarkerManagement(
  map: Ref<mapboxgl.Map | null>,
  locationData: Ref<LocationData>,
  filters: Ref<Filters>,
  isAdminPage: Ref<boolean>,
  router: ReturnType<typeof useRouter>,
) {
  const markers = ref<MarkerWithApp[]>([])
  const markerApps: MarkerApp[] = []

  onUnmounted(() => {
    removeAllMarkers()
    markerApps.forEach((app) => app.unmount())
  })

  const getMarkerType = (poiType: string): string => {
    return poiType.toLowerCase()
  }

  const createMarkerElement = (poiType: string, poiId: number): HTMLElement => {
    const el = document.createElement('div')
    const markerApp = createApp(MapIcon, {
      type: poiType,
      size: 'small',
      withBackground: true,
    })

    const mountedApp = {
      unmount: () => markerApp.unmount(),
    }

    markerApp.mount(el)
    markerApps.push(mountedApp)

    el.setAttribute('data-id', poiId.toString())
    el.setAttribute('data-type', poiType)

    return el
  }

  const createPopupContent = (poi: PointOfInterest): string => {
    return `
      <div class="popup-content">
        <h3>${getTypeDisplayName(poi.type)}</h3>
        <p>${poi.description}</p>
        ${poi.opensAt ? `<h4>Open: ${poi.opensAt} - ${poi.closesAt}</h4>` : ''}
        ${poi.contactNumber ? `<h4>Contact: ${poi.contactNumber}</h4>` : ''}
        <button class="directions-btn" data-lng="${poi.longitude}" data-lat="${poi.latitude}">
          Get Directions
        </button>
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
    `
  }

  const setupEditButtonHandler = (marker: MarkerWithApp, poi: PointOfInterest) => {
    const popup = marker.getPopup()
    if (!popup) return

    popup.on('open', () => {
      const editButton = popup.getElement()?.querySelector('.edit-poi')
      if (!editButton) {
        console.warn('Edit button not found in popup')
        return
      }

      const handler = async () => {
        console.log(`Navigating to Update POI View for ID: ${poi.id}`)

        if (!locationData.value.pointsOfInterest.length) {
          try {
            console.log('Fetching POI data before navigation...')
            const response = await mapService.getAllPointsOfInterest()
            locationData.value.pointsOfInterest = response
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
      }

      editButton.addEventListener('click', handler)

      // Cleanup
      popup.on('close', () => {
        editButton.removeEventListener('click', handler)
      })
    })
  }

  const setupDeleteButtonHandler = (marker: MarkerWithApp, poi: PointOfInterest) => {
    const popup = marker.getPopup()
    if (!popup) return

    popup.on('open', () => {
      const deleteButton = popup.getElement()?.querySelector('.delete-poi')
      if (!deleteButton) {
        console.warn('Delete button not found in popup')
        return
      }

      const handler = async () => {
        const confirmed = confirm('Are you sure you want to delete this Point of Interest?')
        if (!confirmed) return

        try {
          await mapService.deletePointOfInterest(poi.id)
          alert('POI deleted successfully!')

          marker.remove()
          locationData.value.pointsOfInterest = locationData.value.pointsOfInterest.filter(
            (p) => p.id !== poi.id,
          )
        } catch (error) {
          console.error('Error deleting POI:', error)
          alert('Failed to delete POI. Please try again.')
        }
      }

      deleteButton.addEventListener('click', handler)

      // Cleanup
      popup.on('close', () => {
        deleteButton.removeEventListener('click', handler)
      })
    })
  }

  const createMapMarker = (poi: PointOfInterest): MarkerWithApp | null => {
    if (!map.value) return null

    const filterKey = typeToFilterKey[poi.type]
    if (filters.value[filterKey] === false) return null

    const markerType = getMarkerType(poi.type)
    const el = createMarkerElement(markerType, poi.id)

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([poi.longitude, poi.latitude])
      .setPopup(new mapboxgl.Popup().setHTML(createPopupContent(poi)))
      .addTo(map.value)

    if (isAdminPage.value) {
      setupEditButtonHandler(marker, poi)
      setupDeleteButtonHandler(marker, poi)
    }

    return marker
  }

  const removeAllMarkers = () => {
    markers.value.forEach((marker) => {
      marker.remove()
      if (marker.app) {
        marker.app.unmount()
      }
    })
    markers.value = []
  }

  const initializeMarkers = () => {
    if (!map.value) return
    if (!locationData.value?.pointsOfInterest) {
      console.warn('POI data is not available or not an array')
      return
    }

    removeAllMarkers()

    const newMarkers = locationData.value.pointsOfInterest
      .map((poi) => createMapMarker(poi))
      .filter((marker): marker is MarkerWithApp => marker !== null)

    markers.value = newMarkers
  }

  const updateMarkers = () => {
    if (!map.value) return
    initializeMarkers()
  }

  watch(
    () => [filters.value, locationData.value],
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
    removeAllMarkers,
  }
}
