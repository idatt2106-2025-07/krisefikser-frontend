/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-enable @typescript-eslint/ban-ts-comment */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useMapLayers } from '@/composables/useAffectedAreas'
import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'

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

    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

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

    expect(addSourceSpy).toHaveBeenCalledTimes(6)
    expect(addLayerSpy).toHaveBeenCalledTimes(6)
    expect(onSpy).toHaveBeenCalledTimes(3)
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

    initializeLayers()

    vi.clearAllMocks()

    initializeLayers()

    expect(removeLayerSpy).toHaveBeenCalled()
    expect(removeSourceSpy).toHaveBeenCalled()
  })

  it('should remove existing layers when reinitializing', () => {
    const { initializeLayers } = useMapLayers(map, locationData, filters)

    initializeLayers()

    vi.clearAllMocks()

    initializeLayers()

    expect(getLayerSpy).toHaveBeenCalled()
    expect(removeLayerSpy).toHaveBeenCalled()
    expect(getSourceSpy).toHaveBeenCalled()
    expect(removeSourceSpy).toHaveBeenCalled()
  })

  it('should handle errors during layer removal gracefully', () => {
    const { initializeLayers } = useMapLayers(map, locationData, filters)

    initializeLayers()

    removeLayerSpy.mockImplementationOnce(() => {
      throw new Error('Test error')
    })

    initializeLayers()

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error removing'),
      expect.any(Error),
    )
  })

  it('should try to initialize layers and succeed when style is loaded', () => {
    const { tryInitializeLayers } = useMapLayers(map, locationData, filters)

    tryInitializeLayers()

    expect(addSourceSpy).toHaveBeenCalled()
    expect(addLayerSpy).toHaveBeenCalled()
    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('should retry layer initialization when style is not loaded', () => {
    vi.useFakeTimers()

    isStyleLoadedSpy.mockReturnValueOnce(false).mockReturnValueOnce(true)

    const { tryInitializeLayers } = useMapLayers(map, locationData, filters)

    tryInitializeLayers()

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Map style not loaded yet'))

    expect(addLayerSpy).not.toHaveBeenCalled()

    vi.runAllTimers()

    expect(addSourceSpy).toHaveBeenCalled()
    expect(addLayerSpy).toHaveBeenCalled()

    vi.useRealTimers()
  })

  it('should give up after max attempts', () => {
    vi.useFakeTimers()

    isStyleLoadedSpy.mockReturnValue(false)

    const { tryInitializeLayers } = useMapLayers(map, locationData, filters)

    tryInitializeLayers(2)

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('attempt 1/2'))

    vi.runOnlyPendingTimers()

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('attempt 2/2'))

    vi.runOnlyPendingTimers()

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to initialize layers after max attempts')

    vi.useRealTimers()
  })

  it('should update layer visibility correctly', () => {
    const { initializeLayers, updateLayerVisibility } = useMapLayers(map, locationData, filters)

    initializeLayers()

    vi.clearAllMocks()

    updateLayerVisibility(false)

    expect(setLayoutPropertySpy).toHaveBeenCalledWith(expect.any(String), 'visibility', 'none')

    vi.clearAllMocks()

    updateLayerVisibility(true)

    expect(setLayoutPropertySpy).toHaveBeenCalledWith(expect.any(String), 'visibility', 'visible')
  })

  it('should handle missing danger radii gracefully', () => {
    locationData.value.affectedAreas = [
      {
        ...testAffectedArea,
        mediumDangerRadiusKm: undefined,
        lowDangerRadiusKm: undefined,
      },
    ]

    const { initializeLayers } = useMapLayers(map, locationData, filters)

    initializeLayers()

    expect(addLayerSpy).toHaveBeenCalledTimes(2)
  })

  it('should return the correct radius for each danger level', () => {
    const { initializeLayers } = useMapLayers(map, locationData, filters)

    initializeLayers()

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
