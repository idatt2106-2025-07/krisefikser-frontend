<template>
  <div class="twofa-container">
    <div class="twofa-card">
      <div class="twofa-header">
        <h1 class="twofa-title">Two-Factor Authentication</h1>
      </div>

      <div class="twofa-content">
        <div v-if="loading" class="twofa-loading">
          <div class="spinner"></div>
          <p>Verifying your token...</p>
        </div>

        <div v-else-if="error" class="twofa-error">
          <div class="error-icon">!</div>
          <p>{{ error }}</p>
          <button @click="tryAgain" class="twofa-button">Try Again</button>
        </div>

        <div v-else class="twofa-success">
          <div class="success-icon">✓</div>
          <p>Authentication successful!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref<string | null>(null)
const success = ref(false)

async function verifyToken() {
  loading.value = true
  error.value = null

  const token = route.query.token as string

  if (!token) {
    error.value = 'Authentication token is missing. Please try again.'
    loading.value = false
    return
  }

  try {
    await axios.post('/api/admin/2fa', { token })
    success.value = true
    loading.value = false

    // Redirect after successful authentication with a slight delay for better UX
    setTimeout(() => {
      router.push({ name: 'admin' })
    }, 1000)
  } catch (err: any) {
    error.value =
      err.response?.data?.message || 'Verification failed. Please check your token and try again.'
    loading.value = false
  }
}

function tryAgain() {
  // Clear the error and restart verification process
  const currentUrl = new URL(window.location.href)
  currentUrl.searchParams.delete('token')
  window.location.href = currentUrl.toString()
}

onMounted(verifyToken)
</script>

<style scoped>
.twofa-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 1rem;
}

.twofa-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.05),
    0 5px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.twofa-header {
  padding: 1.5rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.twofa-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
}

.twofa-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 150px;
}

.twofa-loading,
.twofa-error,
.twofa-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ef4444;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #10b981;
  color: white;
  font-size: 1.5rem;
}

.twofa-button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.twofa-button:hover {
  background-color: #2563eb;
}
</style>
