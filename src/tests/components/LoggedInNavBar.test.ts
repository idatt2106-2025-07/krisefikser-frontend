/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-enable @typescript-eslint/ban-ts-comment */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import LoggedInNavBar from '@/components/navigation/LoggedInNavBar.vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

// Mock dependencies
vi.mock('axios')
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    clearToken: vi.fn(),
    isAdmin: false,
    isSuperAdmin: false
  }))
}))

// Mock PrimeVue button
vi.mock('primevue/button', () => ({
  default: {
    name: 'Button',
    props: {
      severity: String,
      class: String
    },
    template: '<button :class="class"><slot></slot></button>'
  }
}))

describe('LoggedInNavBar.vue', () => {
  let wrapper: VueWrapper
  let mockAuthStore: ReturnType<typeof useAuthStore>

  // Create test router
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'home' },
      { path: '/login', name: 'login' },
      { path: '/profile', name: 'profile' },
      { path: '/map', name: 'map' },
      { path: '/storage', name: 'storage' },
      { path: '/household', name: 'household' },
      { path: '/news', name: 'news' },
      { path: '/general-info', name: 'general-info' },
      { path: '/admin', name: 'admin' },
      { path: '/super-admin', name: 'super-admin' }
    ]
  })

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Mock router push
    vi.spyOn(router, 'push').mockImplementation(vi.fn())

    // Setup auth store with default values
    mockAuthStore = useAuthStore()

    // Mock axios post
    vi.mocked(axios.post).mockResolvedValue({})

    // Mount component
    wrapper = mount(LoggedInNavBar, {
      global: {
        plugins: [router],
        stubs: {
          Button: true
        }
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders the component correctly', () => {
    // Check for logo
    expect(wrapper.find('img[alt="Logo"]').exists()).toBe(true)

    // Check for hamburger menu
    expect(wrapper.find('.hamburger-menu').exists()).toBe(true)

    // Check for profile and logout buttons
    expect(wrapper.find('.profile-button').exists()).toBe(true)
    expect(wrapper.find('[severity="danger"]').exists()).toBe(true)

    // Menu should be closed by default
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false)
  })

  it('navigates to profile when profile button is clicked', async () => {
    await wrapper.find('.profile-button').trigger('click')
    expect(router.push).toHaveBeenCalledWith('/profile')
  })

  it('navigates to home when logo is clicked', async () => {
    await wrapper.find('img[alt="Logo"]').trigger('click')
    expect(router.push).toHaveBeenCalledWith('/')
  })

  it('toggles the menu when hamburger icon is clicked', async () => {
    // Menu should be closed initially
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false)

    // Click hamburger
    await wrapper.find('.hamburger-menu').trigger('click')

    // Menu should be open
    expect(wrapper.find('.dropdown-menu').exists()).toBe(true)

    // Click hamburger again
    await wrapper.find('.hamburger-menu').trigger('click')

    // Menu should be closed
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false)
  })

  it('navigates to selected route and closes menu when menu item is clicked', async () => {
    // Open menu
    await wrapper.find('.hamburger-menu').trigger('click')

    // Click on "Map" menu item
    await wrapper.findAll('.dropdown-item')[3].trigger('click')

    // Check navigation
    expect(router.push).toHaveBeenCalledWith('/map')

    // Check if menu closed
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false)
  })

  it('closes the menu when clicking outside', async () => {
    // Open menu
    await wrapper.find('.hamburger-menu').trigger('click')
    expect(wrapper.find('.dropdown-menu').exists()).toBe(true)

    // Simulate click outside
    const clickEvent = new MouseEvent('click')
    document.dispatchEvent(clickEvent)

    // Need to wait for Vue to update the DOM
    await wrapper.vm.$nextTick()

    // Menu should be closed
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false)
  })

  it('shows admin menu item only for admin users', async () => {
    // Update mock to make user admin
    vi.mocked(useAuthStore).mockReturnValueOnce({
      clearToken: vi.fn(),
      isAdmin: true,
      isSuperAdmin: false
    })

    // Remount with updated store
    wrapper.unmount()
    wrapper = mount(LoggedInNavBar, {
      global: {
        plugins: [router],
        stubs: {
          Button: true
        }
      }
    })

    // Open menu
    await wrapper.find('.hamburger-menu').trigger('click')

    // Check if admin menu item exists
    const menuItems = wrapper.findAll('.dropdown-item')
    const adminItem = menuItems[menuItems.length - 1]
    expect(adminItem.text()).toBe('Admin Dashboard')
  })

  it('shows super-admin menu item only for super-admin users', async () => {
    // Update mock to make user super admin
    vi.mocked(useAuthStore).mockReturnValueOnce({
      clearToken: vi.fn(),
      isAdmin: true,
      isSuperAdmin: true
    })

    // Remount with updated store
    wrapper.unmount()
    wrapper = mount(LoggedInNavBar, {
      global: {
        plugins: [router],
        stubs: {
          Button: true
        }
      }
    })

    // Open menu
    await wrapper.find('.hamburger-menu').trigger('click')

    // Check if super-admin menu item exists
    const menuItems = wrapper.findAll('.dropdown-item')
    expect(menuItems[menuItems.length - 1].text()).toBe('SuperAdmin Dashboard')
  })

  it('sets up and removes event listeners correctly', () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    // Mount to trigger onMounted
    const testWrapper = mount(LoggedInNavBar, {
      global: {
        plugins: [router],
        stubs: {
          Button: true
        }
      }
    })

    // Check that event listener was added
    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function))

    // Unmount to trigger onUnmounted
    testWrapper.unmount()

    // Check that event listener was removed
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function))
  })
})
