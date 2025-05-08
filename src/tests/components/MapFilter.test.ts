/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-enable @typescript-eslint/ban-ts-comment */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import MapFilter from '@/components/map/MapFilter.vue'
import MapIcon from '@/components/map/MapIcon.vue'

// Mock MapIcon component
vi.mock('@/components/map/MapIcon.vue', () => ({
  default: {
    name: 'MapIcon',
    props: ['type', 'size'],
    template: '<div data-testid="map-icon" :data-type="type" :data-size="size"></div>'
  }
}))

describe('MapFilter.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(MapFilter)
  })

  it('renders MapIcon components with correct properties', () => {
    const mapIcons = wrapper.findAllComponents(MapIcon)

    // Check correct number of MapIcon components
    expect(mapIcons.length).toBe(9)

    // Check specific MapIcon props
    expect(mapIcons[0].props('type')).toBe('affected_areas')
    expect(mapIcons[0].props('size')).toBe('small')

    expect(mapIcons[1].props('type')).toBe('shelter')
    expect(mapIcons[1].props('size')).toBe('small')

    // Check the household member icon
    expect(mapIcons[8].props('type')).toBe('household_member')
    expect(mapIcons[8].props('size')).toBe('small')
  })

  it('initializes all checkboxes as checked by default', () => {
    const checkboxes = wrapper.findAll('input[type="checkbox"]')

    checkboxes.forEach(checkbox => {
      expect(checkbox.element.checked).toBe(true)
    })
  })

  it('emits filter-change event on mount with initial values', () => {
    const expectedFilters = {
      affected_areas: true,
      shelter: true,
      defibrillator: true,
      water_station: true,
      food_central: true,
      hospital: true,
      meeting_place: true,
      household: true,
      household_member: true,
    }

    const emitted = wrapper.emitted('filter-change')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual(expectedFilters)
  })

  it('emits filter-change event when checkbox is toggled', async () => {
    // Clear previous emissions from mount
    const emitted = wrapper.emitted('filter-change')
    expect(emitted).toBeTruthy()
    emitted!.length = 0

    // Toggle affected_areas checkbox
    const affectedAreasCheckbox = wrapper.find('#affected-areas')
    await affectedAreasCheckbox.setValue(false)

    // Check if event was emitted with correct value
    const updatedEmitted = wrapper.emitted('filter-change')
    expect(updatedEmitted).toBeTruthy()
    expect(updatedEmitted![0][0].affected_areas).toBe(false)

    // Other filters should remain true
    expect(updatedEmitted![0][0].shelter).toBe(true)
    expect(updatedEmitted![0][0].hospital).toBe(true)

    // Toggle another checkbox
    const shelterCheckbox = wrapper.find('#shelter')
    await shelterCheckbox.setValue(false)

    // Check if another event was emitted
    const finalEmitted = wrapper.emitted('filter-change')
    expect(finalEmitted!.length).toBe(2)
    expect(finalEmitted![1][0].shelter).toBe(false)
    expect(finalEmitted![1][0].affected_areas).toBe(false)
  })

  it('properly handles household_member filter toggle', async () => {
    // Clear previous emissions from mount
    const emitted = wrapper.emitted('filter-change')
    expect(emitted).toBeTruthy()
    emitted!.length = 0

    // Find and toggle household_member checkbox
    const householdMemberCheckbox = wrapper.find('#household_member')
    await householdMemberCheckbox.setValue(false)

    // Check if event was emitted with correct values
    const updatedEmitted = wrapper.emitted('filter-change')
    expect(updatedEmitted).toBeTruthy()
    expect(updatedEmitted![0][0].household_member).toBe(false)
    expect(updatedEmitted![0][0].household).toBe(true) // Other filters unchanged

    // Toggle back on
    await householdMemberCheckbox.setValue(true)
    expect(updatedEmitted![1][0].household_member).toBe(true)
  })

  it('allows user to toggle all filters', async () => {
    // Get all checkboxes
    const checkboxes = wrapper.findAll('input[type="checkbox"]')

    // Toggle all filters off
    for (let i = 0; i < checkboxes.length; i++) {
      await checkboxes[i].setValue(false)
    }

    // Check final state in last emission
    const emissions = wrapper.emitted('filter-change')
    expect(emissions).toBeTruthy()
    const lastEmission = emissions![emissions!.length - 1][0]

    // All filters should be false
    Object.values(lastEmission).forEach(value => {
      expect(value).toBe(false)
    })
  })
})
