import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import QuizCreator from '@/components/QuizCreator.vue'

import PrimeVue from 'primevue/config'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    (() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
})

describe('QuizCreator.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(QuizCreator, {
      global: {
        plugins: [PrimeVue],
        components: {
          InputText,
          Button,
          Card,
          Dropdown,
        },
      },
    })
  })

  it('renders the quiz creator form', () => {
    expect(wrapper.text()).toContain('Create New Question')
    expect(wrapper.find('input#questionText').exists()).toBe(true)
  })

  it('adds options to the question', async () => {
    const inputs = wrapper.findAll('input')
    const optionInput = inputs[1]
    await optionInput.setValue('Option A')
    await nextTick()

    const addButton = wrapper.findAllComponents(Button).find((btn) => btn.props().label === 'Add')
    expect(addButton).toBeTruthy()
    await addButton!.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('1. Option A')
  })

  it('does not add empty option', async () => {
    const addButton = wrapper.findAllComponents(Button).find((btn) => btn.props().label === 'Add')
    await addButton!.trigger('click')
    await nextTick()

    expect(wrapper.find('.options-list').exists()).toBe(false)
  })

  it('adds a full valid question', async () => {
    window.alert = vi.fn()

    const questionInput = wrapper.find('input#questionText')
    await questionInput.setValue('What is 2 + 2?')

    const optionInput = wrapper.find('input#newOption')
    const addButton = wrapper.findAllComponents(Button).find((btn) => btn.props().label === 'Add')

    await optionInput.setValue('3')
    await addButton!.trigger('click')
    await optionInput.setValue('4')
    await addButton!.trigger('click')
    await nextTick()

    const dropdown = wrapper.findComponent(Dropdown)
    await dropdown.vm.$emit('update:modelValue', 1)
    await nextTick()

    const addQuestionButton = wrapper
      .findAllComponents(Button)
      .find((btn) => btn.props().label === 'Add Question')
    await addQuestionButton!.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('What is 2 + 2?')
    expect(wrapper.text()).toContain('✔')
    expect(window.alert).not.toHaveBeenCalled()
  })

  it('shows alert for incomplete question', async () => {
    window.alert = vi.fn()

    const questionInput = wrapper.find('input#questionText')
    await questionInput.setValue('Incomplete')
    await nextTick()

    const addQuestionButton = wrapper
      .findAllComponents(Button)
      .find((btn) => btn.props().label === 'Add Question')
    await addQuestionButton!.trigger('click')
    await nextTick()

    expect(window.alert).toHaveBeenCalledWith(
      'Please enter a question, add at least two options, and choose the correct answer.',
    )
  })

  it('resets the question form', async () => {
    const questionInput = wrapper.find('input#questionText')
    await questionInput.setValue('To be reset')
    await nextTick()

    const resetBtn = wrapper.findAllComponents(Button).find((btn) => btn.props().label === 'Reset')
    await resetBtn!.trigger('click')
    await nextTick()

    expect((questionInput.element as HTMLInputElement).value).toBe('')
  })
})
