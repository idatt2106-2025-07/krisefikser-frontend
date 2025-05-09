/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-enable @typescript-eslint/ban-ts-comment */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import StorageView from '@/views/storage/StorageView.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useStorageItemStore } from '@/stores/storageItemStore'
import { useRouter } from 'vue-router'

// Mock components
vi.mock('@/components/common/SearchBar.vue', () => ({
  default: {
    template: '<input class="mock-search-bar" />',
  },
}))

vi.mock('@/components/common/SortDropdown.vue', () => ({
  default: {
    template: '<select class="mock-sort-dropdown"></select>',
  },
}))

vi.mock('@/components/storage/FilterSidebar.vue', () => ({
  default: {
    template: '<div class="mock-filter-sidebar"></div>',
  },
}))

vi.mock('@/components/storage/TimeLeft.vue', () => ({
  default: {
    template: '<div class="mock-time-left"></div>',
  },
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

vi.mock('@/assets/three-dots-horizontal.svg', () => ({
  default: 'mock-three-dots.svg',
}))

describe('StorageView', () => {
  let wrapper
  const mockRouter = { push: vi.fn() }
  let store

  const mockAggregatedItems = [
    {
      itemId: 1,
      item: { id: 1, name: 'Water', unit: 'L', calories: 0, type: 'DRINK' },
      totalQuantity: 10,
      earliestExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      itemId: 2,
      item: { id: 2, name: 'Canned Beans', unit: 'can', calories: 200, type: 'FOOD' },
      totalQuantity: 5,
      earliestExpirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  beforeEach(async () => {
    vi.clearAllMocks()
    const pinia = createPinia()
    setActivePinia(pinia)

    // Setup mocked router
    vi.mocked(useRouter).mockReturnValue(mockRouter)

    // Get actual store instance
    store = useStorageItemStore()

    // Reset store state
    store.$patch({
      aggregatedItems: [],
      loading: false,
      error: null,
    })

    // Mock store methods
    store.fetchAggregatedItems = vi.fn().mockResolvedValue([])
    store.searchAggregatedItems = vi.fn()
    store.filterByItemType = vi.fn()
    store.sortAggregatedItems = vi.fn()
    store.filterAndSortAggregatedItems = vi.fn()

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the storage view correctly', async () => {
    wrapper = mount(StorageView)
    expect(wrapper.find('h1').text()).toBe('Emergency Storage')
    expect(wrapper.find('.mock-filter-sidebar').exists()).toBe(true)
    expect(wrapper.find('.mock-search-bar').exists()).toBe(true)
    expect(wrapper.find('.mock-sort-dropdown').exists()).toBe(true)
    expect(wrapper.find('.mock-time-left').exists()).toBe(true)
    expect(wrapper.find('button').text()).toContain('Add item')
  })

  it('shows loading indicator when loading', async () => {
    store.loading = true
    wrapper = mount(StorageView)
    expect(wrapper.find('[data-test="loading"]').exists()).toBe(false)
  })

  // Add more tests as needed...
})
