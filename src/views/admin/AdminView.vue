<template>
  <div class="admin-dashboard">
    <div class="header">
      <h1 class="page-title">Admin Dashboard</h1>
      <p class="page-subtitle">Manage website content and settings</p>
    </div>

    <div class="card">
      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right"></i>
          Privacy Policy Editor
        </summary>
        <PrivacyPolicyEditor policyType="registered" />
      </details>

      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right"></i>
          General Information Management
        </summary>
        <ManageGeneralInfo />
      </details>

      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right"></i>
          Add Point of Interest
        </summary>
        <div class="editor-content">
          <div class="map-container">
            <TheMap :isAdminPage="true" @map-click="handleMapClick" />
          </div>
          <div class="form-container">
            <AddPOIView :longitude="selectedLng" :latitude="selectedLat" />
          </div>
        </div>
      </details>

      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right"></i>
          Update Point of Interest
        </summary>
        <div class="editor-content">
          <div class="map-container">
            <TheMap
              :isAdminPage="true"
              @marker-click="handleMarkerClick"
              @edit-poi="handleEditPOI"
            />
          </div>
          <div class="form-container">
            <div v-if="selectedPoiId === null" class="placeholder-text">
              <p>Click on a POI and select "Edit" to update.</p>
            </div>

            <UpdatePOIView v-else :poi-id="selectedPoiId" />
          </div>
        </div>
      </details>

      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right"></i>
          Add Affected Area
        </summary>
        <div class="editor-content">
          <div class="map-container">
            <TheMap :isAdminPage="true" @map-click="handleMapClick" />
          </div>
          <div class="form-container">
            <AddAffectedAreaView :longitude="selectedLng" :latitude="selectedLat" />
          </div>
        </div>
      </details>

      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right"></i>
          Update Affected Area
        </summary>
        <div class="editor-content">
          <div class="map-container">
            <TheMap :isAdminPage="true" @edit-affected-area="handleEditAffectedArea" />
          </div>
          <div class="form-container">
            <div v-if="!selectedAffectedAreaId" class="placeholder-text">
              <p>Click on an Affected Area and select "Edit" to update.</p>
            </div>

            <UpdateAffectedAreaView
              v-else
              :affected-area-id="selectedAffectedAreaId"
              @update:affectedAreaId="handleAffectedAreaUpdate"
            />
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PrivacyPolicyEditor from '@/components/privacy-policy/PrivacyPolicyEditor.vue'
import ManageGeneralInfo from '@/components/admin/ManageGeneralInfo.vue'
import AddPOIView from './AddPOIView.vue'
import UpdatePOIView from './UpdatePOIView.vue'
import AddAffectedAreaView from './AddAffectedAreaView.vue'
import UpdateAffectedAreaView from './UpdateAffectedAreaView.vue'
import TheMap from '@/components/map/TheMap.vue'

const email = ref('')
const tabs = ref([
  { label: 'Users', type: 'Users' },
  { label: 'Map', type: 'Map' },
  { label: 'Invite Admin', type: 'InviteAdmin' },
])
const value = ref('0')
const loading = ref(false)
const message = ref('')
const success = ref(false)

const selectedLng = ref('')
const selectedLat = ref('')
const selectedPoiId = ref<number | null>(null)
const selectedAffectedAreaId = ref<number | null>(null)

function handleInviteAdmin() {
  loading.value = true
  message.value = ''
  success.value = false

  setTimeout(() => {
    if (email.value) {
      message.value = 'Invite sent successfully!'
      success.value = true
    } else {
      message.value = 'Failed to send invite.'
      success.value = false
    }
    loading.value = false
  }, 1000)
}

function handleMapClick({ lng, lat }: { lng: number; lat: number }) {
  selectedLng.value = lng.toString()
  selectedLat.value = lat.toString()
}

function handleMarkerClick(poiId: number) {
  console.log(`Marker clicked with POI ID: ${poiId}`)
  selectedPoiId.value = poiId
}

function handleEditPOI(poiId: number) {
  console.log(`Edit POI event received for POI ID: ${poiId}`)
  selectedPoiId.value = poiId
}

function handlePoiUpdate(updatedPoiId: number) {
  console.log(`POI updated with ID: ${updatedPoiId}`)
  selectedPoiId.value = null
}

function handleEditAffectedArea(affectedAreaId: number) {
  console.log(`Edit Affected Area event received for ID: ${affectedAreaId}`)
  selectedAffectedAreaId.value = affectedAreaId
}

function handleAffectedAreaUpdate(updatedAffectedAreaId: number) {
  console.log(`Affected Area updated with ID: ${updatedAffectedAreaId}`)
  selectedAffectedAreaId.value = null
}
</script>

<style scoped>
/* Base styles */
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2d3748;
}

.header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a365d;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #718096;
}

/* Card styling */
.card {
  background: white;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Expandable menu */
.editor-menu {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin: 0;
}

.editor-menu-summary {
  list-style: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f7fafc;
  font-weight: 600;
  color: #2d3748;
}

.editor-menu-summary .fas {
  transition: transform 0.2s;
}

/* rotate icon when open */
.editor-menu[open] .editor-menu-summary .fas {
  transform: rotate(90deg);
}

/* hide default marker */
.editor-menu summary::-webkit-details-marker {
  display: none;
}

/* Add padding to the content inside the details */
.editor-menu > :not(summary) {
  padding: 1rem;
}

.editor-content {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.map-container {
  flex: 1;
  height: 400px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.form-container {
  flex: 1;
}

.placeholder-text {
  font-size: 1rem;
  color: #718096;
  text-align: center;
  margin-top: 2rem;
}
</style>
