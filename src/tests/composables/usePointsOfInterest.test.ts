// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useMarkerManagement } from '@/composables/usePointsOfInterest'
import mapboxgl from 'mapbox-gl'
import * as mapUtils from '@/utils/mapUtils'

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    createApp: vi.fn(() => ({
      mount: vi.fn(),
    })),
  }
})

vi.mock('mapbox-gl', () => {
  const PopupMock = vi.fn(() => ({
    setHTML: vi.fn().mockReturnThis(),
  }))

  const MarkerMock = vi.fn(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    setPopup: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  }))

  return {
    default: {
      Marker: MarkerMock,
      Popup: PopupMock,
    },
  }
})

vi.mock('@/utils/mapUtils', () => ({
  getTypeDisplayName: vi.fn((type) => `Mocked ${type} Display Name`),
}))

describe('useMarkerManagement', () => {
  let map
  let locationData
  let filters
  let mockMapInstance

  beforeEach(() => {
    vi.clearAllMocks()

    mockMapInstance = {
      addLayer: vi.fn(),
      on: vi.fn(),
    }

    map = ref(mockMapInstance)

    locationData = ref({
      pointsOfInterest: [
        {
          id: 1,
          type: 'HOSPITAL',
          latitude: 40.712776,
          longitude: -74.005974,
          description: 'City Hospital',
          opensAt: '08:00',
          closesAt: '20:00',
          contactNumber: '123-456-7890',
        },
        {
          id: 2,
          type: 'SHELTER',
          latitude: 40.713,
          longitude: -74.006,
          description: 'Emergency Shelter',
          opensAt: '24/7',
          closesAt: '',
          contactNumber: '123-456-7891',
        },
        {
          id: 3,
          type: 'WATER_STATION',
          latitude: 40.714,
          longitude: -74.007,
          description: 'Water Supply Station',
          opensAt: '',
          closesAt: '',
          contactNumber: '',
        },
      ],
    })

    filters = ref({
      hospital: true,
      shelter: true,
      defibrillator: true,
      water_station: true,
      food_central: true,
      meeting_place: true,
    })

    document.createElement = vi.fn().mockReturnValue({
      setAttribute: vi.fn(),
    })
  })

  it('should return the correct interface', () => {
    const result = useMarkerManagement(map, locationData, filters)

    expect(result).toHaveProperty('markers')
    expect(result).toHaveProperty('initializeMarkers')
    expect(result).toHaveProperty('updateMarkers')
  })

  it('should initialize markers for all points of interest when filters allow', () => {
    const { initializeMarkers, markers } = useMarkerManagement(map, locationData, filters)

    initializeMarkers()

    expect(mapboxgl.Marker).toHaveBeenCalledTimes(3)
    expect(markers.value.length).toBe(3)
  })

  it('should filter out markers based on filters', () => {
    filters.value.hospital = false

    const { initializeMarkers, markers } = useMarkerManagement(map, locationData, filters)

    initializeMarkers()

    expect(mapboxgl.Marker).toHaveBeenCalledTimes(2)
    expect(markers.value.length).toBe(2)
  })

  it('should create markers with correct properties', () => {
    const { initializeMarkers } = useMarkerManagement(map, locationData, filters)

    initializeMarkers()

    const firstPOI = locationData.value.pointsOfInterest[0]

    expect(mapboxgl.Marker).toHaveBeenCalledWith({
      element: expect.any(Object),
    })

    const markerInstance = mapboxgl.Marker.mock.results[0].value
    expect(markerInstance.setLngLat).toHaveBeenCalledWith([firstPOI.longitude, firstPOI.latitude])

    expect(mapboxgl.Popup).toHaveBeenCalled()
    const popupInstance = mapboxgl.Popup.mock.results[0].value
    expect(popupInstance.setHTML).toHaveBeenCalledWith(
      expect.stringContaining(firstPOI.description),
    )
    expect(popupInstance.setHTML).toHaveBeenCalledWith(
      expect.stringContaining(firstPOI.contactNumber),
    )
  })

  it('should handle null or undefined map instance', () => {
    const nullMap = ref(null)
    const { initializeMarkers, updateMarkers } = useMarkerManagement(nullMap, locationData, filters)

    initializeMarkers()
    updateMarkers()

    expect(mapboxgl.Marker).not.toHaveBeenCalled()
  })

  it('should handle missing or invalid POI data', () => {
    const emptyData = ref({
      pointsOfInterest: null,
    })

    const { initializeMarkers } = useMarkerManagement(map, emptyData, filters)

    initializeMarkers()

    expect(mapboxgl.Marker).not.toHaveBeenCalled()
  })

  it('should create custom marker elements with correct attributes', () => {
    const { initializeMarkers } = useMarkerManagement(map, locationData, filters)

    initializeMarkers()

    expect(document.createElement).toHaveBeenCalledTimes(3)
    expect(document.createElement).toHaveBeenCalledWith('div')

    const markerElement = document.createElement.mock.results[0].value
    expect(markerElement.setAttribute).toHaveBeenCalledWith('data-id', '1')
    expect(markerElement.setAttribute).toHaveBeenCalledWith('data-type', 'HOSPITAL')
  })

  it('should remove all markers when removeAllMarkers is called', () => {
    const removeSpy = vi.fn()

    vi.mocked(mapboxgl.Marker).mockImplementation(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: removeSpy,
    }))

    const { initializeMarkers, markers, updateMarkers } = useMarkerManagement(
      map,
      locationData,
      filters,
    )

    initializeMarkers()

    const initialLength = markers.value.length
    expect(initialLength).toBe(3)

    vi.clearAllMocks()

    updateMarkers()

    expect(removeSpy).toHaveBeenCalledTimes(3)
  })

  it('should update markers when filters change', async () => {
    const removeSpy = vi.fn()

    vi.mocked(mapboxgl.Marker).mockImplementation(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: removeSpy,
    }))

    const { initializeMarkers, markers } = useMarkerManagement(map, locationData, filters)

    initializeMarkers()

    expect(markers.value.length).toBe(3)

    vi.clearAllMocks()

    filters.value = {
      ...filters.value,
      hospital: false,
    }

    initializeMarkers()

    expect(removeSpy).toHaveBeenCalled()

    expect(mapboxgl.Marker).toHaveBeenCalledTimes(2)
  })

  it('should update markers when locationData changes', async () => {
    const removeSpy = vi.fn()

    vi.mocked(mapboxgl.Marker).mockImplementation(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: removeSpy,
    }))

    const { initializeMarkers, markers } = useMarkerManagement(map, locationData, filters)

    initializeMarkers()

    expect(markers.value.length).toBe(3)

    vi.clearAllMocks()

    locationData.value = {
      pointsOfInterest: [
        {
          id: 4,
          type: 'FOOD_CENTRAL',
          latitude: 40.715,
          longitude: -74.008,
          description: 'Food Distribution Center',
          opensAt: '09:00',
          closesAt: '17:00',
          contactNumber: '',
        },
      ],
    }

    initializeMarkers()

    expect(removeSpy).toHaveBeenCalled()

    expect(mapboxgl.Marker).toHaveBeenCalledTimes(1)
  })

  it('should correctly handle markers with missing optional fields', () => {
    const setHTMLSpy = vi.fn().mockReturnThis()

    vi.mocked(mapboxgl.Popup).mockImplementation(() => ({
      setHTML: setHTMLSpy,
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    }))

    locationData.value = {
      pointsOfInterest: [
        {
          id: 5,
          type: 'MEETING_PLACE',
          latitude: 40.716,
          longitude: -74.009,
          description: 'Meeting Point',
        },
      ],
    }

    const { initializeMarkers } = useMarkerManagement(map, locationData, filters)

    initializeMarkers()

    expect(mapboxgl.Marker).toHaveBeenCalledTimes(1)

    expect(setHTMLSpy).toHaveBeenCalled()
    const popupHTML = setHTMLSpy.mock.calls[0][0]
    expect(popupHTML).not.toContain('<h4>Open:')
    expect(popupHTML).not.toContain('<h4>Contact:')
  })
})
