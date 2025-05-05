<template>
  <div class="verify-email max-w-md mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">Email Verification</h1>

    <div v-if="loading" class="text-gray-500">Verifying your email…</div>

    <div v-else>
      <p :class="success ? 'text-green-600' : 'text-red-600'" class="mb-4">
        {{ message }}
      </p>
      <router-link
        to="/login"
        class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go to Login
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { useRoute } from 'vue-router'

interface AuthResponse {
  message: string
}

const route = useRoute()
const token = route.query.token as string | undefined

const loading = ref(true)
const success = ref(false)
const message = ref('')

onMounted(async () => {
  if (!token) {
    message.value = 'Verification token is missing.'
    loading.value = false
    return
  }

  try {
    const resp: AxiosResponse<AuthResponse> = await axios.get(
      '/api/auth/verify-email',
      { params: { token } }
    )

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
</script>

<style scoped>
.verify-email {
  /* optional styling */
}
</style>
