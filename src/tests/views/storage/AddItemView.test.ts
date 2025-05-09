/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-enable @typescript-eslint/ban-ts-comment */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AddItemView from '@/views/storage/AddItemView.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useItemStore } from '@/stores/itemStore'
import { useRouter } from 'vue-router'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

// Mock store
vi.mock('@/stores/itemStore', () => ({
  useItemStore: vi.fn(() => ({
    addItem: vi.fn(),
  })),
}))

describe('AddItemView', () => {
  let wrapper: ReturnType<typeof mount>
  const mockRouter = { push: vi.fn() }
  let mockItemStore: { addItem: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    // Reset mocks and create fresh pinia instance
    vi.clearAllMocks()
    setActivePinia(createPinia())

    // Setup mocked router and store
    vi.mocked(useRouter).mockReturnValue(mockRouter)
    mockItemStore = { addItem: vi.fn() }
    vi.mocked(useItemStore).mockReturnValue(mockItemStore)

    // Mount component
    wrapper = mount(AddItemView)
  })

  it('renders the form correctly', () => {
    expect(wrapper.find('h1.title').text()).toBe('Add New Item To Product List')
    expect(wrapper.find('label[for="name"]').exists()).toBe(true)
    expect(wrapper.find('label[for="unit"]').exists()).toBe(true)
    expect(wrapper.find('label[for="calories"]').exists()).toBe(true)
    expect(wrapper.find('label[for="type"]').exists()).toBe(true)
    expect(wrapper.find('button.add-button').text()).toBe('Add Item')
    expect(wrapper.find('button.cancel-button').text()).toBe('Cancel')
  })

  it('validates empty name field', async () => {
    // Fill other required fields
    await wrapper.find('#unit').setValue('piece')
    await wrapper.find('#calories').setValue('100')
    await wrapper.find('#type').setValue('FOOD')

    // Submit with empty name
    await wrapper.find('.add-button').trigger('click')

    // Check for error message
    expect(wrapper.find('.error-message').text()).toBe('Please enter a name for the item')
    // Verify store action was not called
    expect(mockItemStore.addItem).not.toHaveBeenCalled()
  })

  it('validates empty unit field', async () => {
    // Fill other required fields
    await wrapper.find('#name').setValue('Test Item')
    await wrapper.find('#calories').setValue('100')
    await wrapper.find('#type').setValue('FOOD')

    // Submit with empty unit
    await wrapper.find('.add-button').trigger('click')

    // Check for error message
    expect(wrapper.find('.error-message').text()).toBe('Please enter a unit for the item')
    expect(mockItemStore.addItem).not.toHaveBeenCalled()
  })

  it('validates invalid calories value', async () => {
    // Fill other required fields
    await wrapper.find('#name').setValue('Test Item')
    await wrapper.find('#unit').setValue('piece')
    await wrapper.find('#type').setValue('FOOD')

    // Test with negative calories (should be handled by handleCaloriesChange)
    const caloriesInput = wrapper.find('#calories')
    await caloriesInput.setValue('-100')
    await wrapper.find('.add-button').trigger('click')

    // Check for error message
    expect(wrapper.find('.error-message').text()).toContain('valid number of calories')
    expect(mockItemStore.addItem).not.toHaveBeenCalled()
  })

  it('validates empty type field', async () => {
    // Fill other required fields
    await wrapper.find('#name').setValue('Test Item')
    await wrapper.find('#unit').setValue('piece')
    await wrapper.find('#calories').setValue('100')

    // Submit with no type selected
    await wrapper.find('.add-button').trigger('click')

    // Check for error message
    expect(wrapper.find('.error-message').text()).toBe('Please select a type for the item')
    expect(mockItemStore.addItem).not.toHaveBeenCalled()
  })

  it('submits the form with valid data', async () => {
    // Mock successful store action
    mockItemStore.addItem.mockResolvedValue({})

    // Fill all required fields
    await wrapper.find('#name').setValue('Test Item')
    await wrapper.find('#unit').setValue('piece')
    await wrapper.find('#calories').setValue('100')
    await wrapper.find('#type').setValue('FOOD')

    // Submit form
    await wrapper.find('.add-button').trigger('click')

    // Verify store action was called with correct data
    expect(mockItemStore.addItem).toHaveBeenCalledWith({
      name: 'Test Item',
      unit: 'piece',
      calories: 100,
      type: 'FOOD',
    })
  })

  it('shows success message after successful submission', async () => {
    // Mock successful store action
    mockItemStore.addItem.mockResolvedValue({})

    // Fill all required fields
    await wrapper.find('#name').setValue('Test Item')
    await wrapper.find('#unit').setValue('piece')
    await wrapper.find('#calories').setValue('100')
    await wrapper.find('#type').setValue('FOOD')

    // Submit form
    await wrapper.find('.add-button').trigger('click')
    await flushPromises()

    // Check for success message
    expect(wrapper.find('.success-message').exists()).toBe(true)
    expect(wrapper.find('.success-message').text()).toBe('Item added successfully! Redirecting...')

    // Verify form fields were cleared
    expect((wrapper.find('#name').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#unit').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#calories').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#type').element as HTMLSelectElement).value).toBe('')
  })

  it('shows error message when item addition fails', async () => {
    // Mock failed store action
    mockItemStore.addItem.mockRejectedValue(new Error('API Error'))

    // Fill all required fields
    await wrapper.find('#name').setValue('Test Item')
    await wrapper.find('#unit').setValue('piece')
    await wrapper.find('#calories').setValue('100')
    await wrapper.find('#type').setValue('FOOD')

    // Submit form
    await wrapper.find('.add-button').trigger('click')
    await flushPromises()

    // Check for error message
    expect(wrapper.find('.error-message').text()).toBe('Failed to add item. Please try again.')

    // Verify isSubmitting was reset
    expect(wrapper.find('.add-button').text()).toBe('Add Item')
  })

  it('redirects to add-storage-item page after successful submission', async () => {
    vi.useFakeTimers()
    mockItemStore.addItem.mockResolvedValue({})

    // Fill all required fields and submit
    await wrapper.find('#name').setValue('Test Item')
    await wrapper.find('#unit').setValue('piece')
    await wrapper.find('#calories').setValue('100')
    await wrapper.find('#type').setValue('FOOD')
    await wrapper.find('.add-button').trigger('click')
    await flushPromises()

    // Fast-forward timer
    vi.advanceTimersByTime(1500)

    // Check if router.push was called with correct path
    expect(mockRouter.push).toHaveBeenCalledWith('/storage/add-storage-item')

    vi.useRealTimers()
  })

  it('calls navigate function when cancel button is clicked', async () => {
    await wrapper.find('.cancel-button').trigger('click')
    expect(mockRouter.push).toHaveBeenCalledWith('/storage/add-storage-item')
  })

  it('disables form inputs while submitting', async () => {
    // Setup delayed resolution for addItem to keep isSubmitting true during check
    let resolvePromise: (value: unknown) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    mockItemStore.addItem.mockReturnValue(promise)

    // Fill all required fields and submit
    await wrapper.find('#name').setValue('Test Item')
    await wrapper.find('#unit').setValue('piece')
    await wrapper.find('#calories').setValue('100')
    await wrapper.find('#type').setValue('FOOD')
    await wrapper.find('.add-button').trigger('click')

    // Check if inputs are disabled
    expect((wrapper.find('#name').element as HTMLInputElement).disabled).toBe(true)
    expect((wrapper.find('#unit').element as HTMLInputElement).disabled).toBe(true)
    expect((wrapper.find('#calories').element as HTMLInputElement).disabled).toBe(true)
    expect((wrapper.find('#type').element as HTMLSelectElement).disabled).toBe(true)
    expect((wrapper.find('.add-button').element as HTMLButtonElement).disabled).toBe(true)
    expect((wrapper.find('.cancel-button').element as HTMLButtonElement).disabled).toBe(true)
    expect(wrapper.find('.add-button').text()).toBe('Adding...')

    // Resolve the promise to clean up
    resolvePromise({})
    await flushPromises()
  })

  it('properly handles calorie input changes', async () => {
    const caloriesInput = wrapper.find('#calories')

    // Valid positive number
    await caloriesInput.setValue('150')
    expect((caloriesInput.element as HTMLInputElement).value).toBe('150')

    // Valid zero
    await caloriesInput.setValue('0')
    expect((caloriesInput.element as HTMLInputElement).value).toBe('0')

    // Empty string is allowed
    await caloriesInput.setValue('')
    expect((caloriesInput.element as HTMLInputElement).value).toBe('')
  })
})
