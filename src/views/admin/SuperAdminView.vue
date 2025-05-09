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

      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right arrow-icon"></i>
          <i class="fas fa-map-marker-alt"></i>
          Add Point of Interest
        </summary>
        <AddPOIView />
      </details>

      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right arrow-icon"></i>
          <i class="fas fa-edit"></i>
          Update Point of Interest
        </summary>
        <UpdatePOIView />
      </details>

      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right arrow-icon"></i>
          <i class="fas fa-exclamation-triangle"></i>
          Add Affected Area
        </summary>
        <AddAffectedAreaView />
      </details>

      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-chevron-right arrow-icon"></i>
          <i class="fas fa-pencil-alt"></i>
          Update Affected Area
        </summary>
        <UpdateAffectedAreaView />
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminManagement from '@/components/admin/AdminManager.vue'
import PrivacyPolicyEditor from '@/components/privacy-policy/PrivacyPolicyEditor.vue'
import ManageGeneralInfo from '@/components/admin/ManageGeneralInfo.vue'
import AddPOIView from './AddPOIView.vue'
import UpdatePOIView from './UpdatePOIView.vue'
import AddAffectedAreaView from './AddAffectedAreaView.vue'
import UpdateAffectedAreaView from './UpdateAffectedAreaView.vue'
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
</style>
