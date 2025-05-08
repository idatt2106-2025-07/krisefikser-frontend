/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-enable @typescript-eslint/ban-ts-comment */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, watch } from 'vue'
import { useSearchGeocoder } from '@/composables/useSearchGeocoder'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import mapboxgl from 'mapbox-gl'
import { createSearchableGeoJSON } from '@/utils/mapUtils'
import type { LocationData } from '@/types/mapTypes'

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

vi.mock('@mapbox/mapbox-gl-geocoder', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      on: vi.fn((event, callback) => {
        if (event === 'result') {
          mockCallbacks.result = callback
        }
        return this
      }),
      setProximity: vi.fn(),
    })),
  }
})

const mockCallbacks: Record<string, (arg: GeocoderResult) => void> = {}

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

    addControlSpy = vi.fn()
    flyToSpy = vi.fn()
    map = ref({
      addControl: addControlSpy,
      flyTo: flyToSpy,
    })

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

    markers = ref([new mapboxgl.Marker(), new mapboxgl.Marker()])

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

    const localGeocoderFn = MapboxGeocoder.mock.calls[0][0].localGeocoder

    const results = localGeocoderFn('hospital', locationData.value)

    expect(createSearchableGeoJSON).toHaveBeenCalledWith(locationData.value)
    expect(results.length).toBe(1)
    expect(results[0].properties.title).toBe('Test Hospital')
    expect(results[0].place_name).toBe('Test Hospital')
  })

  it('should return empty array for short or empty queries', () => {
    const { initializeSearch } = useSearchGeocoder(map, locationData, markers)

    initializeSearch()

    const localGeocoderFn = MapboxGeocoder.mock.calls[0][0].localGeocoder

    expect(localGeocoderFn('a')).toEqual([])

    expect(localGeocoderFn('')).toEqual([])

    expect(localGeocoderFn(null)).toEqual([])
  })

  it('should handle result selection and fly to location', () => {
    const { initializeSearch } = useSearchGeocoder(map, locationData, markers)

    initializeSearch()

    expect(mockCallbacks.result).toBeDefined()

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

    expect(markers.value[0].togglePopup).toHaveBeenCalled()

    expect(flyToSpy).toHaveBeenCalledWith({
      center: [10, 20],
      zoom: 15,
      essential: true,
    })
  })

  it('should render custom templates for search results', () => {
    const { initializeSearch } = useSearchGeocoder(map, locationData, markers)

    initializeSearch()

    const renderFn = MapboxGeocoder.mock.calls[0][0].render

    const poiHtml = renderFn({
      properties: {
        title: 'Test Hospital',
        description: 'Medical facility',
      },
    })

    expect(poiHtml).toContain('<div class="geocoder-result">')
    expect(poiHtml).toContain('<strong>Test Hospital</strong>')
    expect(poiHtml).toContain('<span>Medical facility</span>')

    const mapboxHtml = renderFn({
      text: 'New York',
      place_name: 'New York, NY, USA',
    })

    expect(mapboxHtml).toContain('<div class="geocoder-result global-location">')
    expect(mapboxHtml).toContain('<strong>New York</strong>')
    expect(mapboxHtml).toContain('<span class="location-details">New York, NY, USA</span>')
  })
})
