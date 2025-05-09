/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-enable @typescript-eslint/ban-ts-comment */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import LoggedOutNavBar from '@/components/navigation/LoggedOutNavBar.vue'
import Button from 'primevue/button'

// Mock PrimeVue button
vi.mock('primevue/button', () => ({
  default: {
    name: 'Button',
    props: {
      label: String,
      icon: String,
    },
    template: '<button class="p-button"><slot></slot></button>',
  },
}))

describe('LoggedOutNavBar.vue', () => {
  let wrapper: VueWrapper

  // Create test router with routes
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'home' },
      { path: '/login', name: 'login' },
      { path: '/map', name: 'map' },
      { path: '/news', name: 'news' },
      { path: '/general-info', name: 'general-info' },
    ],
  })

  beforeEach(() => {
    // Reset router push mock before each test
    vi.spyOn(router, 'push').mockImplementation(vi.fn())

    // Mount component
    wrapper = mount(LoggedOutNavBar, {
      global: {
        plugins: [router],
        stubs: {
          Button: true,
        },
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
    vi.restoreAllMocks()
  })

  it('renders the component correctly', () => {
    // Check for logo
    expect(wrapper.find('img[alt="Logo"]').exists()).toBe(true)

    // Check for hamburger menu
    expect(wrapper.find('.hamburger-menu').exists()).toBe(true)

    // Check for login button
    expect(wrapper.find('.login-button').exists()).toBe(true)

    // Menu should be closed by default
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false)
  })

  it('navigates to login when login button is clicked', async () => {
    // Find and click login button
    await wrapper.find('.login-button').trigger('click')

    // Verify router.push was called with correct path
    expect(router.push).toHaveBeenCalledWith('/login')
  })

  it('navigates to home when logo is clicked', async () => {
    // Find and click logo
    await wrapper.find('img[alt="Logo"]').trigger('click')

    // Verify router.push was called with correct path
    expect(router.push).toHaveBeenCalledWith('/')
  })

  it('toggles the menu when hamburger icon is clicked', async () => {
    // Menu should be closed initially
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false)

    // Click hamburger menu
    await wrapper.find('.hamburger-menu').trigger('click')

    // Menu should now be open
    expect(wrapper.find('.dropdown-menu').exists()).toBe(true)

    // Click hamburger menu again
    await wrapper.find('.hamburger-menu').trigger('click')

    // Menu should now be closed
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false)
  })

  it('navigates to selected route when menu item is clicked', async () => {
    // Open the menu
    await wrapper.find('.hamburger-menu').trigger('click')

    // Find and click the "Map" option
    const mapOption = wrapper.findAll('.dropdown-item')[1] // Map is 2nd item
    await mapOption.trigger('click')

    // Verify navigation occurred
    expect(router.push).toHaveBeenCalledWith('/map')

    // Verify menu is closed after navigation
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false)
  })

  it('closes the menu when clicking outside', async () => {
    // Open the menu
    await wrapper.find('.hamburger-menu').trigger('click')

    // Menu should be open
    expect(wrapper.find('.dropdown-menu').exists()).toBe(true)

    // Simulate click outside by dispatching event
    const clickEvent = new MouseEvent('click')
    document.dispatchEvent(clickEvent)

    // Need to wait for Vue to update the DOM
    await wrapper.vm.$nextTick()

    // Menu should now be closed
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false)
  })

  it('does not close the menu when clicking inside the menu', async () => {
    // Open the menu
    await wrapper.find('.hamburger-menu').trigger('click')

    // Menu should be open
    expect(wrapper.find('.dropdown-menu').exists()).toBe(true)

    // Click inside the menu
    await wrapper.find('.dropdown-menu').trigger('click')

    // Menu should still be open
    expect(wrapper.find('.dropdown-menu').exists()).toBe(true)
  })

  it('sets up and removes event listeners correctly', () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    // Mount a new component to trigger onMounted
    const tempWrapper = mount(LoggedOutNavBar, {
      global: {
        plugins: [router],
        stubs: {
          Button: true,
        },
      },
    })

    // Check that event listener was added
    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function))

    // Unmount to trigger onUnmounted
    tempWrapper.unmount()

    // Check that event listener was removed
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function))
  })
})
