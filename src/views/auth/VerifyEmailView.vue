<template>
  <div class="verify-container">
    <div class="verify-card">
      <div class="verify-header">
        <h1 class="verify-title">Email Verification</h1>
      </div>

      <div class="verify-content">
        <div v-if="loading" class="verify-loading">
          <div class="spinner"></div>
          <p>Verifying your email...</p>
        </div>

        <div v-else class="verify-result">
          <div v-if="success" class="verify-success">
            <div class="success-icon">✓</div>
            <p>{{ message }}</p>
            <button @click="router.push('/login')" class="verify-button">Go to Login</button>
          </div>

          <div v-else class="verify-error">
            <div class="error-icon">!</div>
            <p>{{ message }}</p>
            <button @click="handleResend" :disabled="resendLoading" class="verify-button">
              {{ resendLoading ? 'Sending...' : 'Resend Verification' }}
            </button>
          </div>

          <p
            v-if="resendMessage"
            :class="['resend-message', resendMessage.startsWith('Failed') ? 'error' : 'success']"
          >
            {{ resendMessage }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { useRoute, useRouter } from 'vue-router'

interface AuthResponse {
  message: string
}

const route = useRoute()
const router = useRouter()
const token = route.query.token as string | undefined

const loading = ref(true)
const success = ref(false)
const message = ref('')
const resendLoading = ref(false)
const resendMessage = ref<string | null>(null)

onMounted(async () => {
  if (!token) {
    message.value = 'Verification token is missing.'
    loading.value = false
    return
  }

  try {
    const resp: AxiosResponse<AuthResponse> = await axios.get('/api/auth/verify-email', {
      params: { token },
    })
    success.value = resp.status === 200
    message.value = resp.data.message ?? 'Your email has been verified!'
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data) {
      message.value = (err.response.data as AuthResponse).message
    } else {
      message.value = 'Network error—please try again later.'
    }
    success.value = false
  } finally {
    loading.value = false
  }
})

async function handleResend() {
  resendLoading.value = true
  resendMessage.value = null
  try {
    await axios.post('/api/auth/resend-verification-email', { token }, { withCredentials: true })
    resendMessage.value = 'Verification email resent. Check your inbox.'
  } catch {
    resendMessage.value = 'Failed to resend verification email.'
  } finally {
    resendLoading.value = false
  }
}
</script>

<style scoped>
.verify-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 1rem;
}

.verify-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.05),
    0 5px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.verify-header {
  padding: 1.5rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.verify-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
}

.verify-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.verify-loading,
.verify-success,
.verify-error {
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

.verify-button {
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

.verify-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.verify-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.resend-message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  width: 100%;
  text-align: center;
}

.resend-message.success {
  background-color: #ecfdf5;
  color: #10b981;
}

.resend-message.error {
  background-color: #fef2f2;
  color: #ef4444;
}

.verify-result {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
</style>
