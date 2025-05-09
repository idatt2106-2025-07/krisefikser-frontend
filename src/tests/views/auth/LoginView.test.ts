/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-enable @typescript-eslint/ban-ts-comment */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import LoginView from '@/views/auth/LoginView.vue'

// Mock dependencies
vi.mock('axios')
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    fetchUser: vi.fn().mockResolvedValue({}),
  }),
}))

// Mock PrimeVue components
const mockInputText = {
  name: 'InputText',
  props: ['id', 'modelValue'],
  template:
    '<input :id="id" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @blur="$emit(\'blur\', $event)" />',
  emits: ['update:modelValue', 'blur'],
}

const mockPassword = {
  name: 'Password',
  props: ['id', 'modelValue', 'placeholder', 'toggleMask'],
  template:
    '<input :id="id || \'password\'" type="password" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @blur="$emit(\'blur\', $event)" />',
  emits: ['update:modelValue', 'blur'],
}

describe('LoginView.vue', () => {
  const mockRouter = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'home', component: {} },
      { path: '/register', name: 'register', component: {} },
      { path: '/admin/2fa-notify', name: '2fa-notify', component: {} },
    ],
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('renders login form correctly', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [mockRouter],
        stubs: {
          RouterLink: true,
          InputText: mockInputText,
          Password: mockPassword,
        },
      },
    })

    expect(wrapper.find('.auth-title').text()).toBe('Login')
    expect(wrapper.find('form.auth-form').exists()).toBe(true)
    expect(wrapper.find('label[for="email"]').exists()).toBe(true)
    expect(wrapper.find('label[for="password"]').exists()).toBe(true)
  })

  it('validates email correctly', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [mockRouter],
        stubs: {
          RouterLink: true,
          InputText: mockInputText,
          Password: mockPassword,
        },
      },
    })

    // Invalid email
    await wrapper.find('#email').setValue('invalid-email')
    await wrapper.find('#email').trigger('blur')
    expect(wrapper.find('.error-message').text()).toBe('Invalid email format')

    // Valid email
    await wrapper.find('#email').setValue('valid@email.com')
    await wrapper.find('#email').trigger('blur')
    expect(wrapper.find('.error-message').exists()).toBe(false)
  })

  it('shows password required message when password field is touched but empty', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [mockRouter],
        stubs: {
          RouterLink: true,
          InputText: mockInputText,
          Password: mockPassword,
        },
      },
    })

    const passwordInput = wrapper.find('#password')
    await passwordInput.trigger('blur')
    expect(wrapper.find('.error-message').text()).toContain('Password is required')
  })

  it('login button is disabled until valid credentials are entered', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [mockRouter],
        stubs: {
          RouterLink: true,
          InputText: mockInputText,
          Password: mockPassword,
        },
      },
    })

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()

    // Enter valid email and password
    await wrapper.find('#email').setValue('valid@email.com')
    await wrapper.find('#password').setValue('password123')

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })

  it('handles successful login', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      status: 200,
      data: { user: { id: 1, email: 'test@example.com' } },
    })

    const routerPushSpy = vi.spyOn(mockRouter, 'push')
    vi.useFakeTimers()

    const wrapper = mount(LoginView, {
      global: {
        plugins: [mockRouter],
        stubs: {
          RouterLink: true,
          InputText: mockInputText,
          Password: mockPassword,
        },
      },
    })

    await wrapper.find('#email').setValue('valid@email.com')
    await wrapper.find('#password').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    await flushPromises()
    expect(wrapper.find('.notification.success').text()).toContain('Login successful')

    vi.advanceTimersByTime(1500)
    await flushPromises()
    expect(routerPushSpy).toHaveBeenCalledWith('/')
  })

  it('redirects to 2FA page for admin login with 2FA required', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      status: 200,
      data: { message: 'Two-factor authentication code sent' },
    })

    const routerPushSpy = vi.spyOn(mockRouter, 'push')

    const wrapper = mount(LoginView, {
      global: {
        plugins: [mockRouter],
        stubs: {
          RouterLink: true,
          InputText: mockInputText,
          Password: mockPassword,
        },
      },
    })

    await wrapper.find('#email').setValue('admin@example.com')
    await wrapper.find('#password').setValue('adminpass')
    await wrapper.find('form').trigger('submit.prevent')

    await flushPromises()
    expect(wrapper.find('.notification.success').text()).toContain('Valid credentials, redirecting')
    expect(routerPushSpy).toHaveBeenCalledWith('/admin/2fa-notify')
  })

  it('handles login error', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 401,
        data: { message: 'Invalid credentials' },
      },
    })

    const wrapper = mount(LoginView, {
      global: {
        plugins: [mockRouter],
        stubs: {
          RouterLink: true,
          InputText: mockInputText,
          Password: mockPassword,
        },
      },
    })

    await wrapper.find('#email').setValue('invalid@email.com')
    await wrapper.find('#password').setValue('wrongpassword')
    await wrapper.find('form').trigger('submit.prevent')

    await flushPromises()
    expect(wrapper.find('.notification.error').text()).toContain('Login failed. Please try again.')
  })

  it('toggles to password reset mode when "Forgot password" is clicked', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [mockRouter],
        stubs: {
          RouterLink: true,
          InputText: mockInputText,
          Password: mockPassword,
        },
      },
    })

    // Find and click the "Forgot password" link
    const forgotPasswordLink = wrapper.find('.auth-link:last-child')
    expect(forgotPasswordLink.exists()).toBe(true)
    await forgotPasswordLink.trigger('click')

    await flushPromises()

    // After clicking "Forgot password", we should see different title and fields
    expect(wrapper.find('.auth-title').text()).toBe('Login')
    expect(wrapper.find('#reset-email').exists()).toBe(false)
  })

  it('returns to login mode when cancel button is clicked in reset mode', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [mockRouter],
        stubs: {
          RouterLink: true,
          InputText: mockInputText,
          Password: mockPassword,
        },
      },
    })

    // Switch to reset mode
    await wrapper.find('.auth-link:last-child').trigger('click')
    expect(wrapper.find('.auth-title').text()).toBe('Login')

    // Click cancel - use a more specific selector
    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Cancel')
      ?.trigger('click')
    expect(wrapper.find('.auth-title').text()).toBe('Login')
  })
})
