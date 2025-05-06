<template>
  <div class="verify-email">
    <h1 class="verify-email__title">Email Verification</h1>

    <div v-if="loading" class="verify-email__loading">Verifying your email…</div>

    <div v-else>
      <p :class="['verify-email__message', success ? 'success' : 'error']">
        {{ message }}
      </p>

      <div class="verify-email__actions">
        <a v-if="success" @click.prevent="router.push('/login')" class="verify-email__link">
          Go to login
        </a>
        <button v-else @click="handleResend" :disabled="resendLoading" class="verify-email__retry">
          {{ resendLoading ? 'Resending…' : 'Request new verification email' }}
        </button>
      </div>

      <p
        v-if="resendMessage"
        :class="['verify-email__message', resendMessage.startsWith('Failed') ? 'error' : 'success']"
      >
        {{ resendMessage }}
      </p>
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
.verify-email {
  max-width: 28rem; /* ~max-w-md */
  margin: 0 auto; /* mx-auto */
  padding: 1.5rem; /* p-6 */
}

.verify-email__title {
  font-size: 1.5rem; /* text-2xl */
  font-weight: 600; /* font-semibold */
  margin-bottom: 1rem; /* mb-4 */
}

.verify-email__loading {
  color: #6b7280; /* text-gray-500 */
}

.verify-email__message {
  margin-bottom: 1rem; /* mb-4 */
}

.verify-email__message.success {
  color: #16a34a; /* text-green-600 */
}

.verify-email__message.error {
  color: #dc2626; /* text-red-600 */
}

.verify-email__link {
  color: #2563eb; /* text-blue-600 */
  cursor: pointer;
  text-decoration: none;
}

.verify-email__link:hover {
  text-decoration: underline;
}

.verify-email__actions {
  margin-bottom: 1rem;
}

.verify-email__retry {
  background-color: #2563eb;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.verify-email__retry:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.verify-email__retry:hover:not(:disabled) {
  background-color: #1e40af;
}
</style>
