import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'

describe('HomeView.vue', () => {
  it('renders the header logo', () => {
    const wrapper = mount(HomeView)
    const logo = wrapper.find('img.logo')
    expect(logo.exists()).toBe(true)
    expect(logo.attributes('src')).toContain('/src/assets/logo.svg')
  })

  it('renders the correct number of notifications', () => {
    const wrapper = mount(HomeView)
    // Assumes NotificationBar renders notification messages inside an element with a known class or text content
    // For example, check if notifications are passed as props.
    const notificationBar = wrapper.findComponent({ name: 'NotificationBar' })
    expect(notificationBar.exists()).toBe(true)
    expect(notificationBar.props('notifications')).toHaveLength(3)
  })

  it('renders four InfoCards with proper labels', () => {
    const wrapper = mount(HomeView)
    const expectedHeadings = [
      'Emergency Storage',
      'General Info',
      'Quiz',
      'News'
    ]
    // Find all InfoCard components by searching for the expected heading text
    expectedHeadings.forEach(text => {
      expect(wrapper.html()).toContain(text)
    })
  })

  it('calls navigation methods when InfoCard containers are clicked', async () => {
    const navigateToStorage = vi.fn()
    const navigateToInfo = vi.fn()
    const navigateToQuiz = vi.fn()
    const navigateToNews = vi.fn()

    // Override the component's methods by mounting a shallow component with custom implementations.
    const wrapper = mount(HomeView, {
      global: {
        mocks: {
          navigateToStorage,
          navigateToInfo,
          navigateToQuiz,
          navigateToNews
        }
      }
    })

    const buttonContainers = wrapper.findAll('.button-container')
    // Assume order: Storage, Info, Quiz, News
    await buttonContainers[0].trigger('click')
    await buttonContainers[1].trigger('click')
    await buttonContainers[2].trigger('click')
    await buttonContainers[3].trigger('click')

    expect(navigateToStorage).toHaveBeenCalled()
    expect(navigateToInfo).toHaveBeenCalled()
    expect(navigateToQuiz).toHaveBeenCalled()
    expect(navigateToNews).toHaveBeenCalled()
  })
})
