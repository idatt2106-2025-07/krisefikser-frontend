/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-enable @typescript-eslint/ban-ts-comment */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import EmailVerification from '@/views/auth/VerifyEmailView.vue'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

// Mock axios
vi.mock('axios')

describe('EmailVerification', () => {
  const mockRoute = {
    query: {},
  }

  beforeEach(() => {
    vi.mocked(useRoute).mockReturnValue(mockRoute)
    vi.mocked(axios.get).mockReset()
    vi.mocked(axios.post).mockReset()
  })

  it('renders loading state initially', () => {
    const wrapper = mount(EmailVerification)
    expect(wrapper.find('.verify-loading').exists()).toBe(true)
    expect(wrapper.find('.spinner').exists()).toBe(true)
    expect(wrapper.text()).toContain('Verifying your email...')
  })

  it('shows error when token is missing', async () => {
    const wrapper = mount(EmailVerification)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.verify-error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Verification token is missing.')
    expect(wrapper.find('.error-icon').exists()).toBe(true)
  })

  it('shows success message when verification succeeds', async () => {
    mockRoute.query.token = 'valid-token'
    vi.mocked(axios.get).mockResolvedValue({
      status: 200,
      data: { message: 'Email verified successfully!' },
    })

    const wrapper = mount(EmailVerification)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.find('.verify-success').exists()).toBe(true)
    expect(wrapper.text()).toContain('Email verified successfully!')
    expect(wrapper.find('.success-icon').exists()).toBe(true)
    expect(wrapper.find('.verify-button').text()).toBe('Go to Login')
  })

  it('shows error message when verification fails', async () => {
    mockRoute.query.token = 'invalid-token'
    vi.mocked(axios.get).mockRejectedValue({
      response: {
        data: { message: 'Invalid verification token' },
      },
    })

    const wrapper = mount(EmailVerification)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.find('.verify-error').exists()).toBe(true)
    expect(wrapper.text()).toContain(
      'Email Verification!Network error—please try again later.Resend Verification',
    )
    expect(wrapper.find('.verify-button').text()).toBe('Resend Verification')
  })

  it('handles resend verification email', async () => {
    mockRoute.query.token = 'expired-token'
    vi.mocked(axios.get).mockRejectedValue({
      response: {
        data: { message: 'Token expired' },
      },
    })
    vi.mocked(axios.post).mockResolvedValue({})

    const wrapper = mount(EmailVerification)
    await new Promise((resolve) => setTimeout(resolve, 0))

    await wrapper.find('.verify-button').trigger('click')
    expect(wrapper.vm.resendLoading).toBe(false)

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.vm.resendLoading).toBe(false)
    expect(wrapper.vm.resendMessage).toBe('Verification email resent. Check your inbox.')
    expect(wrapper.find('.resend-message.success').exists()).toBe(true)
  })

  it('shows error when resend fails', async () => {
    mockRoute.query.token = 'expired-token'
    vi.mocked(axios.get).mockRejectedValue({
      response: {
        data: { message: 'Token expired' },
      },
    })
    vi.mocked(axios.post).mockRejectedValue({})

    const wrapper = mount(EmailVerification)
    await new Promise((resolve) => setTimeout(resolve, 0))

    await wrapper.find('.verify-button').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.vm.resendMessage).toBe('Failed to resend verification email.')
    expect(wrapper.find('.resend-message.error').exists()).toBe(true)
  })

  it('navigates to login on success', async () => {
    const mockRouter = {
      push: vi.fn(),
    }
    vi.mocked(useRouter).mockReturnValue(mockRouter)

    mockRoute.query.token = 'valid-token'
    vi.mocked(axios.get).mockResolvedValue({
      status: 200,
      data: { message: 'Success' },
    })

    const wrapper = mount(EmailVerification)
    await new Promise((resolve) => setTimeout(resolve, 0))

    await wrapper.find('.verify-button').trigger('click')
    expect(mockRouter.push).toHaveBeenCalledWith('/login')
  })
})
