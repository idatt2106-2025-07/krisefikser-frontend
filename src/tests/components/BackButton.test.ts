import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BackButton from '@/components/common/BackButton.vue'

describe('BackButton', () => {
  it('renders correctly', () => {
    const wrapper = mount(BackButton)
    expect(wrapper.find('.back-button__btn').exists()).toBe(true)
    expect(wrapper.find('.back-button__text').text()).toBe('Back')
  })

  it('calls router.back when clicked', async () => {
    // Mock router
    const mockRouter = {
      back: vi.fn(),
    }

    const wrapper = mount(BackButton, {
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    })

    // Trigger button click
    await wrapper.find('.back-button__btn').trigger('click')

    // Verify that router.back was called
    expect(mockRouter.back).toHaveBeenCalled()
  })
})
