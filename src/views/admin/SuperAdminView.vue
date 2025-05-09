<template>
  <div class="admin-dashboard">
    <div class="card">
      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right arrow-icon"></i>
          <i class="fas fa-user-cog"></i>
          Admin Management
        </summary>
        <AdminManagement />
      </details>

      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right arrow-icon"></i>
          <i class="fas fa-file-alt"></i>
          Privacy Policy Editor
        </summary>
        <PrivacyPolicyEditor policyType="registered" />
      </details>

      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right arrow-icon"></i>
          <i class="fas fa-info-circle"></i>
          General Information Management
        </summary>
        <ManageGeneralInfo />
      </details>

      <!-- Add Point of Interest -->
      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right arrow-icon"></i>
          <i class="fas fa-map-marker-alt"></i>
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

      <!-- Update Point of Interest -->
      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right arrow-icon"></i>
          <i class="fas fa-edit"></i>
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

      <!-- Add Affected Area -->
      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right arrow-icon"></i>
          <i class="fas fa-exclamation-triangle"></i>
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

      <!-- Update Affected Area -->
      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right arrow-icon"></i>
          <i class="fas fa-pencil-alt"></i>
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
import AdminManagement from '@/components/admin/AdminManager.vue'
import PrivacyPolicyEditor from '@/components/privacy-policy/PrivacyPolicyEditor.vue'
import ManageGeneralInfo from '@/components/admin/ManageGeneralInfo.vue'
import AddPOIView from './AddPOIView.vue'
import UpdatePOIView from './UpdatePOIView.vue'
import AddAffectedAreaView from './AddAffectedAreaView.vue'
import UpdateAffectedAreaView from './UpdateAffectedAreaView.vue'
import TheMap from '@/components/map/TheMap.vue'

const selectedLng = ref('')
const selectedLat = ref('')
const selectedPoiId = ref<number | null>(null)
const selectedAffectedAreaId = ref<number | null>(null)

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
/* Card layout */
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}
.card {
  background: white;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
}

/* Expandable menu */
.editor-menu {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.5rem;
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
/* hide default marker */
.editor-menu summary::-webkit-details-marker {
  display: none;
}

/* arrow icon transition */
.editor-menu-summary .arrow-icon {
  transition: transform 0.2s;
}
.editor-menu[open] .editor-menu-summary .arrow-icon {
  transform: rotate(90deg);
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
