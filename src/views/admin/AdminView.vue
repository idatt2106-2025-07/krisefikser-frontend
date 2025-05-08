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
    </div>
  </div>
</template>

<script setup lang="ts">
import PrivacyPolicyEditor from '@/components/privacy-policy/PrivacyPolicyEditor.vue'
import ManageGeneralInfo from '@/components/admin/ManageGeneralInfo.vue'
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
</style>
