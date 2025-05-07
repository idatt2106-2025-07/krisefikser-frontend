import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useMapLayers } from '@/composables/useAffectedAreas'
import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'

// Mock turf circle function
vi.mock('@turf/turf', () => ({
  circle: vi.fn(() => ({
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
          [0, 0],
        ],
      ],
    },
  })),
}))

// Mock mapboxgl
vi.mock('mapbox-gl', () => {
  const PopupMock = vi.fn(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    setHTML: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  }))

  return {
    default: {
      Popup: PopupMock,
    },
  }
})

describe('useMapLayers', () => {
  // Mock map instance
  const addLayerSpy = vi.fn()
  const addSourceSpy = vi.fn()
  const onSpy = vi.fn()
  const getLayerSpy = vi.fn()
  const removeLayerSpy = vi.fn()
  const getSourceSpy = vi.fn()
  const removeSourceSpy = vi.fn()
  const setLayoutPropertySpy = vi.fn()
  const isStyleLoadedSpy = vi.fn()

  let map
  let locationData
  let filters
  let consoleSpy
  let consoleErrorSpy
  let consoleWarnSpy

  // Create test data
  const testAffectedArea = {
    latitude: 40,
    longitude: -74,
    description: 'Test emergency',
    severityLevel: 'High',
    startDate: '2024-05-07T12:00:00Z',
    highDangerRadiusKm: 2,
    mediumDangerRadiusKm: 5,
    lowDangerRadiusKm: 10,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup mocks
    map = ref({
      addLayer: addLayerSpy,
      addSource: addSourceSpy,
      on: onSpy,
      getLayer: getLayerSpy,
      removeLayer: removeLayerSpy,
      getSource: getSourceSpy,
      removeSource: removeSourceSpy,
      setLayoutProperty: setLayoutPropertySpy,
      isStyleLoaded: isStyleLoadedSpy,
    })

    locationData = ref({
      affectedAreas: [testAffectedArea],
    })

    filters = ref({
      affected_areas: true,
    })

    // Spy on console methods
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Default behavior
    isStyleLoadedSpy.mockReturnValue(true)
    getLayerSpy.mockReturnValue(true)
    getSourceSpy.mockReturnValue(true)
  })

  afterEach(() => {
    consoleSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  it('should create and return the expected functions', () => {
    const result = useMapLayers(map, locationData, filters)

    expect(result).toHaveProperty('circleLayers')
    expect(result).toHaveProperty('initializeLayers')
    expect(result).toHaveProperty('tryInitializeLayers')
    expect(result).toHaveProperty('updateLayerVisibility')
  })

  it('should initialize layers when the map is available', () => {
    const { initializeLayers } = useMapLayers(map, locationData, filters)

    initializeLayers()

    // Should create layers for high, medium, and low danger zones, plus outlines
    expect(addSourceSpy).toHaveBeenCalledTimes(6) // 3 danger zones + 3 outlines
    expect(addLayerSpy).toHaveBeenCalledTimes(6)
    expect(onSpy).toHaveBeenCalledTimes(3) // Click handlers for high, medium, low
  })

  it('should not initialize layers when map is not available', () => {
    const nullMap = ref(null)
    const { initializeLayers } = useMapLayers(nullMap, locationData, filters)

    initializeLayers()

    expect(consoleWarnSpy).toHaveBeenCalledWith('Map not initialized when adding layers')
    expect(addSourceSpy).not.toHaveBeenCalled()
    expect(addLayerSpy).not.toHaveBeenCalled()
  })

  it('should remove existing layers before initializing new ones', () => {
    const { initializeLayers } = useMapLayers(map, locationData, filters)

    // First initialization
    initializeLayers()

    // Clear mocks to track the second call
    vi.clearAllMocks()

    // Second initialization should remove existing layers first
    initializeLayers()

    expect(removeLayerSpy).toHaveBeenCalled()
    expect(removeSourceSpy).toHaveBeenCalled()
  })

  it('should remove existing layers when reinitializing', () => {
    const { initializeLayers } = useMapLayers(map, locationData, filters)

    // First create layers
    initializeLayers()

    // Then clear mocks to track removal
    vi.clearAllMocks()

    // Reinitialize to trigger layer removal
    initializeLayers()

    expect(getLayerSpy).toHaveBeenCalled()
    expect(removeLayerSpy).toHaveBeenCalled()
    expect(getSourceSpy).toHaveBeenCalled()
    expect(removeSourceSpy).toHaveBeenCalled()
  })

  it('should handle errors during layer removal gracefully', () => {
    const { initializeLayers } = useMapLayers(map, locationData, filters)

    // Setup layers
    initializeLayers()

    // Mock an error during removal
    removeLayerSpy.mockImplementationOnce(() => {
      throw new Error('Test error')
    })

    // Reinitializing should handle errors during layer removal
    initializeLayers()

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error removing'),
      expect.any(Error),
    )
  })

  it('should try to initialize layers and succeed when style is loaded', () => {
    const { tryInitializeLayers } = useMapLayers(map, locationData, filters)

    // Style is already loaded (default mock behavior)
    tryInitializeLayers()

    // Should initialize immediately
    expect(addSourceSpy).toHaveBeenCalled()
    expect(addLayerSpy).toHaveBeenCalled()
    expect(consoleSpy).not.toHaveBeenCalled() // No retry messages
  })

  it('should retry layer initialization when style is not loaded', () => {
    // Mock setTimeout
    vi.useFakeTimers()

    // First call returns false, then true
    isStyleLoadedSpy.mockReturnValueOnce(false).mockReturnValueOnce(true)

    const { tryInitializeLayers } = useMapLayers(map, locationData, filters)

    tryInitializeLayers()

    // Should log retry message
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Map style not loaded yet'))

    // No layers added yet
    expect(addLayerSpy).not.toHaveBeenCalled()

    // Advance timer
    vi.runAllTimers()

    // Now layers should be added
    expect(addSourceSpy).toHaveBeenCalled()
    expect(addLayerSpy).toHaveBeenCalled()

    vi.useRealTimers()
  })

  it('should give up after max attempts', () => {
    // Mock setTimeout
    vi.useFakeTimers()

    // Always return false for isStyleLoaded
    isStyleLoadedSpy.mockReturnValue(false)

    const { tryInitializeLayers } = useMapLayers(map, locationData, filters)

    // Use a smaller max attempts for testing
    tryInitializeLayers(2)

    // First attempt
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('attempt 1/2'))

    // Advance timer for second attempt
    vi.runOnlyPendingTimers()

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('attempt 2/2'))

    // Advance timer one more time, should give up
    vi.runOnlyPendingTimers()

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to initialize layers after max attempts')

    vi.useRealTimers()
  })

  it('should update layer visibility correctly', () => {
    const { initializeLayers, updateLayerVisibility } = useMapLayers(map, locationData, filters)

    // First create layers
    initializeLayers()

    // Clear mocks to track visibility updates
    vi.clearAllMocks()

    // Hide layers
    updateLayerVisibility(false)

    expect(setLayoutPropertySpy).toHaveBeenCalledWith(expect.any(String), 'visibility', 'none')

    // Clear mocks again
    vi.clearAllMocks()

    // Show layers
    updateLayerVisibility(true)

    expect(setLayoutPropertySpy).toHaveBeenCalledWith(expect.any(String), 'visibility', 'visible')
  })

  it('should handle missing danger radii gracefully', () => {
    // Create area with only high danger radius
    locationData.value.affectedAreas = [
      {
        ...testAffectedArea,
        mediumDangerRadiusKm: undefined,
        lowDangerRadiusKm: undefined,
      },
    ]

    const { initializeLayers } = useMapLayers(map, locationData, filters)

    initializeLayers()

    // Should only create one zone layer plus outline
    expect(addLayerSpy).toHaveBeenCalledTimes(2)
  })

  it('should return the correct radius for each danger level', () => {
    // This tests the getDangerRadius function indirectly
    const { initializeLayers } = useMapLayers(map, locationData, filters)

    initializeLayers()

    // Verify turf.circle was called with correct radii
    expect(turf.circle).toHaveBeenNthCalledWith(
      1,
      [testAffectedArea.longitude, testAffectedArea.latitude],
      testAffectedArea.highDangerRadiusKm,
      expect.any(Object),
    )

    expect(turf.circle).toHaveBeenNthCalledWith(
      2,
      [testAffectedArea.longitude, testAffectedArea.latitude],
      testAffectedArea.mediumDangerRadiusKm,
      expect.any(Object),
    )
  })
})
