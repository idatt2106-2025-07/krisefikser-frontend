import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, watch } from 'vue'
import { useSearchGeocoder } from '@/composables/useSearchGeocoder'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import mapboxgl from 'mapbox-gl'
import { createSearchableGeoJSON } from '@/utils/mapUtils'
import type { LocationData } from '@/types/mapTypes'

// Define the type for the result callback
interface GeocoderResult {
  result: {
    properties?: {
      id?: number
      title?: string
    }
    geometry?: {
      coordinates: [number, number]
    }
  }
}

// Mock MapboxGeocoder
vi.mock('@mapbox/mapbox-gl-geocoder', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      on: vi.fn((event, callback) => {
        // Store the callback so we can trigger it in tests
        if (event === 'result') {
          mockCallbacks.result = callback
        }
        return this
      }),
      setProximity: vi.fn(),
    })),
  }
})

// Store mock callbacks for testing - with proper typing
const mockCallbacks: Record<string, (arg: GeocoderResult) => void> = {}

// Mock mapboxgl
vi.mock('mapbox-gl', () => {
  return {
    default: {
      accessToken: 'mock-token',
      Marker: vi.fn(() => ({
        getElement: vi.fn(() => ({
          getAttribute: vi.fn((attr) => (attr === 'data-id' ? '1' : null)),
        })),
        togglePopup: vi.fn(),
      })),
    },
  }
})

// Mock createSearchableGeoJSON utility
vi.mock('@/utils/mapUtils', () => ({
  createSearchableGeoJSON: vi.fn((data) => ({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [10, 20] },
        properties: {
          id: 1,
          title: 'Test Hospital',
          description: 'Medical facility',
          category: 'HOSPITAL',
        },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [11, 21] },
        properties: {
          id: 2,
          title: 'Test Shelter',
          description: 'Emergency shelter',
          category: 'SHELTER',
        },
      },
    ],
  })),
}))

describe('useSearchGeocoder', () => {
  let map
  let locationData
  let markers
  let addControlSpy
  let flyToSpy

  beforeEach(() => {
    vi.clearAllMocks()

    // Create map mock
    addControlSpy = vi.fn()
    flyToSpy = vi.fn()
    map = ref({
      addControl: addControlSpy,
      flyTo: flyToSpy,
    })

    // Create location data mock
    locationData = ref({
      pointsOfInterest: [
        {
          id: 1,
          type: 'HOSPITAL',
          latitude: 20,
          longitude: 10,
          description: 'Medical facility',
        },
        {
          id: 2,
          type: 'SHELTER',
          latitude: 21,
          longitude: 11,
          description: 'Emergency shelter',
        },
      ],
      affectedAreas: [],
    })

    // Create markers mock
    markers = ref([new mapboxgl.Marker(), new mapboxgl.Marker()])

    // Reset mock callbacks
    for (const key in mockCallbacks) {
      delete mockCallbacks[key]
    }
  })

  it('should return the correct interface', () => {
    const result = useSearchGeocoder(map, locationData, markers)

    expect(result).toHaveProperty('geocoder')
    expect(result).toHaveProperty('initializeSearch')
  })

  it('should initialize geocoder with correct options', () => {
    const { initializeSearch, geocoder } = useSearchGeocoder(map, locationData, markers)

    initializeSearch()

    expect(MapboxGeocoder).toHaveBeenCalledWith({
      accessToken: 'mock-token',
      mapboxgl: mapboxgl as any,
      placeholder: 'Search locations...',
      localGeocoder: expect.any(Function),
      render: expect.any(Function),
      localGeocoderOnly: false,
    })

    expect(addControlSpy).toHaveBeenCalledWith(expect.any(Object), 'top-left')
    expect(geocoder.value).not.toBeNull()
  })

  it('should not initialize geocoder when map is null', () => {
    const nullMap = ref(null)
    const { initializeSearch, geocoder } = useSearchGeocoder(nullMap, locationData, markers)

    initializeSearch()

    expect(MapboxGeocoder).not.toHaveBeenCalled()
    expect(geocoder.value).toBeNull()
  })

  it('should filter search results correctly in custom geocoder', () => {
    const { initializeSearch } = useSearchGeocoder(map, locationData, markers)

    initializeSearch()

    // Get the localGeocoder function from the MapboxGeocoder constructor call
    const localGeocoderFn = MapboxGeocoder.mock.calls[0][0].localGeocoder

    // Test filtering with "hospital" query
    const results = localGeocoderFn('hospital', locationData.value)

    expect(createSearchableGeoJSON).toHaveBeenCalledWith(locationData.value)
    expect(results.length).toBe(1)
    expect(results[0].properties.title).toBe('Test Hospital')
    expect(results[0].place_name).toBe('Test Hospital')
  })

  it('should return empty array for short or empty queries', () => {
    const { initializeSearch } = useSearchGeocoder(map, locationData, markers)

    initializeSearch()

    // Get the localGeocoder function
    const localGeocoderFn = MapboxGeocoder.mock.calls[0][0].localGeocoder

    // Test with short query
    expect(localGeocoderFn('a')).toEqual([])

    // Test with empty query
    expect(localGeocoderFn('')).toEqual([])

    // Test with null query
    expect(localGeocoderFn(null)).toEqual([])
  })

  it('should handle result selection and fly to location', () => {
    const { initializeSearch } = useSearchGeocoder(map, locationData, markers)

    initializeSearch()

    expect(mockCallbacks.result).toBeDefined()

    // Simulate a result selection event
    mockCallbacks.result({
      result: {
        properties: {
          id: 1,
          title: 'Test Hospital',
        },
        geometry: {
          coordinates: [10, 20],
        },
      },
    })

    // Check that the marker's popup was toggled
    expect(markers.value[0].togglePopup).toHaveBeenCalled()

    // Check that the map flew to the correct coordinates
    expect(flyToSpy).toHaveBeenCalledWith({
      center: [10, 20],
      zoom: 15,
      essential: true,
    })
  })

  it('should render custom templates for search results', () => {
    const { initializeSearch } = useSearchGeocoder(map, locationData, markers)

    initializeSearch()

    // Get the render function from the MapboxGeocoder constructor call
    const renderFn = MapboxGeocoder.mock.calls[0][0].render

    // Test rendering a POI item
    const poiHtml = renderFn({
      properties: {
        title: 'Test Hospital',
        description: 'Medical facility',
      },
    })

    expect(poiHtml).toContain('<div class="geocoder-result">')
    expect(poiHtml).toContain('<strong>Test Hospital</strong>')
    expect(poiHtml).toContain('<span>Medical facility</span>')

    // Test rendering a Mapbox geocoder result
    const mapboxHtml = renderFn({
      text: 'New York',
      place_name: 'New York, NY, USA',
    })

    expect(mapboxHtml).toContain('<div class="geocoder-result global-location">')
    expect(mapboxHtml).toContain('<strong>New York</strong>')
    expect(mapboxHtml).toContain('<span class="location-details">New York, NY, USA</span>')
  })
})
