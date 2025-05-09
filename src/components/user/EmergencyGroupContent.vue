<script setup lang="ts">
import { ref, onMounted } from 'vue'
import emergencyGroupService from '@/services/EmergencyGroupService'

// Define interfaces for type safety
interface EmergencyGroup {
  id: number;
  name: string;
  memberCount?: number;
}

interface GroupInvitation {
  id: number;
  groupId: number;
  groupName: string;
  inviterName: string;
}

// State management with proper typing
const isLoading = ref(true)
const group = ref<EmergencyGroup | null>(null)
const invitations = ref<GroupInvitation[]>([])
const error = ref('')

// Form data
const showCreateGroupModal = ref(false)
const newGroupName = ref('')
const creatingGroup = ref(false)
const createError = ref('')

// Invite form data
const showInviteModal = ref(false)
const householdName = ref('')
const inviteError = ref('')
const isInviting = ref(false)

// Fetch emergency group and invitations
const fetchData = async () => {
  isLoading.value = true
  error.value = ''

  try {
    // Fetch invitations
    const invitationsData = await emergencyGroupService.getInvitations()
    invitations.value = invitationsData

    // Try to get emergency group, but handle failure gracefully
    try {
      const groupData = await emergencyGroupService.getEmergencyGroup()
      group.value = groupData
    } catch (groupErr) {
      // If group fetch fails, set group to null to show the create button
      console.warn('No emergency group found or error fetching group:', groupErr)
      group.value = null
    }
  } catch (err) {
    error.value = 'Failed to load emergency group data'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// Create a new emergency group
const createEmergencyGroup = async () => {
  if (!newGroupName.value.trim()) {
    createError.value = 'Group name is required'
    return
  }

  creatingGroup.value = true
  createError.value = ''

  try {
    const createdGroup = await emergencyGroupService.addEmergencyGroup({ name: newGroupName.value })
    group.value = createdGroup
    newGroupName.value = ''
    showCreateGroupModal.value = false
  } catch (err) {
    createError.value = 'Failed to create emergency group'
    console.error(err)
  } finally {
    creatingGroup.value = false
  }
}

// Invite a household to the group
const inviteHousehold = async () => {
  if (!householdName.value.trim()) {
    inviteError.value = 'Household name is required'
    return
  }

  isInviting.value = true
  inviteError.value = ''

  try {
    await emergencyGroupService.inviteHouseholdByName(householdName.value)
    householdName.value = ''
    showInviteModal.value = false
    fetchData()
  } catch (err) {
    inviteError.value = 'Failed to invite household'
    console.error(err)
  } finally {
    isInviting.value = false
  }
}

// Handle invitation response with added error handling for network issues
const respondToInvitation = async (groupId: number, isAccept: boolean) => {
  try {
    await emergencyGroupService.answerInvitation(groupId, isAccept)
    fetchData()
  } catch (err: any) {
    // More specific error handling for network issues
    if (err.message === 'Network Error') {
      error.value = `Network error. Please check your connection and try again.`
    } else {
      error.value = `Failed to ${isAccept ? 'accept' : 'decline'} invitation`
    }
    console.error('Invitation response error:', err)
  }
}

// Close modals
const closeCreateModal = () => {
  showCreateGroupModal.value = false
  newGroupName.value = ''
  createError.value = ''
}

const closeInviteModal = () => {
  showInviteModal.value = false
  householdName.value = ''
  inviteError.value = ''
}

// Fetch data when component mounts
onMounted(fetchData)
</script>

<template>
  <div class="group-content">

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading emergency group...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchData">Try Again</button>
    </div>

    <div v-else>
      <!-- Group section -->
      <div class="groups-section">
        <div class="section-header">
          <h4>Your Emergency Group</h4>
          <hr />
          <!-- Only show create button if no group exists -->
          <button
            @click="showCreateGroupModal = true"
          >
            Create Group
          </button>
        </div>

        <div v-if="!group" class="empty-state">
          <p>You don't have an emergency group yet.</p>
        </div>

        <div v-else class="group-card">
          <div class="group-info">
            <h3>{{ group.name }}</h3>
          </div>
          <div class="group-actions">
            <button @click="showInviteModal = true" class="action-button">
              Invite Household
            </button>
          </div>
        </div>
      </div>

      <!-- Invitations section -->
      <div class="invitations-section">
        <h4>Invitations</h4>

        <div v-if="invitations.length === 0" class="empty-state">
          <p>No pending invitations.</p>
        </div>

        <div v-else class="invitations-list">
          <div v-for="invitation in invitations" :key="invitation.id" class="invitation-card">
            <div class="invitation-info">
              <h5>{{ invitation.groupName }}</h5>
            </div>
            <div class="invitation-actions">
              <button @click="respondToInvitation(invitation.groupId, true)" class="accept-button">
                Accept
              </button>
              <button @click="respondToInvitation(invitation.groupId, false)" class="decline-button">
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Group Modal -->
    <div v-if="showCreateGroupModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Create Emergency Group</h3>
        <label>
          Group Name:
          <input v-model="newGroupName" type="text" placeholder="Enter group name" />
        </label>
        <div v-if="createError" class="error">{{ createError }}</div>
        <div class="modal-actions">
          <button @click="closeCreateModal" :disabled="creatingGroup">Cancel</button>
          <button
            @click="createEmergencyGroup"
            :disabled="creatingGroup || !newGroupName.trim()"
          >
            {{ creatingGroup ? 'Creating...' : 'Create Group' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Invite Household Modal -->
    <div v-if="showInviteModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Invite Household to Group</h3>
        <label>
          Household Name:
          <input v-model="householdName" type="text" placeholder="Enter household name" />
        </label>
        <div v-if="inviteError" class="error">{{ inviteError }}</div>
        <div class="modal-actions">
          <button @click="closeInviteModal" :disabled="isInviting">Cancel</button>
          <button
            @click="inviteHousehold"
            :disabled="isInviting || !householdName.trim()"
          >
            {{ isInviting ? 'Inviting...' : 'Send Invite' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Styles remain unchanged */
.group-content {
  padding: 12px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.error-container {
  color: #b91c1c;
  text-align: center;
  padding: 16px;
  border: 1px solid #f87171;
  border-radius: 6px;
  background-color: #fee2e2;
  margin: 12px 0;
}

.groups-section, .invitations-section {
  margin-bottom: 24px;
}

.empty-state {
  text-align: center;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 6px;
  border: 1px dashed #cbd5e1;
  color: #64748b;
}

.group-card, .invitation-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 12px;
  background-color: white;
}

.group-info h5, .invitation-info h5 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.group-info p, .invitation-info p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.invitation-actions {
  display: flex;
  gap: 8px;
}

.accept-button {
  background-color: #10b981;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.decline-button {
  background-color: #f87171;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(30, 41, 59, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-width: 320px;
  max-width: 480px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
}

.modal-content label {
  display: flex;
  flex-direction: column;
  font-weight: 500;
  margin: 16px 0;
  gap: 4px;
}

.modal-content input[type="text"] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 16px;
  background: #f8fafc;
}

.modal-content input[type="text"]:focus {
  border-color: #0ea5e9;
  outline: none;
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.15);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.error {
  color: #b91c1c;
  font-size: 14px;
  margin-top: 8px;
}

h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
}
</style>
