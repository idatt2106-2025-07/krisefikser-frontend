// Solve the hoisting issue with vi.hoisted
import { vi } from 'vitest';

// Create all mock objects before any imports using vi.hoisted
const mockFunctions = vi.hoisted(() => ({
  flyTo: vi.fn(),
  showDirections: vi.fn().mockResolvedValue({ distance: 5000, duration: 1200, steps: [] }),
  clearDirections: vi.fn(),
  initializeMarkers: vi.fn(),
  updateMarkers: vi.fn(),
  tryInitializeLayers: vi.fn(),
  updateLayerVisibility: vi.fn(),
  initializeSearch: vi.fn(),
  getPointsOfInterest: vi.fn().mockResolvedValue([
    { id: 1, type: 'HOSPITAL', latitude: 10, longitude: 20, description: 'Test Hospital' }
  ]),
  getAllPointsOfInterest: vi.fn().mockResolvedValue([
    { id: 1, type: 'HOSPITAL', latitude: 10, longitude: 20, description: 'Test Hospital' },
    { id: 2, type: 'SHELTER', latitude: 11, longitude: 21, description: 'Test Shelter' }
  ]),
  getAffectedAreas: vi.fn().mockResolvedValue([
    { id: 1, latitude: 30, longitude: 40, description: 'Flood', severityLevel: 'High', startDate: '2023-01-01' }
  ])
}));

// Mock all the imports using the hoisted functions
vi.mock('@/composables/useMapInitialization', () => ({
  useMapInitialization: () => ({
    map: { value: { flyTo: mockFunctions.flyTo } },
    isMapLoaded: { value: true },
    isStyleLoaded: { value: true },
    showDirections: mockFunctions.showDirections,
    clearDirections: mockFunctions.clearDirections
  })
}));

vi.mock('@/composables/usePointsOfInterest', () => ({
  useMarkerManagement: () => ({
    markers: { value: [] },
    initializeMarkers: mockFunctions.initializeMarkers,
    updateMarkers: mockFunctions.updateMarkers
  })
}));

vi.mock('@/composables/useAffectedAreas', () => ({
  useMapLayers: () => ({
    tryInitializeLayers: mockFunctions.tryInitializeLayers,
    updateLayerVisibility: mockFunctions.updateLayerVisibility
  })
}));

vi.mock('@/composables/useSearchGeocoder', () => ({
  useSearchGeocoder: () => ({
    initializeSearch: mockFunctions.initializeSearch
  })
}));

vi.mock('@/services/mapService', () => ({
  default: {
    getPointsOfInterest: mockFunctions.getPointsOfInterest,
    getAllPointsOfInterest: mockFunctions.getAllPointsOfInterest,
    getAffectedAreas: mockFunctions.getAffectedAreas
  }
}));

// Mock mapbox-gl and CSS imports
vi.mock('mapbox-gl/dist/mapbox-gl.css', () => ({}));
vi.mock('@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css', () => ({}));

// Now import remaining dependencies
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TheMap from '@/components/map/TheMap.vue';

describe('TheMap', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock console methods to reduce test noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((success) => success({
          coords: { latitude: 50, longitude: 60 }
        }))
      },
      configurable: true
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('renders the map container correctly', () => {
    wrapper = mount(TheMap, {
      shallow: true // Use shallow mounting to avoid rendering child components
    });
    expect(wrapper.find('.map-container').exists()).toBe(true);
  });

  it('shows expand button only on homepage', () => {
    // Test with isHomePage = true
    wrapper = mount(TheMap, {
      props: {
        isHomePage: true
      },
      shallow: true
    });
    expect(wrapper.find('.btn-expand-map').exists()).toBe(true);

    // Test with isHomePage = false
    wrapper = mount(TheMap, {
      props: {
        isHomePage: false
      },
      shallow: true
    });
    expect(wrapper.find('.btn-expand-map').exists()).toBe(false);
  });

  it('does not initialize search on homepage', async () => {
    wrapper = mount(TheMap, {
      props: {
        isHomePage: true
      },
      shallow: true
    });

    // Fast forward past setTimeout
    vi.advanceTimersByTime(100);
    await wrapper.vm.$nextTick();

    expect(mockFunctions.initializeSearch).not.toHaveBeenCalled();
  });

  it('updates layer visibility when affected_areas filter changes', async () => {
    wrapper = mount(TheMap, {
      props: {
        filters: { affected_areas: false }
      },
      shallow: true
    });

    // Clear mock calls
    mockFunctions.updateLayerVisibility.mockClear();

    // Change the affected_areas filter
    await wrapper.setProps({
      filters: { affected_areas: true }
    });

    expect(mockFunctions.updateLayerVisibility).toHaveBeenCalledWith(true);
  });

  it('navigates to POI and shows directions', async () => {
    wrapper = mount(TheMap, {
      shallow: true
    });

    // Directly call the method
    await wrapper.vm.navigateToPOI({
      longitude: 20,
      latitude: 30,
      description: 'Test POI'
    });

    // Should call showDirections with user location and POI coords
    expect(mockFunctions.showDirections).toHaveBeenCalledWith(
      [60, 50], // Mock user location (lng, lat)
      [20, 30]  // POI location (lng, lat)
    );
  });

  it('falls back to flyTo when geolocation fails', async () => {
    // Override geolocation to make it fail
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((success, error) =>
          error(new Error('Geolocation error'))
        )
      },
      configurable: true
    });

    wrapper = mount(TheMap, {
      shallow: true
    });

    await wrapper.vm.navigateToPOI({
      longitude: 20,
      latitude: 30
    });

    expect(mockFunctions.flyTo).toHaveBeenCalledWith({
      center: [20, 30],
      zoom: 15
    });
  });
});
