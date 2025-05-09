<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import householdService from '@/services/HouseholdService'
import SidebarContent from '@/components/navigation/SidebarContent.vue'
import { useAuthStore } from '@/stores/auth.ts'
import { computed } from 'vue'
import { getCoordinatesFromAddress } from '@/services/geoNorgeService'
import UserProfileTab from '@/components/user/UserProfileTab.vue'
import UserProfileSettingsTab from '@/components/user/UserProfileSettingsTab.vue'
import nonMemberUserService from '@/services/NonMemberUserService'

/**
 * Interface representing a sidebar item.
 * @interface
 * @property {string} id - Unique identifier for the sidebar item.
 * @property {string} title - Display title of the sidebar item.
 */
interface SidebarItem {
  id: string
  title: string
}

/**
 * Interface representing a household member.
 * @interface
 * @property {string} name - Name of the household member.
 */
interface Member {
  name: string
  id?: number
  email?: string
  type?: string
  memberType: 'user' | 'nonUser' // To distinguish between user and non-user members
}

/**
 * Reactive array of sidebar menu items.
 * @type {Ref<SidebarItem[]>}
 */
const menuItems = ref<SidebarItem[]>([
  {
    id: 'profile',
    title: 'Profile',
  },
  {
    id: 'household',
    title: 'Household',
  },
  {
    id: 'group',
    title: 'Group',
  },
])

/**
 * Reactive state to track the currently active popup member.
 * @type {Ref<string | null>}
 */
const activePopupMember = ref<string | null>(null)

/**
 * Handles the selection of a sidebar item.
 * @param {SidebarItem} item - The selected sidebar item.
 * @param {number} index - The index of the selected item.
 */
const handleItemSelected = (item: SidebarItem, index: number) => {
  console.log('Selected item:', item.title, 'at index:', index)
  householdTitle.value = item.title
  if (item.id === 'household') {
    fetchMembers()
  }
}

/**
 * Reactive array of household members.
 * @type {Ref<Member[]>}
 */
const members = ref<Member[]>([])

const householdTitle = ref()

const householdId = ref<number | null>(null)

const authStore = useAuthStore()

const currentUserName = computed(() => authStore.name)

const joinRequests = ref<any[]>([])

/**
 * Reactive state to track the loading status.
 * @type {Ref<boolean>}
 */
const isLoading = ref(true)

/**
 * Reactive state to store error messages.
 * @type {Ref<string | null>}
 */
const error = ref<string | null>(null)

const showJoinModal = ref(false)
const joinHouseholdId = ref('')
const joinError = ref('')

const showLeaveModal = ref(false)
const newHouseholdName = ref('')
const newHouseholdAddress = ref('')
const addressError = ref('')
const isSubmitting = ref(false)

const showInviteModal = ref(false)
const inviteEmail = ref('')
const inviteError = ref('')
const isInviting = ref(false)

const openInviteModal = () => {
  showInviteModal.value = true
  inviteEmail.value = ''
  inviteError.value = ''
}

const closeInviteModal = () => {
  showInviteModal.value = false
  inviteEmail.value = ''
  inviteError.value = ''
}

const openLeaveModal = () => {
  showLeaveModal.value = true
  newHouseholdName.value = ''
  newHouseholdAddress.value = ''
  addressError.value = ''
}

const closeLeaveModal = () => {
  showLeaveModal.value = false
  addressError.value = ''
}

const showAddNonUserModal = ref(false)
const nonUserMemberData = ref({
  name: '',
  type: 'CHILD',
})
const nonUserMemberError = ref('')
const isAddingNonUser = ref(false)

const addMemberWithoutUser = () => {
  showAddNonUserModal.value = true
  nonUserMemberData.value = {
    name: '',
    type: 'CHILD',
  }
  nonUserMemberError.value = ''
}

const closeAddNonUserModal = () => {
  showAddNonUserModal.value = false
  nonUserMemberError.value = ''
}

const submitAddNonUserMember = async () => {
  if (!nonUserMemberData.value.name) {
    nonUserMemberError.value = 'Name is required.'
    return
  }

  isAddingNonUser.value = true
  nonUserMemberError.value = ''

  try {
    await nonMemberUserService.addNonUserMember(nonUserMemberData.value)
    await fetchMembers() // Refresh the member list
    closeAddNonUserModal()
  } catch (e) {
    nonUserMemberError.value = 'Failed to add non-user member. Please try again.'
    console.error(e)
  } finally {
    isAddingNonUser.value = false
  }
}

const submitLeaveHousehold = async () => {
  isSubmitting.value = true
  addressError.value = ''
  // Get coordinates
  const coords = await getCoordinatesFromAddress(newHouseholdAddress.value)
  if (!coords) {
    addressError.value = 'Invalid address. Please enter a valid Norwegian address.'
    isSubmitting.value = false
    return
  }
  try {
    await householdService.leaveAndCreateHousehold({
      name: newHouseholdName.value,
      latitude: coords.lat,
      longitude: coords.lon,
    })
    closeLeaveModal()
    await fetchMembers()
    alert('You have left your household and created a new one.')
  } catch (e) {
    addressError.value = 'Failed to create new household.'
  } finally {
    isSubmitting.value = false
  }
}

const requestToJoinAnotherHousehold = async () => {
  joinError.value = ''
  joinHouseholdId.value = ''
  showJoinModal.value = true
}

const submitJoinRequest = async () => {
  if (!joinHouseholdId.value) {
    joinError.value = 'Please enter a valid household ID.'
    return
  }

  try {
    await householdService.requestToJoinHousehold(parseInt(joinHouseholdId.value, 10))
    alert('Join request sent!')
    showJoinModal.value = false
  } catch (e) {
    joinError.value = 'Failed to send join request.'
  }
}

const deleteNonUserMember = async (id: number) => {
  if (!id) return

  try {
    await nonMemberUserService.deleteNonUserMember(id)
    await fetchMembers()
    activePopupMember.value = null
  } catch (e) {
    console.error('Failed to delete non-user member:', e)
    alert('Failed to delete non-user member')
  }
}

const submitInvite = async () => {
  if (!inviteEmail.value || !inviteEmail.value.includes('@')) {
    inviteError.value = 'Please enter a valid email address.'
    return
  }

  isInviting.value = true
  inviteError.value = ''
  try {
    await householdService.createInvitation(inviteEmail.value)
    alert('Invitation sent!')
    closeInviteModal()
  } catch (e) {
    inviteError.value = 'Failed to send invitation. Try again later.'
  } finally {
    isInviting.value = false
  }
}

const sortedMembers = computed(() => {
  return [...members.value].sort((a, b) => {
    // Put current user at the top
    if (a.name === currentUserName.value) return -1
    if (b.name === currentUserName.value) return 1

    // Then sort by member type (user members before non-user members)
    if (a.memberType === 'user' && b.memberType === 'nonUser') return -1
    if (a.memberType === 'nonUser' && b.memberType === 'user') return 1

    // Finally sort alphabetically by name
    return a.name.localeCompare(b.name)
  })
})

/**
 * Fetches the list of household members.
 * Simulates an API call with a delay.
 * @async
 */
const fetchMembers = async () => {
  isLoading.value = true
  error.value = null

  try {
    const data = await householdService.getMyHouseholdDetails()

    // Combine regular members with non-user members
    const regularMembers =
      data.members?.map((member) => ({
        ...member,
        memberType: 'user',
      })) || []

    const nonUserMembers =
      data.nonUserMembers?.map((member) => ({
        ...member,
        memberType: 'nonUser',
      })) || []

    // Combine both arrays into members
    members.value = [...regularMembers, ...nonUserMembers]
    householdTitle.value = data.name
    householdId.value = data.id
  } catch (e) {
    error.value = 'Failed to load household members'
    console.log(e)
  } finally {
    isLoading.value = false
  }
}

const fetchJoinRequests = async () => {
  try {
    joinRequests.value = await householdService.getJoinRequests()
  } catch (e) {
    joinRequests.value = []
  }
}

const acceptJoinRequest = async (requestId: number) => {
  try {
    await householdService.acceptJoinRequest(requestId)
    await fetchJoinRequests()
    await fetchMembers()
    alert(`Accepted request #${requestId}`)
  } catch (e) {
    alert('Failed to accept join request.')
  }
}

const declineJoinRequest = async (requestId: number) => {
  try {
    await householdService.declineJoinRequest(requestId)
    await fetchJoinRequests()
    await fetchMembers()
    alert(`Accepted request #${requestId}`)
  } catch (e) {
    alert('Failed to accept join request.')
  }
}

/**
 * Handles the edit action for a household member.
 * Toggles the popup for the selected member.
 * @param {Member} member - The member to be edited.
 * @param {Event} event - The click event.
 */
const editMember = (member: Member, event: Event) => {
  // Stop event propagation to prevent immediate closing
  event.stopPropagation()

  // Toggle popup for this member
  if (activePopupMember.value === member.name) {
    activePopupMember.value = null
  } else {
    activePopupMember.value = member.name
  }
}

/**
 * Closes all active popups.
 */
const closePopups = () => {
  activePopupMember.value = null
}

/**
 * Lifecycle hook that runs when the component is mounted.
 * - Fetches the list of members.
 * - Adds a click event listener to close popups.
 */
onMounted(() => {
  fetchMembers()
  fetchJoinRequests()
  document.addEventListener('click', closePopups)
})

/**
 * Lifecycle hook that runs before the component is unmounted.
 * - Removes the click event listener to close popups.
 */
onBeforeUnmount(() => {
  document.removeEventListener('click', closePopups)
})
</script>

<template>
  <div class="page-container">
    <h2>Profile Page</h2>
    <div class="content-container">
      <div class="sidebar-wrapper">
        <SidebarContent
          :content-title="householdTitle"
          sidebar-title="household"
          :sidebar-items="menuItems"
          @item-selected="handleItemSelected"
          class="sidebar-component"
        >
          <template #household>
            <p>Household id: {{ householdId ?? '' }}</p>
            <button class="blue-button" @click="openInviteModal">Invite user</button>
            <br />
            <button class="blue-button" @click="addMemberWithoutUser">
              Add member without user
            </button>

            <div class="join-requests-section" v-if="joinRequests.length">
              <h4>Pending Join Requests</h4>
              <ul>
                <li v-for="req in joinRequests" :key="req.id">
                  User ID {{ req.userId }} wants to join your household
                  <button class="accept-btn" @click="acceptJoinRequest(req.id)">Accept</button>
                  <button class="decline-btn" @click="declineJoinRequest(req.id)">Decline</button>
                </li>
              </ul>
            </div>

            <div class="household-content">
              <h3>Members ⋅ {{ members.length }}</h3>
              <hr />
              <div v-if="isLoading" class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading members...</p>
              </div>

              <div v-else-if="error" class="error-container">
                <p>{{ error }}</p>
                <button class="retry-button" @click="fetchMembers">Try again</button>
              </div>

              <div v-else class="members-list">
                <div v-for="member in sortedMembers" :key="member.name" class="member-card">
                  <div class="member-info">
                    <span
                      class="member-name"
                      :class="{ 'current-user': member.name === currentUserName }"
                    >
                      {{ member.name }}{{ member.name === currentUserName ? ' (you)' : '' }}
                    </span>
                    <span class="member-description">
                      {{
                        member.memberType === 'user'
                          ? member.email
                          : `Type: ${member.type?.toLowerCase()}`
                      }}
                    </span>
                  </div>
                  <div
                    class="edit-container"
                    v-if="member.name === currentUserName || member.memberType === 'nonUser'"
                  >
                    <button class="edit-button" @click="editMember(member, $event)">•••</button>
                    <div v-if="activePopupMember === member.name" class="member-popup">
                      <template v-if="member.name === currentUserName">
                        <div class="popup-option" @click.stop="openLeaveModal">Leave household</div>
                        <div class="popup-option" @click.stop="requestToJoinAnotherHousehold">
                          Request to join another household
                        </div>
                      </template>
                      <template v-else-if="member.memberType === 'nonUser'">
                        <div
                          class="popup-option delete-option"
                          @click.stop="deleteNonUserMember(member.id)"
                        >
                          Delete member
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #group>
            <div class="group-content">
              <span>groups</span>
            </div>
          </template>

          <template #profile>
            <div class="group-content">
              <UserProfileTab />
            </div>
          </template>
        </SidebarContent>
      </div>
    </div>

    <!-- Leave Household Modal -->
    <div v-if="showLeaveModal" class="modal-overlay">
      <div class="modal-content">
        <h3>To leave your current household, you must create a new personal household</h3>
        <label>
          Household Name:
          <input v-model="newHouseholdName" type="text" />
        </label>
        <label>
          Address:
          <input v-model="newHouseholdAddress" type="text" />
        </label>
        <div v-if="addressError" class="error">{{ addressError }}</div>
        <div class="modal-actions">
          <button @click="closeLeaveModal" :disabled="isSubmitting">Cancel</button>
          <button
            @click="submitLeaveHousehold"
            :disabled="isSubmitting || !newHouseholdName || !newHouseholdAddress"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Join Household Modal -->
    <div v-if="showJoinModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Request to Join Another Household</h3>
        <label>
          Enter the ID of the household you want to join:
          <input v-model="joinHouseholdId" type="text" />
        </label>
        <div v-if="joinError" class="error">{{ joinError }}</div>
        <div class="modal-actions">
          <button @click="() => (showJoinModal = false)">Cancel</button>
          <button @click="submitJoinRequest" :disabled="!joinHouseholdId">Submit</button>
        </div>
      </div>
    </div>

    <!-- Invite User Modal -->
    <div v-if="showInviteModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Invite a User to Your Household</h3>
        <label>
          Enter the email of the person you want to invite:
          <input v-model="inviteEmail" type="email" placeholder="name@example.com" />
        </label>
        <div v-if="inviteError" class="error">{{ inviteError }}</div>
        <div class="modal-actions">
          <button @click="closeInviteModal" :disabled="isInviting">Cancel</button>
          <button @click="submitInvite" :disabled="isInviting || !inviteEmail">
            {{ isInviting ? 'Sending...' : 'Send Invite' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add Non-User Member Modal -->
    <div v-if="showAddNonUserModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Add Household Member Without User Account</h3>
        <label>
          Name:
          <input v-model="nonUserMemberData.name" type="text" required />
        </label>
        <label>
          Type:
          <select v-model="nonUserMemberData.type">
            <option value="CHILD">Child</option>
            <option value="ANIMAL">Animal</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <div v-if="nonUserMemberError" class="error">{{ nonUserMemberError }}</div>
        <div class="modal-actions">
          <button @click="closeAddNonUserModal" :disabled="isAddingNonUser">Cancel</button>
          <button
            @click="submitAddNonUserMember"
            :disabled="isAddingNonUser || !nonUserMemberData.name"
          >
            {{ isAddingNonUser ? 'Adding...' : 'Add Member' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(30, 41, 59, 0.45); /* darker, more modern */
  backdrop-filter: blur(2px); /* subtle blur */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: modal-fade-in 0.25s ease;
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.delete-option:hover {
  color: #dc2626 !important;
  background-color: #fee2e2 !important;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 32px 24px;
  min-width: 320px;
  max-width: 500px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
}

.member-info {
  display: flex;
  flex-direction: column;
}

.member-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.member-description {
  font-size: 0.85rem;
  color: #64748b;
}

.modal-actions {
  margin-top: 18px;
  display: flex;
  gap: 12px;
}

.modal-content label {
  display: flex;
  flex-direction: column;
  font-weight: 500;
  margin-bottom: 1rem;
  gap: 0.25rem;
}

.modal-content input[type='text'] {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
  background: #f8fafc;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  outline: none;
  margin-top: 0.25rem;
}

.modal-content input[type='text']:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.15);
  background: #fff;
}

.error {
  color: #b91c1c;
  margin-top: 8px;
}

p {
  font-size: 16px;
}
.page-container {
  min-height: 100vh;
  background-color: var(--background-color);
  padding: 24px;
}

.content-container {
  max-width: 896px;
  margin: 0 auto;
}

.sidebar-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.sidebar-component {
  height: 800px;
}

.household-content ul {
  margin: 20px 0;
  padding-left: 20px;
}

.household-content li {
  margin-bottom: 8px;
}

.leave-household {
  background-color: var(--danger-color);
  margin-bottom: 20px;
}

.blue-button {
  margin-bottom: 10px;
}

.leave-household:hover {
  background-color: rgb(186, 0, 0);
}

h3 {
  margin-bottom: 0;
}

.group-item h3 {
  margin: 0 0 8px 0;
}

.member-card {
  display: flex;
  padding: 8px;
  border: 1px solid #444343;
  border-radius: 6px;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  transition: background-color 0.2s;
  margin-bottom: 10px;
}

.edit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 15px;
  border-color: #0ea5e9;
  background-color: #c1c1c1;
  color: #000000;
  cursor: pointer;
  margin-left: 12px;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background-color: #0ea5e9;
  color: white;
}

.loading-spinner {
  border: 3px solid #f3f4f6;
  border-top: 3px solid #0ea5e9;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1.5s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.mobile-menu-button span {
  height: 3px;
  width: 100%;
  background-color: #333;
  border-radius: 3px;
}

.edit-container {
  position: relative;
  display: flex;
  align-items: center;
}

.member-popup {
  position: absolute;
  top: 0;
  right: 100%;
  margin-right: 8px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 100;
  min-width: 150px;
}

.popup-option {
  padding: 10px 16px;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #eee;
}

.popup-option:hover {
  background-color: #f5f5f5;
}

.popup-option:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .member-popup {
    right: 0;
    top: 100%;
    margin-top: 4px;
    margin-right: 0;
  }

  .member-card {
    padding: 12px 8px;
  }

  .edit-button {
    width: 28px;
    height: 28px;
    margin-left: 8px;
  }
}

@media (max-width: 480px) {
  .content-container {
    padding: 8px;
  }

  .sidebar-wrapper {
    border-radius: 4px;
  }

  h3 {
    font-size: 1.2rem;
  }

  .page-container {
    padding: 12px;
  }
}
</style>
