import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import NotificationBar from '@/components/admin/NotificationBar.vue'
import notificationService from '@/services/notificationService'

// Mock the notification service
vi.mock('@/services/notificationService', () => ({
  default: {
    getIncidents: vi.fn(),
    getExpiringStorageItems: vi.fn()
  }
}))

describe('NotificationBar.vue', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  it('renders properly with no notifications', async () => {
    // Mock empty responses
    vi.mocked(notificationService.getIncidents).mockResolvedValue([])
    vi.mocked(notificationService.getExpiringStorageItems).mockResolvedValue([])

    const wrapper = mount(NotificationBar)
    await flushPromises() // Wait for promises to resolve

    // Check that no notifications are rendered
    expect(wrapper.findAll('.notification-item').length).toBe(0)
  })

  it('renders incidents correctly', async () => {
    // Mock incident response
    vi.mocked(notificationService.getIncidents).mockResolvedValue([
      { message: 'Test incident 1' },
      { message: 'Test incident 2' }
    ])
    vi.mocked(notificationService.getExpiringStorageItems).mockResolvedValue([])

    const wrapper = mount(NotificationBar)
    await flushPromises() // Wait for promises to resolve

    // Check that 2 notifications are rendered
    const notifications = wrapper.findAll('.notification-item')
    expect(notifications.length).toBe(2)

    // Check notification content
    expect(notifications[0].text()).toContain('Test incident 1')
    expect(notifications[1].text()).toContain('Test incident 2')

    // Check that they have the correct type (danger)
    expect(notifications[0].classes()).toContain('notification-danger')
  })

  it('renders expiring food items correctly', async () => {
    // Mock empty incidents
    vi.mocked(notificationService.getIncidents).mockResolvedValue([])

    // Mock expiring items with food
    const today = new Date()
    const inFiveDays = new Date(today)
    inFiveDays.setDate(today.getDate() + 5)

    vi.mocked(notificationService.getExpiringStorageItems).mockResolvedValue([
      {
        id: 1,
        expirationDate: inFiveDays.toISOString(),
        quantity: 2,
        householdId: 1,
        itemId: 1,
        item: {
          id: 1,
          name: 'Test Food',
          unit: 'kg',
          calories: 200,
          type: 'FOOD'
        }
      }
    ])

    const wrapper = mount(NotificationBar)
    await flushPromises() // Wait for promises to resolve

    // Check that 1 notification is rendered
    const notifications = wrapper.findAll('.notification-item')
    expect(notifications.length).toBe(1)

    // Check notification content
    expect(notifications[0].text()).toContain('Test Food')
    expect(notifications[0].text()).toContain('5 days')

    // Check that it has the correct type (warning)
    expect(notifications[0].classes()).toContain('notification-warning')
  })

  it('handles multiple expiring items by type', async () => {
    // Mock empty incidents
    vi.mocked(notificationService.getIncidents).mockResolvedValue([])

    // Create test dates
    const today = new Date()
    const inThreeDays = new Date(today)
    inThreeDays.setDate(today.getDate() + 3)
    const inFiveDays = new Date(today)
    inFiveDays.setDate(today.getDate() + 5)

    // Mock multiple expiring items of different types
    vi.mocked(notificationService.getExpiringStorageItems).mockResolvedValue([
      {
        id: 1,
        expirationDate: inThreeDays.toISOString(),
        quantity: 1,
        householdId: 1,
        itemId: 1,
        item: {
          id: 1,
          name: 'Test Food 1',
          unit: 'kg',
          calories: 200,
          type: 'FOOD'
        }
      },
      {
        id: 2,
        expirationDate: inFiveDays.toISOString(),
        quantity: 1,
        householdId: 1,
        itemId: 2,
        item: {
          id: 2,
          name: 'Test Food 2',
          unit: 'kg',
          calories: 300,
          type: 'FOOD'
        }
      },
      {
        id: 3,
        expirationDate: inThreeDays.toISOString(),
        quantity: 1,
        householdId: 1,
        itemId: 3,
        item: {
          id: 3,
          name: 'Test Drink',
          unit: 'liter',
          calories: 0,
          type: 'DRINK'
        }
      }
    ])

    const wrapper = mount(NotificationBar)
    await flushPromises() // Wait for promises to resolve

    // Check that 2 notifications are rendered (one for FOOD, one for DRINK)
    const notifications = wrapper.findAll('.notification-item')
    expect(notifications.length).toBe(2)

    // Check FOOD notification content
    expect(notifications[0].text()).toContain('2 food items')
    expect(notifications[0].text()).toContain('3 days') // Earliest is 3 days

    // Check DRINK notification content
    expect(notifications[1].text()).toContain('Test Drink')
    expect(notifications[1].text()).toContain('3 days')
  })

  it('handles API errors gracefully', async () => {
    // Mock API errors
    vi.mocked(notificationService.getIncidents).mockRejectedValue(new Error('API error'))
    vi.mocked(notificationService.getExpiringStorageItems).mockRejectedValue(new Error('API error'))

    const wrapper = mount(NotificationBar)
    await flushPromises() // Wait for promises to resolve

    // Check that error notification is shown
    const notifications = wrapper.findAll('.notification-item')
    expect(notifications.length).toBe(1)
    expect(notifications[0].text()).toContain('Error loading incident information')
    expect(notifications[0].classes()).toContain('notification-danger')
  })
})
