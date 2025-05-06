<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import Password from 'primevue/password'
import Button from 'primevue/button'

const router = useRouter()
const route = useRoute()

const newPassword = ref('')
const confirmPassword = ref('')
const newPasswordError = ref<string|null>(null)
const confirmError = ref<string|null>(null)
const isLoading = ref(false)
const message = ref<string|null>(null)
const messageType = ref<'success'|'error'|null>(null)

// token from query param
const token = (route.query.token as string) || ''

const passwordPatternValid = computed(() =>
  /(?=.*[A-Z])(?=.*\d).+/.test(newPassword.value)
)
const passwordsMatch = computed(() =>
  newPassword.value === confirmPassword.value
)
const formValid = computed(() =>
  newPassword.value &&
  confirmPassword.value &&
  passwordPatternValid.value &&
  passwordsMatch.value
)

function validateNewPassword() {
  newPasswordError.value = passwordPatternValid.value
    ? null
    : 'Password must contain an uppercase letter and a number'
}

function validateConfirm() {
  confirmError.value = passwordsMatch.value
    ? null
    : 'Passwords do not match'
}

async function handleSubmit() {
  validateNewPassword()
  validateConfirm()
  if (!formValid.value) return

  isLoading.value = true
  message.value = null

  try {
    await axios.post(
      '/api/auth/reset-password',
      { token, newPassword: newPassword.value },
      { withCredentials: true }
    )
    messageType.value = 'success'
    message.value = 'Password reset successfully. Redirecting to login…'
    setTimeout(() => router.push('/login'), 2000)
  } catch (err) {
    messageType.value = 'error'
    message.value = axios.isAxiosError(err) && err.response?.data?.message
      ? err.response.data.message
      : 'Failed to reset password.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="reset-page">
    <form class="reset-form" @submit.prevent="handleSubmit">
      <h2>Set New Password</h2>

      <div class="field">
        <label for="new-password">New Password</label>
        <Password
          id="new-password"
          v-model="newPassword"
          :feedback="false"
          toggleMask
          @blur="validateNewPassword"
          :class="{ 'p-invalid': newPasswordError }"
        />
        <small v-if="newPasswordError" class="p-error">{{ newPasswordError }}</small>
      </div>

      <div class="field">
        <label for="confirm-password">Confirm Password</label>
        <Password
          id="confirm-password"
          v-model="confirmPassword"
          :feedback="false"
          toggleMask
          @blur="validateConfirm"
          :class="{ 'p-invalid': confirmError }"
        />
        <small v-if="confirmError" class="p-error">{{ confirmError }}</small>
      </div>

      <Button
        type="submit"
        label="Reset Password"
        :loading="isLoading"
        :disabled="!formValid"
        class="submit-btn"
      />

      <div v-if="message" :class="['message', messageType==='error'?'error':'success']">
        {{ message }}
      </div>
    </form>
  </div>
</template>

<style scoped>
.reset-page {
  max-width: 400px;
  margin: 3rem auto;
  padding: 2rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.reset-form .field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}
.reset-form label {
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.submit-btn {
  width: 100%;
  margin-top: 1rem;
}
.message {
  margin-top: 1rem;
  text-align: center;
}
.error {
  color: #e74c3c;
}
.success {
  color: #28a745;
}
</style>
