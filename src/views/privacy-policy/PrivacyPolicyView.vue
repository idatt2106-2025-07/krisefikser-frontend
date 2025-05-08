<template>
  <div class="privacy-policy-container">
    <h1 class="page-title">Privacy Policy</h1>

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
        <h2 class="policy-title">Privacy Policy for Registered Users</h2>
        <div v-if="registeredPolicy" class="policy-content">
          <p v-html="formattedRegisteredPolicy"></p>
        </div>
        <div v-else class="no-policy">
          <p>No privacy policy for registered users is currently available.</p>
        </div>
      </section>

      <!-- Public Visitors Policy -->
      <section class="policy-section">
        <h2 class="policy-title">Privacy Policy for Public Visitors</h2>
        <div v-if="unregisteredPolicy" class="policy-content">
          <p v-html="formattedUnregisteredPolicy"></p>
        </div>
        <div v-else class="no-policy">
          <p>No privacy policy for public visitors is currently available.</p>
        </div>
      </section>
    </div>

    <!-- Last Updated section -->
    <div v-if="lastUpdated" class="last-updated">
      Last updated: {{ formattedLastUpdated }}
    </div>
  </div>
</template>

<script setup lang="ts">
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
    day: 'numeric'
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
      axios.get<UnregisteredPolicyResponse>('/api/privacy-policy/unregistered')
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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a365d;
  margin-bottom: 2rem;
  text-align: center;
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
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3182ce;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error styles */
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

/* Policy section styles */
.policies-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.policy-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  border: 1px solid #e2e8f0;
}

.policy-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2b6cb0;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.policy-content {
  font-size: 1rem;
  line-height: 1.7;
  color: #4a5568;
}

.no-policy {
  font-style: italic;
  color: #718096;
  padding: 1rem;
  background-color: #f7fafc;
  border-radius: 4px;
}

/* Last updated section */
.last-updated {
  margin-top: 2rem;
  text-align: right;
  font-size: 0.9rem;
  color: #718096;
  font-style: italic;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .privacy-policy-container {
    padding: 1.5rem 1rem;
  }

  .policy-section {
    padding: 1.5rem;
  }

  .policy-title {
    font-size: 1.25rem;
  }
}
</style>
