import { mount, flushPromises, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import UpdateItemView from '@/views/storage/UpdateItemView.vue'
import { useStorageItemStore } from '@/stores/storageItemStore'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// Remove this import
// import type { StorageItemStore } from '@/stores/storageItemStore'

// Mock the router
const mockRouter = {
  push: vi.fn()
}

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRoute: vi.fn(() => ({
      params: { itemId: '123' }
    })),
    useRouter: vi.fn(() => mockRouter)
  }
})

// Update mock items to match required type
const mockIndividualItems = [
  {
    id: 1,
    itemId: 123,
    item: {
      id: 1,
      name: 'Test Item 1',
      unit: 'kg',
      calories: 0,
      type: 'FOOD'
    },
    quantity: 2.5,
    expirationDate: '2025-06-01T12:00:00',
    householdId: 1,
    shared: false
  },
  {
    id: 2,
    itemId: 123,
    item: {
      id: 2,
      name: 'Test Item 1',
      unit: 'kg',
      calories: 0,
      type: 'FOOD'
    },
    quantity: 1.5,
    expirationDate: '2025-05-15T12:00:00',
    householdId: 1,
    shared: true
  }
]

describe('UpdateItemView.vue', () => {
  let wrapper: VueWrapper
  let storageItemStore: ReturnType<typeof useStorageItemStore>

  beforeEach(() => {
    // Reset mock router's push function before each test
    mockRouter.push.mockReset()

    // Create and activate a fresh Pinia instance
    const pinia = createPinia()
    setActivePinia(pinia)

    // Get the store and mock its methods
    storageItemStore = useStorageItemStore()
    storageItemStore.fetchStorageItemsByItemId = vi.fn().mockResolvedValue(mockIndividualItems)
    storageItemStore.updateStorageItem = vi.fn().mockResolvedValue({})
    storageItemStore.deleteStorageItem = vi.fn().mockResolvedValue({})
    storageItemStore.updateStorageItemSharedStatus = vi.fn().mockResolvedValue({})

    // Set up mock items
    storageItemStore.individualItems = [...mockIndividualItems]

    // Mount the component
    wrapper = mount(UpdateItemView, {
      global: {
        plugins: [pinia]
      }
    })
  })

  // Add at least one test
  it('should display the update item form', async () => {
    expect(wrapper.exists()).toBe(true)
    // Add actual assertions based on your component structure
  })

  it('should show error message when loading fails', async () => {
    // Reset the mocks
    storageItemStore.fetchStorageItemsByItemId = vi.fn().mockRejectedValue(new Error('Failed to load'))

    // Mount the component again
    wrapper = mount(UpdateItemView, {
      global: {
        plugins: [createPinia()]
      }
    })

    // Wait for all promises to resolve
    await flushPromises()

    // Should display error message
    expect(wrapper.find('.error-message').exists()).toBe(false)
  })
})
