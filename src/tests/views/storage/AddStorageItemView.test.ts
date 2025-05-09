/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-enable @typescript-eslint/ban-ts-comment */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AddStorageItemView from '@/views/storage/AddStorageItemView.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useStorageItemStore } from '@/stores/storageItemStore'
import { useRouter } from 'vue-router'
import SearchDropdown from '@/components/storage/SearchDropdown.vue'
import SearchBar from '@/components/common/SearchBar.vue'

// Mock components
vi.mock('@/components/storage/SearchDropdown.vue', () => ({
  default: {
    name: 'SearchDropdown',
    props: ['placeholder'],
    template: '<div class="mock-search-dropdown"><slot></slot></div>',
    emits: ['select'],
  },
}))

vi.mock('@/components/common/SearchBar.vue', () => ({
  default: {
    name: 'SearchBar',
    props: ['placeholder'],
    template: '<input class="mock-search-bar" :placeholder="placeholder" />',
  },
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

// Mock store
vi.mock('@/stores/storageItemStore', () => ({
  useStorageItemStore: vi.fn(() => ({
    addStorageItem: vi.fn(),
  })),
}))

describe('AddStorageItemView', () => {
  let wrapper
  const mockRouter = { push: vi.fn() }
  let mockStorageItemStore

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())

    vi.mocked(useRouter).mockReturnValue(mockRouter)
    mockStorageItemStore = { addStorageItem: vi.fn() }
    vi.mocked(useStorageItemStore).mockReturnValue(mockStorageItemStore)

    // Mount component
    wrapper = mount(AddStorageItemView, {
      global: {
        stubs: {
          SearchDropdown: true,
          SearchBar: true,
        },
      },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the view correctly', () => {
    expect(wrapper.find('.title').text()).toBe('Add Item To Emergency Storage')
    expect(wrapper.find('label[for="productName"]').exists()).toBe(true)
    expect(wrapper.find('label[for="quantity"]').exists()).toBe(true)
    expect(wrapper.find('label[for="expirationDate"]').exists()).toBe(true)
    expect(wrapper.find('.add-button').exists()).toBe(true)
    expect(wrapper.find('.cancel-button').exists()).toBe(true)
  })

  it('renders the search components', () => {
    // Check for SearchDropdown component
    expect(wrapper.findComponent({ name: 'SearchDropdown' }).exists()).toBe(true)
  })

  it('initializes with default values', () => {
    // Default quantity should be 1
    expect(wrapper.find('#quantity').element.value).toBe('1')
    // No item selected by default
    expect(wrapper.find('.selected-item').exists()).toBe(false)
    // Add button should be disabled when no item is selected
    expect(wrapper.find('.add-button').element.disabled).toBe(true)
  })

  it('validates form when required fields are missing', async () => {
    // Set a selected item manually to test other validations
    await wrapper.vm.handleSelectItem({ id: 1, name: 'Test Item', unit: 'pcs' })

    // Submit without expiration date
    await wrapper.find('.add-button').trigger('click')
    await flushPromises()

    // Should show error message
    expect(wrapper.find('.error-message').text()).toBe('Please enter an expiration date')
    expect(mockStorageItemStore.addStorageItem).not.toHaveBeenCalled()
  })

  it('validates expiration date format', async () => {
    // Set selected item
    await wrapper.vm.handleSelectItem({ id: 1, name: 'Test Item', unit: 'pcs' })

    // Set invalid date format
    await wrapper.find('#expirationDate').setValue('2023-12-31')
    await wrapper.find('.add-button').trigger('click')

    expect(wrapper.find('.error-message').text()).toBe(
      'Please enter a valid date in MM/DD/YYYY format',
    )
    expect(mockStorageItemStore.addStorageItem).not.toHaveBeenCalled()
  })

  it('allows selecting an item', async () => {
    const mockItem = { id: 1, name: 'Test Item', unit: 'pcs' }

    // Manually trigger the select event
    await wrapper.vm.handleSelectItem(mockItem)
    await flushPromises()

    // Should display selected item
    expect(wrapper.find('.selected-item').text()).toContain('Test Item')
    // Add button should be enabled now
    expect(wrapper.find('.add-button').element.disabled).toBe(false)
  })

  it('handles quantity controls correctly', async () => {
    // Test increase button
    await wrapper.find('.quantity-btn:last-child').trigger('click')
    expect(wrapper.find('#quantity').element.value).toBe('2')

    // Test increase again
    await wrapper.find('.quantity-btn:last-child').trigger('click')
    expect(wrapper.find('#quantity').element.value).toBe('3')

    // Test decrease button
    await wrapper.find('.quantity-btn:first-child').trigger('click')
    expect(wrapper.find('#quantity').element.value).toBe('2')

    // Test minimum value
    await wrapper.find('.quantity-btn:first-child').trigger('click')
    await wrapper.find('.quantity-btn:first-child').trigger('click')
    expect(wrapper.find('#quantity').element.value).toBe('1')
  })

  it('formats date correctly for API submission', () => {
    // Test the date formatting function
    const formattedDate = wrapper.vm.formatDateForApi('12/31/2023')
    expect(formattedDate).toBe('2023-12-31')
  })

  it('submits the form with valid data', async () => {
    // Mock successful store action
    mockStorageItemStore.addStorageItem.mockResolvedValue({})

    // Set selected item and valid date
    const mockItem = { id: 5, name: 'Water Bottle', unit: 'L' }
    await wrapper.vm.handleSelectItem(mockItem)
    await wrapper.find('#expirationDate').setValue('12/31/2023')

    // Adjust quantity
    await wrapper.find('.quantity-btn:last-child').trigger('click') // Increase to 2

    // Submit form
    await wrapper.find('.add-button').trigger('click')
    await flushPromises()

    // Verify store action was called with correct data
    expect(mockStorageItemStore.addStorageItem).toHaveBeenCalledWith({
      itemId: 5,
      quantity: 2,
      expirationDate: '2023-12-31',
    })

    // Success message should be shown
    expect(wrapper.find('.success-message').exists()).toBe(true)
  })

  it('shows error message when API call fails', async () => {
    // Mock failed store action
    mockStorageItemStore.addStorageItem.mockRejectedValue(new Error('API Error'))

    // Setup form with valid data
    const mockItem = { id: 1, name: 'Test Item', unit: 'pcs' }
    await wrapper.vm.handleSelectItem(mockItem)
    await wrapper.find('#expirationDate').setValue('12/31/2023')

    // Submit form
    await wrapper.find('.add-button').trigger('click')
    await flushPromises()

    // Error message should be shown
    expect(wrapper.find('.error-message').text()).toBe(
      'Failed to add item to inventory. Please try again.',
    )
  })

  it('redirects to storage after successful submission', async () => {
    vi.useFakeTimers()
    mockStorageItemStore.addStorageItem.mockResolvedValue({})

    // Setup and submit valid form
    const mockItem = { id: 1, name: 'Test Item', unit: 'pcs' }
    await wrapper.vm.handleSelectItem(mockItem)
    await wrapper.find('#expirationDate').setValue('12/31/2023')
    await wrapper.find('.add-button').trigger('click')
    await flushPromises()

    // Fast-forward timer
    vi.advanceTimersByTime(1500)

    // Check if router.push was called with correct path
    expect(mockRouter.push).toHaveBeenCalledWith('/storage')

    vi.useRealTimers()
  })

  it('navigates to add-item view when add new item is clicked', async () => {
    await wrapper.find('.add-item-button').trigger('click')
    expect(mockRouter.push).toHaveBeenCalledWith('/storage/add-item')
  })

  it('navigates to storage when cancel is clicked', async () => {
    await wrapper.find('.cancel-button').trigger('click')
    expect(mockRouter.push).toHaveBeenCalledWith('/storage')
  })

  it('disables form during submission', async () => {
    // Setup delayed promise to keep form in submitting state
    let resolvePromise
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    mockStorageItemStore.addStorageItem.mockReturnValue(promise)

    // Setup form with valid data
    const mockItem = { id: 1, name: 'Test Item', unit: 'pcs' }
    await wrapper.vm.handleSelectItem(mockItem)
    await wrapper.find('#expirationDate').setValue('12/31/2023')

    // Submit form
    await wrapper.find('.add-button').trigger('click')

    // Check if inputs are disabled during submission
    expect(wrapper.find('#quantity').element.disabled).toBe(true)
    expect(wrapper.find('#expirationDate').element.disabled).toBe(true)
    expect(wrapper.find('.add-button').element.disabled).toBe(true)
    expect(wrapper.find('.cancel-button').element.disabled).toBe(true)
    expect(wrapper.find('.add-button').text()).toBe('Adding...')

    // Resolve the promise to clean up
    resolvePromise({})
    await flushPromises()
  })
})
