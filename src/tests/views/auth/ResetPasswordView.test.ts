import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import ResetPassword from '@/views/auth/ResetPasswordView.vue'

// Mock axios
vi.mock('axios')

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/login', component: { template: '<div>Login</div>' } }],
})

// Mock PrimeVue components
// Instead of importing the actual components, create stubs
const mockPassword = {
  name: 'Password',
  props: ['id', 'modelValue', 'feedback', 'toggleMask', 'class'],
  template:
    '<input :id="id" type="password" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @blur="$emit(\'blur\')" />',
  emits: ['update:modelValue', 'blur'],
}

const mockButton = {
  name: 'Button',
  props: ['type', 'label', 'loading', 'disabled'],
  template: '<button :type="type || \'button\'" :disabled="disabled">{{ label }}</button>',
}

// Mock PrimeVue global plugins and config
vi.mock('primevue/config', () => ({
  default: {
    install: () => {},
    config: {},
  },
}))

describe('ResetPassword', () => {
  let wrapper: any

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()

    // Mount the component with stubs
    wrapper = mount(ResetPassword, {
      global: {
        plugins: [router],
        stubs: {
          Password: mockPassword,
          Button: mockButton,
        },
        mocks: {
          $route: {
            query: {
              token: 'test-token',
              email: 'test@example.com',
            },
          },
          $primevue: {
            config: {},
          },
        },
      },
    })
  })

  it('renders the form correctly', async () => {
    await flushPromises()
    expect(wrapper.find('h2').text()).toBe('Set New Password')
    expect(wrapper.find('label[for="new-password"]').text()).toBe('New Password')
    expect(wrapper.find('label[for="confirm-password"]').text()).toBe('Confirm Password')
    expect(wrapper.find('button').text()).toBe('Reset Password')
  })

  it('validates new password pattern', async () => {
    // Set invalid password
    await wrapper.find('#new-password').setValue('weakpassword')
    await wrapper.find('#new-password').trigger('blur')
    await flushPromises()
    expect(wrapper.find('.p-error').text()).toBe(
      'Password must contain an uppercase letter and a number',
    )

    // Set valid password
    await wrapper.find('#new-password').setValue('Strong1')
    await wrapper.find('#new-password').trigger('blur')
    await flushPromises()
    expect(wrapper.findAll('.p-error').length).toBe(0)
  })

  it('validates password confirmation', async () => {
    // Set password
    await wrapper.find('#new-password').setValue('Strong1')

    // Set non-matching confirmation
    await wrapper.find('#confirm-password').setValue('Different1')
    await wrapper.find('#confirm-password').trigger('blur')
    await flushPromises()
    expect(wrapper.find('.p-error').text()).toBe('Passwords do not match')

    // Set matching confirmation
    await wrapper.find('#confirm-password').setValue('Strong1')
    await wrapper.find('#confirm-password').trigger('blur')
    await flushPromises()
    expect(wrapper.findAll('.p-error').length).toBe(0)
  })

  it('computes form validity correctly', async () => {
    // Initially button should be disabled
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()

    // Set valid values
    await wrapper.find('#new-password').setValue('Strong1')
    await wrapper.find('#confirm-password').setValue('Strong1')
    await flushPromises()

    // Should now be enabled
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })

  it('handles form submission errors', async () => {
    // Mock axios error response
    const errorResponse = {
      isAxiosError: true,
      response: {
        data: {
          message: 'Failed to reset password.',
        },
      },
    }
    vi.spyOn(axios, 'post').mockRejectedValue(errorResponse)

    // Set valid form values
    await wrapper.find('#new-password').setValue('Strong1')
    await wrapper.find('#confirm-password').setValue('Strong1')
    await flushPromises()

    // Submit form
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    // Check error handling
    expect(wrapper.find('.message.error').text()).toBe('Failed to reset password.')
  })

  it('does not submit invalid form', async () => {
    const mockPost = vi.spyOn(axios, 'post')

    // Set invalid form (passwords don't match)
    await wrapper.find('#new-password').setValue('Strong1')
    await wrapper.find('#confirm-password').setValue('Different1')
    await flushPromises()

    // Submit form - button should be disabled
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()

    // Should not call axios
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('redirects to login after successful reset', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue({})
    const pushSpy = vi.spyOn(router, 'push')

    // Use fake timers
    vi.useFakeTimers()

    // Set valid form values
    await wrapper.find('#new-password').setValue('Strong1')
    await wrapper.find('#confirm-password').setValue('Strong1')
    await flushPromises()

    // Submit form
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    // Check if redirect was scheduled
    expect(pushSpy).not.toHaveBeenCalled()

    // Advance timers to trigger the timeout
    vi.advanceTimersByTime(2000)
    await flushPromises()

    expect(pushSpy).toHaveBeenCalledWith('/login')

    // Restore real timers
    vi.useRealTimers()
  })
})
