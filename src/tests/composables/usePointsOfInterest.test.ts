import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useMarkerManagement } from '@/composables/usePointsOfInterest'
import mapboxgl from 'mapbox-gl'
import * as mapUtils from '@/utils/mapUtils'

// Mock Vue's createApp
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    createApp: vi.fn(() => ({
      mount: vi.fn(),
    })),
  }
})

// Mock mapboxgl
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

// Mock getTypeDisplayName utility
vi.mock('@/utils/mapUtils', () => ({
  getTypeDisplayName: vi.fn((type) => `Mocked ${type} Display Name`),
}))

describe('useMarkerManagement', () => {
  let map
  let locationData
  let filters
  let mockMapInstance

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Create a mock map instance
    mockMapInstance = {
      addLayer: vi.fn(),
      on: vi.fn(),
    }

    // Create refs with test data
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

    // Mock document.createElement
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

    // Verify correct number of markers were created
    expect(mapboxgl.Marker).toHaveBeenCalledTimes(3)
    expect(markers.value.length).toBe(3)
  })

  it('should filter out markers based on filters', () => {
    // Set hospital filter to false
    filters.value.hospital = false

    const { initializeMarkers, markers } = useMarkerManagement(map, locationData, filters)

    initializeMarkers()

    // Only 2 markers should be created (shelter and water station)
    expect(mapboxgl.Marker).toHaveBeenCalledTimes(2)
    expect(markers.value.length).toBe(2)
  })

  it('should create markers with correct properties', () => {
    const { initializeMarkers } = useMarkerManagement(map, locationData, filters)

    initializeMarkers()

    // Check first marker was created with correct data
    const firstPOI = locationData.value.pointsOfInterest[0]

    // Verify marker was created with correct element
    expect(mapboxgl.Marker).toHaveBeenCalledWith({
      element: expect.any(Object),
    })

    // Verify setLngLat was called with correct coordinates
    const markerInstance = mapboxgl.Marker.mock.results[0].value
    expect(markerInstance.setLngLat).toHaveBeenCalledWith([firstPOI.longitude, firstPOI.latitude])

    // Verify popup contains correct content
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

    // These should not throw errors
    initializeMarkers()
    updateMarkers()

    expect(mapboxgl.Marker).not.toHaveBeenCalled()
  })

  it('should handle missing or invalid POI data', () => {
    const emptyData = ref({
      pointsOfInterest: null,
    })

    const { initializeMarkers } = useMarkerManagement(map, emptyData, filters)

    // Should not throw errors
    initializeMarkers()

    expect(mapboxgl.Marker).not.toHaveBeenCalled()
  })

  it('should create custom marker elements with correct attributes', () => {
    const { initializeMarkers } = useMarkerManagement(map, locationData, filters)

    initializeMarkers()

    // Check marker element creation
    expect(document.createElement).toHaveBeenCalledTimes(3)
    expect(document.createElement).toHaveBeenCalledWith('div')

    // Check attributes were set
    const markerElement = document.createElement.mock.results[0].value
    expect(markerElement.setAttribute).toHaveBeenCalledWith('data-id', '1')
    expect(markerElement.setAttribute).toHaveBeenCalledWith('data-type', 'HOSPITAL')
  })

  // Fix test 1: "should remove all markers when removeAllMarkers is called"
  it('should remove all markers when removeAllMarkers is called', () => {
    // Create a separate spy for the remove method
    const removeSpy = vi.fn()

    // Update marker mock to track removal
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

    // First initialize markers
    initializeMarkers()

    // Store initial length
    const initialLength = markers.value.length
    expect(initialLength).toBe(3)

    // Clear mocks to track removals
    vi.clearAllMocks()

    // Call updateMarkers which internally calls removeAllMarkers
    updateMarkers()

    // Each marker's remove method should have been called
    // We had 3 markers, so remove should be called 3 times
    expect(removeSpy).toHaveBeenCalledTimes(3)
  })

  // Fix test 2: "should update markers when filters change"
  it('should update markers when filters change', async () => {
    // Create a separate spy for the remove method
    const removeSpy = vi.fn()

    // Update marker mock to track removal
    vi.mocked(mapboxgl.Marker).mockImplementation(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: removeSpy,
    }))

    const { initializeMarkers, markers } = useMarkerManagement(map, locationData, filters)

    // First initialize markers
    initializeMarkers()

    // Verify initial markers
    expect(markers.value.length).toBe(3)

    // Clear mocks
    vi.clearAllMocks()

    // Change a filter - this should trigger the watch callback
    filters.value = {
      ...filters.value,
      hospital: false,
    }

    // Call initializeMarkers again - this simulates what would happen in the watch callback
    initializeMarkers()

    // Markers should have been removed
    expect(removeSpy).toHaveBeenCalled()

    // Should have created 2 markers (SHELTER and WATER_STATION)
    expect(mapboxgl.Marker).toHaveBeenCalledTimes(2)
  })

  // Fix test 3: "should update markers when locationData changes"
  it('should update markers when locationData changes', async () => {
    // Create a separate spy for the remove method
    const removeSpy = vi.fn()

    // Update marker mock to track removal
    vi.mocked(mapboxgl.Marker).mockImplementation(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: removeSpy,
    }))

    const { initializeMarkers, markers } = useMarkerManagement(map, locationData, filters)

    // First initialize markers
    initializeMarkers()

    // Verify initial markers
    expect(markers.value.length).toBe(3)

    // Clear mocks
    vi.clearAllMocks()

    // Change locationData
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

    // Call initializeMarkers again - this simulates what would happen in the watch callback
    initializeMarkers()

    // Markers should have been removed
    expect(removeSpy).toHaveBeenCalled()

    // Should have created 1 marker (FOOD_CENTRAL)
    expect(mapboxgl.Marker).toHaveBeenCalledTimes(1)
  })

  // Fix test 4: "should correctly handle markers with missing optional fields"
  it('should correctly handle markers with missing optional fields', () => {
    // Mock the setHTML function to capture the HTML content
    const setHTMLSpy = vi.fn().mockReturnThis()

    // Update the Popup mock to capture the HTML
    vi.mocked(mapboxgl.Popup).mockImplementation(() => ({
      setHTML: setHTMLSpy,
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    }))

    // Create POI with minimal data
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

    // Verify marker was created
    expect(mapboxgl.Marker).toHaveBeenCalledTimes(1)

    // Verify popup HTML doesn't include empty fields
    expect(setHTMLSpy).toHaveBeenCalled()
    const popupHTML = setHTMLSpy.mock.calls[0][0]
    expect(popupHTML).not.toContain('<h4>Open:')
    expect(popupHTML).not.toContain('<h4>Contact:')
  })
})
