<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form states
const email = ref('')
const password = ref('')
const emailError = ref(false)
const touched = ref(false)
const loginError = ref<string | null>(null)
const loginSuccess = ref<string | null>(null)

// Reset password state
const isResetMode = ref(false)
const resetEmail = ref('')
const resetEmailError = ref(false)
const resetTouched = ref(false)
const isResetLoading = ref(false)
const resetSuccess = ref<string | null>(null)
const resetError = ref<string | null>(null)

// Admin login state
const isAdminMode = ref(false)
const adminEmail = ref('')
const adminPassword = ref('')
const adminEmailError: Ref<boolean> = ref(false)
const adminTouched = ref(false)
const adminError = ref<string | null>(null)

// Validation functions
function validateEmail(value: string, errorRef: Ref<boolean> | boolean) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (typeof errorRef === 'boolean') {
    return !emailRegex.test(value)
  } else {
    errorRef.value = !emailRegex.test(value)
  }
}
function validateResetEmail() {
  resetTouched.value = true
  validateEmail(resetEmail.value, resetEmailError)
  resetError.value = resetEmailError.value ? 'Invalid email address' : null
}

// Computed properties
const formValid = computed(() => email.value && password.value && !emailError.value)
const resetValid = computed(() => !!resetEmail.value && !resetEmailError.value)
const adminValid = computed(
  () => !!adminEmail.value && !!adminPassword.value && !adminEmailError.value,
)

// Form handlers
async function handleLogin() {
  loginError.value = null
  loginSuccess.value = null
  touched.value = true
  validateEmail(email.value, emailError)
  if (!formValid.value) return

  try {
    const respone = await axios.post(
      '/api/auth/login',
      { email: email.value, password: password.value },
      { withCredentials: true },
    )
    if (respone.status === 200 && respone.data?.message === 'Two-factor authentication code sent') {
      loginSuccess.value = 'Valid credentials, redirecting...'
      router.push('/admin/2fa-notify')
    } else {
      await authStore.fetchUser()
      loginSuccess.value = 'Login successful, redirecting...'
      setTimeout(() => router.push('/'), 1500)
    }
  } catch (error) {
    handleLoginError(error)
  }
}

async function handleReset() {
  resetTouched.value = true
  validateResetEmail()
  if (!resetValid.value) return

  isResetLoading.value = true
  resetSuccess.value = null
  resetError.value = null

  try {
    const response = await axios.post(
      '/api/auth/new-password-link',
      { email: resetEmail.value },
      { withCredentials: true },
    )
    resetSuccess.value = response.data?.message || 'Password reset link sent. Check your email.'
  } catch (err) {
    resetError.value = getErrorMessage(err, 'Failed to send reset link.')
  } finally {
    isResetLoading.value = false
  }
}

async function handleAdminLogin() {
  adminTouched.value = true
  validateEmail(adminEmail.value, adminEmailError)
  if (!adminValid.value) return

  adminError.value = null
  try {
    await axios.post(
      '/api/auth/login',
      { email: adminEmail.value, password: adminPassword.value },
      { withCredentials: true },
    )
    router.push('/admin/2fa-notify')
  } catch (err) {
    adminError.value = getErrorMessage(err, 'Failed to send 2FA link.')
  }
}

// Helper functions
function handleLoginError(error: unknown) {
  console.error('Error during login:', error)
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const msg = error.response?.data?.message
    loginError.value = status === 401 && msg ? msg : 'Login failed. Please check your credentials.'
  } else {
    loginError.value = 'Login failed. Please try again.'
  }
  setTimeout(() => (loginError.value = null), 3000)
}

function getErrorMessage(error: unknown, defaultMsg: string): string {
  return axios.isAxiosError(error) && error.response?.data?.message
    ? error.response.data.message
    : defaultMsg
}
</script>

<template>
  <div class="auth-container">
    <div v-if="loginError" class="notification error">
      {{ loginError }}
    </div>
    <div v-if="loginSuccess" class="notification success">
      {{ loginSuccess }}
    </div>

    <!-- Password Reset Form -->
    <div v-else-if="isResetMode" class="auth-card">
      <h2 class="auth-title">Reset Password</h2>

      <form @submit.prevent="handleReset" class="auth-form">
        <div class="form-group">
          <label for="reset-email">Email</label>
          <InputText
            id="reset-email"
            v-model="resetEmail"
            placeholder="your@email.com"
            @blur="validateResetEmail"
            :class="{ 'input-error': resetEmailError }"
          />
          <small v-if="resetError" class="error-message">{{ resetError }}</small>
          <small v-else-if="resetSuccess" class="success-message">
            {{ resetSuccess }}
          </small>
        </div>

        <button type="submit" :disabled="!resetValid || isResetLoading" class="auth-button">
          {{ isResetLoading ? 'Sending...' : 'Reset Password' }}
        </button>

        <button type="button" @click="isResetMode = false" class="auth-button secondary">
          Cancel
        </button>
      </form>
    </div>

    <!-- Regular User Login Form -->
    <div v-else class="auth-card">
      <h2 class="auth-title">Login</h2>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="email"
            placeholder="your@email.com"
            @blur="validateEmail(email, emailError)"
            :class="{ 'input-error': emailError }"
          />
          <small v-if="emailError" class="error-message">Invalid email format</small>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <Password
            inputId="password"
            v-model="password"
            toggleMask
            :feedback="false"
            placeholder="Your password"
            :class="{ 'input-error': touched && !password }"
            @blur="touched = true"
          />
          <small v-if="touched && !password" class="error-message"> Password is required </small>
        </div>

        <button type="submit" :disabled="!formValid" class="auth-button">Login</button>

        <div class="auth-footer">
          <p>
            Don't have an account?
            <router-link to="/register" class="auth-link">Register</router-link>
          </p>
          <a href="#" @click.prevent="isResetMode = true" class="auth-link"> Forgot password? </a>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.auth-card {
  width: 100%;
  max-width: 28rem;
  padding: 2.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  text-align: center;
  margin-bottom: 1.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
}

:deep(.p-inputtext),
:deep(.p-password-input) {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

:deep(.p-inputtext:focus),
:deep(.p-password-input:focus) {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.input-error:deep(.p-inputtext),
.input-error:deep(.p-password-input) {
  border-color: #e53e3e;
  background-color: #fff5f5;
}

.auth-button {
  padding: 0.75rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.auth-button:hover:not(:disabled) {
  background-color: #3182ce;
  transform: translateY(-1px);
}

.auth-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
  opacity: 0.7;
}

.auth-button.secondary {
  background-color: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.auth-button.secondary:hover:not(:disabled) {
  background-color: #f7fafc;
  transform: translateY(-1px);
}

.auth-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.auth-link {
  color: #4299e1;
  text-decoration: none;
  transition: color 0.2s ease;
}

.auth-link:hover {
  color: #3182ce;
  text-decoration: underline;
}

.auth-link.admin {
  color: #805ad5;
}

.auth-link.admin:hover {
  color: #6b46c1;
}

.notification {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translate(-50%, 1rem);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@media (max-width: 480px) {
  .auth-container {
    padding: 1rem;
  }

  .auth-card {
    padding: 1.5rem;
  }
}

/* Add this new style for error messages */
.error-message {
  color: #e53e3e;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* You might also want to add a style for success messages */
.success-message {
  color: #38a169;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
</style>
