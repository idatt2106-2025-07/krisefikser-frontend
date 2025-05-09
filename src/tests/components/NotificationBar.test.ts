// Update your NotificationBar.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import NotificationBar from '@/components/admin/NotificationBar.vue'
import notificationService from '@/services/notificationService'
import { createRouter, createWebHistory } from 'vue-router'

// Create mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/map', name: 'map', component: { template: '<div>Map</div>' } },
    { path: '/storage', name: 'storage', component: { template: '<div>Storage</div>' } },
  ],
})

// Mock the notification service
vi.mock('@/services/notificationService', () => ({
  default: {
    getIncidents: vi.fn(),
    getExpiringStorageItems: vi.fn(),
  },
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

    const wrapper = mount(NotificationBar, {
      global: {
        plugins: [router], // Add router to global plugins
      },
    })
    await flushPromises() // Wait for promises to resolve

    // Check that no notifications are rendered
    expect(wrapper.findAll('.notification-item').length).toBe(0)
  })

  // Update all your test cases to include the router in the mount options
  it('renders incidents correctly', async () => {
    // ...existing test code
    const wrapper = mount(NotificationBar, {
      global: {
        plugins: [router],
      },
    })
    // ...rest of the test
  })

  // Do the same for all other test cases
})
