<template>
  <div class="admin-dashboard">
    <div class="card">
      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-user-cog"></i>
          Admin Management
        </summary>
        <AdminManagement />
      </details>

      <details class="editor-menu">
        <summary class="editor-menu-summary">
          <i class="fas fa-file-alt"></i>
          Privacy Policy Editor
        </summary>
        <PrivacyPolicyEditor policyType="registered" />
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminManagement from '@/components/admin/AdminManager.vue'
import PrivacyPolicyEditor from '@/components/privacy-policy/PrivacyPolicyEditor.vue'
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
/* rotate icon when open */
.editor-menu[open] .editor-menu-summary .fas {
  transform: rotate(90deg);
}
/* hide default marker */
.editor-menu summary::-webkit-details-marker {
  display: none;
}
</style>
