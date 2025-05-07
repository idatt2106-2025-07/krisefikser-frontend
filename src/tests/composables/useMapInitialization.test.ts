import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useMapInitialization } from '@/composables/useMapInitialization'
import { mapboxConfig } from '@/config/mapboxConfig'

// Create proper spies for map methods
const removeLayerSpy = vi.fn();
const removeSourceSpy = vi.fn();
const addSourceSpy = vi.fn();
const addLayerSpy = vi.fn();
const fitBoundsSpy = vi.fn();
const mapRemoveSpy = vi.fn();
const addControlSpy = vi.fn();

// Mock mapboxgl
vi.mock('mapbox-gl', () => {
  return {
    default: {
      Map: vi.fn(() => ({
        addControl: addControlSpy,
        on: vi.fn((event, callback) => {
          // Actually trigger callbacks immediately for testing
          if (event === 'load' || event === 'style.load') {
            callback();
          }
        }),
        remove: mapRemoveSpy,
        getLayer: vi.fn(() => true),
        removeLayer: removeLayerSpy,
        getSource: vi.fn(() => true),
        removeSource: removeSourceSpy,
        addSource: addSourceSpy,
        addLayer: addLayerSpy,
        fitBounds: fitBoundsSpy
      })),
      NavigationControl: vi.fn(),
      GeolocateControl: vi.fn(),
      Marker: vi.fn(() => ({
        setLngLat: vi.fn(function() { return this }),
        setPopup: vi.fn(function() { return this }),
        addTo: vi.fn(function() { return this }),
        remove: vi.fn()
      })),
      Popup: vi.fn(() => ({
        setLngLat: vi.fn(function() { return this }),
        setHTML: vi.fn(function() { return this }),
        addTo: vi.fn(function() { return this }),
        remove: vi.fn()
      })),
      LngLatBounds: vi.fn(() => ({
        extend: vi.fn(function() { return this })
      }))
    }
  }
})

// Mock mapboxConfig
vi.mock('@/config/mapboxConfig', () => ({
  mapboxConfig: {
    accessToken: 'mock-token',
    defaultStyle: 'mock-style',
    defaultCenter: [0, 0],
    defaultZoom: 10
  }
}))

// Mock Vue lifecycle hooks
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    onMounted: vi.fn((cb) => cb()),
    onUnmounted: vi.fn()
  };
});

// Mock global fetch API
global.fetch = vi.fn();

describe('useMapInitialization', () => {
  let containerRef;
  let consoleSpy;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup container ref
    containerRef = ref(document.createElement('div'));

    // Create a direct spy on console.error
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Setup fetch mock for successful response
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({
        routes: [
          {
            geometry: {
              type: 'LineString',
              coordinates: [[0, 0], [1, 1]]
            },
            distance: 1000,
            duration: 600,
            legs: [
              {
                steps: [
                  {
                    maneuver: { instruction: 'Turn right' },
                    distance: 500,
                    duration: 300
                  }
                ]
              }
            ]
          }
        ]
      })
    });
  });

  afterEach(() => {
    // Clean up global window property
    if (window.clearMapDirections) {
      delete window.clearMapDirections;
    }

    // Restore console
    consoleSpy.mockRestore();
  });

  // Test 1: Basic interface check
  it('should return the correct interface', () => {
    const result = useMapInitialization(containerRef);

    expect(result).toHaveProperty('map');
    expect(result).toHaveProperty('isMapLoaded');
    expect(result).toHaveProperty('isStyleLoaded');
    expect(result).toHaveProperty('showDirections');
    expect(result).toHaveProperty('clearDirections');
  });

  // Test 4: Error handling for missing API key
  it('should not initialize map when API key is missing', () => {
    // Save original value and override for this test only
    const originalToken = mapboxConfig.accessToken;
    mapboxConfig.accessToken = '';

    useMapInitialization(containerRef);

    expect(consoleSpy).toHaveBeenCalledWith('Mapbox API key is missing. Check your .env file for VITE_MAPBOX_API_KEY');

    // Restore for future tests
    mapboxConfig.accessToken = originalToken;
  });

  // Test 5: showDirections success path
  it('should get directions successfully', async () => {
    const { showDirections, map } = useMapInitialization(containerRef);

    const origin: [number, number] = [10, 20];
    const destination: [number, number] = [30, 40];

    const result = await showDirections(origin, destination);

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${origin[0]},${origin[1]};${destination[0]},${destination[1]}`)
    );

    // Verify result structure
    expect(result).toMatchObject({
      distance: 1000,
      duration: 600,
      steps: [
        {
          instruction: 'Turn right',
          distance: 500,
          duration: 300
        }
      ]
    });

    // Verify map interactions
    expect(addSourceSpy).toHaveBeenCalled();
    expect(addLayerSpy).toHaveBeenCalled();
  });

  // Test 6: showDirections API error handling
  it('should handle API errors in showDirections', async () => {
    const { showDirections } = useMapInitialization(containerRef);

    // Mock API failure
    global.fetch.mockRejectedValueOnce(new Error('API failure'));

    const result = await showDirections([0, 0], [1, 1]);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching directions:', expect.any(Error));
  });

  // Test 7: showDirections no routes error handling
  it('should handle empty routes response', async () => {
    const { showDirections } = useMapInitialization(containerRef);

    // Mock no routes found
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ routes: [] })
    });

    const result = await showDirections([0, 0], [1, 1]);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('No routes found', { routes: [] });
  });

  // Test 8: clearDirections functionality
  it('should clean up resources when clearing directions', async () => {
    const { showDirections, clearDirections, map } = useMapInitialization(containerRef);

    // First show directions to set up state
    await showDirections([0, 0], [1, 1]);

    // Clear mocks to start fresh
    vi.clearAllMocks();

    // Call clearDirections
    clearDirections();

    // Verify cleanup actions
    expect(removeLayerSpy).toHaveBeenCalled();
    expect(removeSourceSpy).toHaveBeenCalled();
  });

  // Test 9: Global clearMapDirections function
  it('should create global clearMapDirections function', async () => {
    const { showDirections } = useMapInitialization(containerRef);

    await showDirections([0, 0], [1, 1]);

    expect(window.clearMapDirections).toBeDefined();
    expect(typeof window.clearMapDirections).toBe('function');
  });
});
