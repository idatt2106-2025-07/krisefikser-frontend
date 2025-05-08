<template>
  <div class="privacy-policy-container">
    <div class="policy-header">
      <h1 class="page-title">Privacy Policy</h1>
      <div class="header-decoration"></div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading privacy policies...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <div class="error-content">
        <i class="fas fa-exclamation-circle"></i>
        <div>
          <h3>Error Loading Privacy Policy</h3>
          <p>{{ error }}</p>
        </div>
      </div>
      <button @click="fetchPolicies" class="retry-button">
        <i class="fas fa-sync-alt"></i> Try Again
      </button>
    </div>

    <div v-else class="policies-container">
      <!-- Registered Users Policy -->
      <section class="policy-section">
        <div class="policy-header-card">
          <h2 class="policy-title">
            <i class="fas fa-user-shield policy-icon"></i>
            Privacy Policy for Registered Users
          </h2>
        </div>
        <div class="policy-card">
          <div v-if="registeredPolicy" class="policy-content">
            <p v-html="formattedRegisteredPolicy"></p>
          </div>
          <div v-else class="no-policy">
            <i class="fas fa-info-circle"></i>
            <p>No privacy policy for registered users is currently available.</p>
          </div>
        </div>
      </section>

      <!-- Public Visitors Policy -->
      <section class="policy-section">
        <div class="policy-header-card">
          <h2 class="policy-title">
            <i class="fas fa-users policy-icon"></i>
            Privacy Policy for Public Visitors
          </h2>
        </div>
        <div class="policy-card">
          <div v-if="unregisteredPolicy" class="policy-content">
            <p v-html="formattedUnregisteredPolicy"></p>
          </div>
          <div v-else class="no-policy">
            <i class="fas fa-info-circle"></i>
            <p>No privacy policy for public visitors is currently available.</p>
          </div>
        </div>
      </section>
    </div>

    <!-- Last Updated section -->
    <div v-if="lastUpdated" class="last-updated">
      <i class="fas fa-clock"></i> Last updated: {{ formattedLastUpdated }}
    </div>
  </div>
</template>

<script setup lang="ts">
// Script remains the same as before
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

interface RegisteredPolicyResponse {
  registered: string
}

interface UnregisteredPolicyResponse {
  unregistered: string
}

// State
const registeredPolicy = ref('')
const unregisteredPolicy = ref('')
const lastUpdated = ref<string | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Format policy text with line breaks for HTML display
const formattedRegisteredPolicy = computed(() => {
  return registeredPolicy.value.replace(/\n/g, '<br>')
})

const formattedUnregisteredPolicy = computed(() => {
  return unregisteredPolicy.value.replace(/\n/g, '<br>')
})

// Format date for display
const formattedLastUpdated = computed(() => {
  if (!lastUpdated.value) return ''

  const date = new Date(lastUpdated.value)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

// Fetch both privacy policies
async function fetchPolicies() {
  loading.value = true
  error.value = null

  try {
    // Fetch both policies in parallel
    const [registeredResponse, unregisteredResponse] = await Promise.all([
      axios.get<RegisteredPolicyResponse>('/api/privacy-policy/registered'),
      axios.get<UnregisteredPolicyResponse>('/api/privacy-policy/unregistered'),
    ])

    // Set the policy content based on the response structure
    registeredPolicy.value = registeredResponse.data.registered || ''
    unregisteredPolicy.value = unregisteredResponse.data.unregistered || ''

    loading.value = false
  } catch (err: any) {
    loading.value = false
    error.value = err.response?.data?.message || err.message || 'Failed to load privacy policies'
    console.error('Error fetching privacy policies:', err)
  }
}

// Load policies when component mounts
onMounted(fetchPolicies)
</script>

<style scoped>
.privacy-policy-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  color: #2d3748;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    sans-serif;
  line-height: 1.6;
}

.policy-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  background: black;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}

/* Loading styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  min-height: 200px;
}

.loading-spinner {
  border: 4px solid rgba(79, 70, 229, 0.1);
  border-radius: 50%;
  border-top: 4px solid #18daff80;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: #6b7280;
  font-size: 1.1rem;
}

/* Error styles */
.error-message {
  background-color: #fef2f2;
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.error-content {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.error-content i {
  color: #ef4444;
  font-size: 1.75rem;
}

.error-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.error-content p {
  color: #6b7280;
  margin: 0;
}

.retry-button {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.retry-button:hover {
  background-color: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Policy section styles */
.policies-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.policy-section {
  background-color: white;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.policy-header-card {
  background: #18daff80;
  padding: 0.5rem 2rem;
  color: white;
}

.policy-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
}

.policy-icon {
  font-size: 1.25rem;
}

.policy-card {
  padding: 2rem;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 12px 12px;
}

.policy-content {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #4b5563;
}

.policy-content p {
  margin-bottom: 1.5rem;
}

.policy-content p:last-child {
  margin-bottom: 0;
}

.no-policy {
  font-style: italic;
  color: #6b7280;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px dashed #e5e7eb;
}

.no-policy i {
  color: #9ca3af;
  font-size: 1.25rem;
}

.no-policy p {
  margin: 0;
}

/* Last updated section */
.last-updated {
  margin-top: 3rem;
  text-align: right;
  font-size: 0.95rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.last-updated i {
  color: #9ca3af;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .privacy-policy-container {
    padding: 1.25rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .policy-header-card,
  .policy-card {
    padding: 1.25rem;
  }

  .policy-title {
    font-size: 1.25rem;
  }

  .policy-content {
    font-size: 1rem;
  }
}

/* Animation for policy cards */
.policy-section {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.policy-section:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.05),
    0 4px 6px -2px rgba(0, 0, 0, 0.02);
}
</style>
