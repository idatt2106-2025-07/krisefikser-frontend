import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import LoginView from '@/views/LoginView.vue'

describe('LoginView.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(LoginView, {
      global: {
        plugins: [PrimeVue],
        components: {
          InputText,
          Password
        }
      }
    })
  })

  it('renders the login form', () => {
    expect(wrapper.find('form.login-form').exists()).toBe(true)
  })

  it('shows an error message for invalid email after blur', async () => {
    const emailInput = wrapper.find('input#email')
    await emailInput.setValue('invalid-email')
    await emailInput.trigger('blur')

    expect(wrapper.find('.p-error').text()).toBe('Email invalid')
  })

  it('does not show an error for a valid email after blur', async () => {
    const emailInput = wrapper.find('input#email')
    await emailInput.setValue('valid@example.com')
    await emailInput.trigger('blur')

    expect(wrapper.find('.p-error').exists()).toBe(false)
  })

  it('disables login button when form is invalid', async () => {
    const emailInput = wrapper.find('input#email')
    const passwordInput = wrapper.find('input[type="password"]')
    const submitButton = wrapper.find('button[type="submit"]')

    await emailInput.setValue('invalid-email')
    await emailInput.trigger('blur')
    await passwordInput.setValue('password')

    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('enables login button when form is valid', async () => {
    const emailInput = wrapper.find('input#email')
    const passwordInput = wrapper.find('input[type="password"]')
    const submitButton = wrapper.find('button[type="submit"]')

    await emailInput.setValue('user@example.com')
    await emailInput.trigger('blur')
    await passwordInput.setValue('password123')

    expect(submitButton.attributes('disabled')).toBeUndefined()
  })

  it('shows alert when form is submitted successfully', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    await wrapper.find('input#email').setValue('user@example.com')
    await wrapper.find('input#email').trigger('blur')
    await wrapper.find('input[type="password"]').setValue('password123')

    await wrapper.find('form').trigger('submit.prevent')

    expect(alertSpy).toHaveBeenCalledWith('Login successful!')
    alertSpy.mockRestore()
  })
})
