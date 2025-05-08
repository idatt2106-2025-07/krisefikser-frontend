<template>
  <!-- Tabs moved into the editor -->
  <div class="tabs">
    <button
      :class="['tab-button', { active: activeTab === 'registered' }]"
      @click="activeTab = 'registered'"
    >
      <i class="fas fa-user-shield"></i> Registered Users
    </button>
    <button
      :class="['tab-button', { active: activeTab === 'unregistered' }]"
      @click="activeTab = 'unregistered'"
    >
      <i class="fas fa-globe"></i> Public Visitors
    </button>
  </div>

  <!-- Loading indicator -->
  <div v-if="loading" class="loading-container">
    <div class="loading-spinner"></div>
    <p>Loading policy...</p>
  </div>

  <!-- Error display -->
  <div v-else-if="error" class="error-message">
    <div class="error-content">
      <i class="fas fa-exclamation-circle"></i>
      <div>
        <h3>Error Loading Policy</h3>
        <p>{{ error }}</p>
      </div>
    </div>
    <button @click="fetchPolicy" class="retry-button">
      <i class="fas fa-sync-alt"></i> Try Again
    </button>
  </div>

  <!-- Editor section -->
  <div v-else class="editor-section">
    <div class="editor-header">
      <h2 class="section-title">
        {{ activeTab === 'registered' ? 'Registered Users Policy' : 'Public Policy' }}
      </h2>
      <div class="character-count">{{ policyContent.length }} characters</div>
    </div>

    <div class="editor-wrapper">
      <textarea
        v-model="policyContent"
        class="policy-editor"
        :placeholder="
          activeTab === 'registered'
            ? 'Enter policy for registered users...'
            : 'Enter policy for public visitors...'
        "
        rows="20"
      ></textarea>
    </div>

    <div class="form-actions">
      <button
        @click="fetchPolicy"
        class="cancel-button"
        :disabled="saving || policyContent === originalContent"
      >
        <i class="fas fa-times"></i> Discard Changes
      </button>
      <button
        @click="savePolicy"
        class="save-button"
        :disabled="saving || policyContent === originalContent"
      >
        <i class="fas fa-save"></i>
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>
  </div>

  <!-- Toast notifications -->
  <transition name="fade">
    <div v-if="notification" class="notification" :class="notification.type">
      <i
        class="icon"
        :class="
          notification.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'
        "
      ></i>
      {{ notification.message }}
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps<{
  policyType: 'registered' | 'unregistered'
}>()

// local tab state
const activeTab = ref<'registered' | 'unregistered'>('registered')

const policyContent = ref('')
const originalContent = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const notification = ref<{ message: string; type: 'success' | 'error' } | null>(null)

async function fetchPolicy() {
  loading.value = true
  error.value = null
  try {
    const { data } = await axios.get(`/api/privacy-policy/${activeTab.value}`)
    policyContent.value =
      activeTab.value === 'registered' ? data.registered || '' : data.unregistered || ''
    originalContent.value = policyContent.value
  } catch (err: any) {
    error.value = err.response?.data?.message || `Failed to fetch ${activeTab.value} policy`
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function savePolicy() {
  saving.value = true
  error.value = null
  try {
    const payload =
      activeTab.value === 'registered'
        ? { registered: policyContent.value }
        : { unregistered: policyContent.value }
    await axios.post(`/api/privacy-policy/${activeTab.value}`, payload, {
      headers: { 'Content-Type': 'application/json' },
    })
    originalContent.value = policyContent.value
    showNotification(
      `${activeTab.value.charAt(0).toUpperCase() + activeTab.value.slice(1)} policy updated`,
      'success',
    )
  } catch (err: any) {
    const msg = err.response?.data?.message || `Failed to update ${activeTab.value} privacy policy`
    showNotification(msg, 'error')
    console.error(err)
  } finally {
    saving.value = false
  }
}

function showNotification(message: string, type: 'success' | 'error') {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 5000)
}

watch(activeTab, fetchPolicy)
onMounted(fetchPolicy)
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
}

/* Tabs styling */
.tabs {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

.tab-button:hover {
  color: #3182ce;
  background-color: #ebf8ff;
}

.tab-button.active {
  border-bottom: 3px solid #3182ce;
  color: #3182ce;
  font-weight: 600;
}

.tab-button i {
  font-size: 0.9rem;
}

/* Loading indicator */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  min-height: 300px;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3182ce;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Error message */
.error-message {
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.error-content {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.error-content i {
  color: #e53e3e;
  font-size: 1.5rem;
  margin-top: 0.2rem;
}

.error-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e53e3e;
  margin-bottom: 0.5rem;
}

.error-content p {
  color: #718096;
}

.retry-button {
  background-color: #e53e3e;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-button:hover {
  background-color: #c53030;
}

.retry-button i {
  font-size: 0.9rem;
}

/* Editor section */
.editor-section {
  margin-top: 1rem;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2d3748;
}

.character-count {
  font-size: 0.875rem;
  color: #718096;
}

.editor-wrapper {
  margin-bottom: 1.5rem;
}

.policy-editor {
  width: 100%;
  padding: 1.25rem;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: vertical;
  transition: border-color 0.2s;
  background-color: #f8fafc;
}

.policy-editor:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
}

/* Form actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.save-button {
  background-color: #3182ce;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.save-button:hover:not(:disabled) {
  background-color: #2b6cb0;
}

.save-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
  opacity: 0.7;
}

.cancel-button {
  background-color: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-button:hover:not(:disabled) {
  background-color: #f7fafc;
  border-color: #cbd5e0;
}

.cancel-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Notification toast */
.notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  z-index: 100;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slide-in 0.3s ease-out;
}

.notification.success {
  background-color: #f0fff4;
  color: #276749;
  border: 1px solid #c6f6d5;
}

.notification.error {
  background-color: #fff5f5;
  color: #c53030;
  border: 1px solid #fed7d7;
}

.notification .icon {
  font-size: 1.2rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

@keyframes slide-in {
  from {
    transform: translateY(1rem);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }

  .card {
    padding: 1.5rem;
  }

  .tabs {
    flex-direction: column;
  }

  .tab-button {
    justify-content: center;
    margin-right: 0;
    margin-bottom: 0.5rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .notification {
    width: calc(100% - 2rem);
    right: 1rem;
    bottom: 1rem;
  }
}
</style>
