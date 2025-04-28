// tests/HouseholdPage.spec.ts
import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent } from 'vue'

// ────────────────────────────────────────────────────────────
// 1. Component under test
// ────────────────────────────────────────────────────────────
import HouseholdPage from '@/views/HouseholdView.vue' // adjust if the file lives elsewhere

// ────────────────────────────────────────────────────────────
// 2. Stub child components
// ────────────────────────────────────────────────────────────
vi.mock('@/components/SidebarContent.vue', () => ({
  default: defineComponent({
    name: 'SidebarContent',
    props: {
      sidebarItems: { type: Array, default: () => [] },
      sidebarTitle: { type: String, default: '' },
    },
    emits: ['item-selected'],
    template: `
      <div data-test="sidebar-stub">
        <slot name="household" />
        <slot name="group" />
      </div>
    `,
  }),
}))

// ────────────────────────────────────────────────────────────
// 3. Utility
// ────────────────────────────────────────────────────────────
const runTimersAndFlush = async () => {
  vi.runOnlyPendingTimers()
  await flushPromises()
}

// ────────────────────────────────────────────────────────────
// 4. Tests
// ────────────────────────────────────────────────────────────
describe('HouseholdPage.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    vi.useFakeTimers()
    wrapper = mount(HouseholdPage)
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('passes menu items to the sidebar', () => {
    const sidebar = wrapper.findComponent({ name: 'SidebarContent' })
    expect(sidebar.props('sidebarItems')).toEqual([
      { id: 'household', title: 'Household' },
      { id: 'group', title: 'Group' },
    ])
  })

  it('shows the loading spinner while members are being fetched', () => {
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
  })

  it('renders six member cards after the fetch completes', async () => {
    await runTimersAndFlush()
    expect(wrapper.findAll('.member-card')).toHaveLength(6)
  })

  it('toggles the popup menu when the edit button is clicked', async () => {
    await runTimersAndFlush()
    const btn = wrapper.find('.edit-button')
    await btn.trigger('click')
    expect(wrapper.find('.member-popup').exists()).toBe(true)
    await btn.trigger('click')
    expect(wrapper.find('.member-popup').exists()).toBe(false)
  })

  it('closes an open popup when the user clicks outside', async () => {
    await runTimersAndFlush()
    await wrapper.find('.edit-button').trigger('click')
    expect(wrapper.find('.member-popup').exists()).toBe(true)
    document.body.click()
    await flushPromises()
    expect(wrapper.find('.member-popup').exists()).toBe(false)
  })

  it('displays the retry UI when an error occurs', async () => {
    // force an error state
    ;(wrapper.vm as any).error = 'Failed to load household members'
    ;(wrapper.vm as any).isLoading = false
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error-container').exists()).toBe(true)
  })
})
