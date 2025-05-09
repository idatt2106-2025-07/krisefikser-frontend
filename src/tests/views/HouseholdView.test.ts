/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-enable @typescript-eslint/ban-ts-comment */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import Household from '@/views/household/HouseholdView.vue'
import householdService from '@/services/HouseholdService'
import { getCoordinatesFromAddress } from '@/services/geoNorgeService'

// Mock services
vi.mock('@/services/HouseholdService')
vi.mock('@/services/geoNorgeService')

describe('Household Component', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())

    // Reset all mocks
    vi.resetAllMocks()

    // Set up mock implementations with proper typing
    householdService.getMyHouseholdDetails = vi.fn().mockResolvedValue({
      members: [{ name: 'John Doe' }, { name: 'Jane Smith' }],
      name: 'Test Household',
      id: 123,
    })

    householdService.getJoinRequests = vi.fn().mockResolvedValue([
      { id: 1, userId: 101 },
      { id: 2, userId: 102 },
    ])

    getCoordinatesFromAddress = vi.fn().mockResolvedValue({ lat: 59.91, lon: 10.75 })

    // Initialize wrapper with proper mocks
    wrapper = mount(Household, {
      global: {
        mocks: {
          // Mock any required global properties here
        },
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('Initial State', () => {
    it('should initialize joinRequests as an empty array', () => {
      // This test checks the initial state before any API calls complete
      // Create a new wrapper without waiting for nextTick
      const freshWrapper = mount(Household)
      expect(Array.isArray(freshWrapper.vm.joinRequests)).toBe(true)
      expect(freshWrapper.vm.joinRequests.length).toBe(0)
    })


  describe('Data Loading', () => {
    it('should fetch members on mount', async () => {
      await nextTick()
      expect(householdService.getMyHouseholdDetails).toHaveBeenCalled()
      expect(wrapper.vm.members).toEqual([{ name: 'John Doe' }, { name: 'Jane Smith' }])
      expect(wrapper.vm.isLoading).toBe(false)
    })

    it('should fetch join requests on mount', async () => {
      await nextTick()
      expect(householdService.getJoinRequests).toHaveBeenCalled()
      expect(wrapper.vm.joinRequests).toEqual([
        { id: 1, userId: 101 },
        { id: 2, userId: 102 },
      ])
    })

    it('should handle fetch members error', async () => {
      householdService.getMyHouseholdDetails.mockRejectedValue(new Error('Network error'))
      wrapper = mount(Household)
      await nextTick()

      expect(wrapper.vm.error).toBe('Failed to load household members')
      expect(wrapper.vm.isLoading).toBe(false)
    })

    it('should handle empty join requests', async () => {
      householdService.getJoinRequests.mockResolvedValue([])
      wrapper = mount(Household)
      await nextTick()

      expect(wrapper.vm.joinRequests).toEqual([])
    })
  })

  describe('Sidebar Interactions', () => {
    it('should handle item selection', async () => {
      await wrapper.vm.handleItemSelected({ id: 'household', title: 'Household' }, 0)
      expect(wrapper.vm.householdTitle).toBe('Test Household')
      expect(householdService.getMyHouseholdDetails).toHaveBeenCalledTimes(2) // once on mount, once on selection
    })
  })

  describe('Member Interactions', () => {
    it('should toggle member popup', async () => {
      await nextTick() // Wait for data to load
      const member = { name: 'John Doe' }

      // First click opens popup
      wrapper.vm.editMember(member, { stopPropagation: vi.fn() })
      expect(wrapper.vm.activePopupMember).toBe('John Doe')

      // Second click closes popup
      wrapper.vm.editMember(member, { stopPropagation: vi.fn() })
      expect(wrapper.vm.activePopupMember).toBeNull()
    })

    it('should close popups on document click', async () => {
      await nextTick()
      wrapper.vm.activePopupMember = 'John Doe'
      wrapper.vm.closePopups()
      expect(wrapper.vm.activePopupMember).toBeNull()
    })
  })

  describe('Modal Interactions', () => {
    it('should open and close invite modal', async () => {
      expect(wrapper.vm.showInviteModal).toBe(false)
      wrapper.vm.openInviteModal()
      expect(wrapper.vm.showInviteModal).toBe(true)
      expect(wrapper.vm.inviteEmail).toBe('')

      wrapper.vm.closeInviteModal()
      expect(wrapper.vm.showInviteModal).toBe(false)
    })

    it('should open and close leave modal', async () => {
      expect(wrapper.vm.showLeaveModal).toBe(false)
      wrapper.vm.openLeaveModal()
      expect(wrapper.vm.showLeaveModal).toBe(true)
      expect(wrapper.vm.newHouseholdName).toBe('')

      wrapper.vm.closeLeaveModal()
      expect(wrapper.vm.showLeaveModal).toBe(false)
    })

    it('should open join modal', async () => {
      expect(wrapper.vm.showJoinModal).toBe(false)
      wrapper.vm.requestToJoinAnotherHousehold()
      expect(wrapper.vm.showJoinModal).toBe(true)
      expect(wrapper.vm.joinHouseholdId).toBe('')
    })
  })

  describe('Form Submissions', () => {
    it('should submit invite form successfully', async () => {
      householdService.createInvitation = vi.fn().mockResolvedValue({})
      wrapper.vm.inviteEmail = 'test@example.com'
      await wrapper.vm.submitInvite()

      expect(householdService.createInvitation).toHaveBeenCalledWith('test@example.com')
      expect(wrapper.vm.showInviteModal).toBe(false)
    })

    it('should handle invite form error', async () => {
      householdService.createInvitation = vi.fn().mockRejectedValue(new Error('Failed'))
      wrapper.vm.inviteEmail = 'test@example.com'
      await wrapper.vm.submitInvite()

      expect(wrapper.vm.inviteError).toBe('Failed to send invitation. Try again later.')
    })

    it('should validate invite email', async () => {
      wrapper.vm.inviteEmail = 'invalid-email'
      await wrapper.vm.submitInvite()

      expect(wrapper.vm.inviteError).toBe('Please enter a valid email address.')
      expect(householdService.createInvitation).not.toHaveBeenCalled()
    })

    it('should submit leave household form successfully', async () => {
      householdService.leaveAndCreateHousehold = vi.fn().mockResolvedValue({})
      wrapper.vm.newHouseholdName = 'New Home'
      wrapper.vm.newHouseholdAddress = 'Oslo, Norway'

      await wrapper.vm.submitLeaveHousehold()

      expect(getCoordinatesFromAddress).toHaveBeenCalledWith('Oslo, Norway')
      expect(householdService.leaveAndCreateHousehold).toHaveBeenCalledWith({
        name: 'New Home',
        latitude: 59.91,
        longitude: 10.75,
      })
      expect(wrapper.vm.showLeaveModal).toBe(false)
    })

    it('should handle invalid address in leave form', async () => {
      getCoordinatesFromAddress = vi.fn().mockResolvedValue(null)
      wrapper.vm.newHouseholdName = 'New Home'
      wrapper.vm.newHouseholdAddress = 'Invalid Address'

      await wrapper.vm.submitLeaveHousehold()

      expect(wrapper.vm.addressError).toBe(
        'Invalid address. Please enter a valid Norwegian address.',
      )
      expect(householdService.leaveAndCreateHousehold).not.toHaveBeenCalled()
    })

    it('should submit join request successfully', async () => {
      householdService.requestToJoinHousehold = vi.fn().mockResolvedValue({})
      wrapper.vm.joinHouseholdId = '456'
      await wrapper.vm.submitJoinRequest()

      expect(householdService.requestToJoinHousehold).toHaveBeenCalledWith(456)
      expect(wrapper.vm.showJoinModal).toBe(false)
    })

    it('should validate join request', async () => {
      wrapper.vm.joinHouseholdId = ''
      await wrapper.vm.submitJoinRequest()

      expect(wrapper.vm.joinError).toBe('Please enter a valid household ID.')
      expect(householdService.requestToJoinHousehold).not.toHaveBeenCalled()
    })
  })

  describe('Join Request Handling', () => {
    it('should accept join request', async () => {
      householdService.acceptJoinRequest = vi.fn().mockResolvedValue({})
      await wrapper.vm.acceptJoinRequest(1)

      expect(householdService.acceptJoinRequest).toHaveBeenCalledWith(1)
      expect(householdService.getJoinRequests).toHaveBeenCalledTimes(2) // once on mount, once after accept
      expect(householdService.getMyHouseholdDetails).toHaveBeenCalledTimes(2)
    })

    it('should decline join request', async () => {
      householdService.declineJoinRequest = vi.fn().mockResolvedValue({})
      await wrapper.vm.declineJoinRequest(2)

      expect(householdService.declineJoinRequest).toHaveBeenCalledWith(2)
      expect(householdService.getJoinRequests).toHaveBeenCalledTimes(2)
    })
  })

  describe('Lifecycle Hooks', () => {
    it('should add and remove event listeners', () => {
      const addSpy = vi.spyOn(document, 'addEventListener')
      const removeSpy = vi.spyOn(document, 'removeEventListener')

      const wrapper = mount(Household)

      expect(addSpy).toHaveBeenCalledWith('click', wrapper.vm.closePopups)

      wrapper.unmount()
      expect(removeSpy).toHaveBeenCalledWith('click', wrapper.vm.closePopups)
    })
  })
})
})
