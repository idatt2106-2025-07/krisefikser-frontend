// tests/AdminView.spec.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent } from 'vue'

/* ───── helpers & stubs ───── */
function simpleStub(name: string) {
  return defineComponent({
    name,
    template: `<div class="${name}-stub"><slot /></slot></div>`,
  })
}

vi.mock('primevue/tabs', () => ({
  default: defineComponent({
    name: 'Tabs',
    props: { value: String },
    emits: ['update:value'],
    template: `<div class="tabs-stub"><slot /></div>`,
  }),
}))
vi.mock('primevue/tablist',   () => ({ default: simpleStub('tablist') }))
vi.mock('primevue/tab',       () => ({ default: simpleStub('tab') }))
vi.mock('primevue/tabpanels', () => ({ default: simpleStub('tabpanels') }))
vi.mock('primevue/tabpanel',  () => ({ default: simpleStub('tabpanel') }))

vi.mock('@/components/AdminPanel.vue', () => ({
  default: defineComponent({
    name: 'AdminPanel',
    props: { type: String },
    template: `<div class="admin-panel-stub" :data-type="type">{{ type }}</div>`,
  }),
}))

/* ───── component under test (import **after** mocks) ───── */
import AdminView from '@/views/AdminView.vue'

/* ───── tests ───── */
describe('AdminView.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(AdminView)
  })

  it('renders the page title', () => {
    expect(wrapper.find('h1.title').text()).toBe('Admin Panel')
  })

  it('renders the three tabs with correct labels', () => {
    const text = wrapper.text()
    expect(text).toContain('Manage Map')
    expect(text).toContain('Gameification')
    expect(text).toContain('Manage Users')
  })

  it('renders three AdminPanel stubs with correct type props', () => {
    const types = wrapper.findAll('.admin-panel-stub')
                       .map((n) => n.attributes('data-type'))
    expect(types).toEqual(['Map', 'Gameification', 'User'])
  })

  it('handleAddIcon(): success path closes the form', () => {
    const vm: any = wrapper.vm
    vm.iconType = 'Shelter'      // plain assignment (auto-unwrapped ref)
    vm.showAddIconForm = true

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    vm.handleAddIcon()

    expect(alertSpy).toHaveBeenCalledWith('Icon added: Type – Shelter')
    expect(vm.showAddIconForm).toBe(false)
    alertSpy.mockRestore()
  })

  it('handleAddIcon(): validation path keeps the form open', () => {
    const vm: any = wrapper.vm
    vm.iconType = ''             // no icon chosen
    vm.showAddIconForm = true

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    vm.handleAddIcon()

    expect(alertSpy).toHaveBeenCalledWith('Please select an icon type.')
    expect(vm.showAddIconForm).toBe(true)
    alertSpy.mockRestore()
  })
})
