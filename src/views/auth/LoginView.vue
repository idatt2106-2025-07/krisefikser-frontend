<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const emailError = ref(false)
const touched = ref(false)
const router = useRouter()
const authStore = useAuthStore()

// notification for login errors or success
const loginError = ref<string | null>(null)
const loginSuccess = ref<string | null>(null)

// --- reset password state ---
const isResetMode = ref(false)
const resetEmail = ref('')
const resetEmailError = ref(false)
const resetTouched = ref(false)
const isResetLoading = ref(false)
const resetSuccess = ref<string | null>(null)
const resetError = ref<string | null>(null)

function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailError.value = !emailRegex.test(email.value)
}

function validateResetEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  resetTouched.value = true
  resetEmailError.value = !emailRegex.test(resetEmail.value)
  resetError.value = resetEmailError.value ? 'Invalid email address' : null
}

const formValid = computed(() => email.value && password.value && !emailError.value)
const resetValid = computed(() => !!resetEmail.value && !resetEmailError.value)

async function handleLogin() {
  loginError.value = null
  loginSuccess.value = null
  touched.value = true
  validateEmail()
  if (!formValid.value) return

  try {
    await axios.post(
      '/api/auth/login',
      { email: email.value, password: password.value },
      { withCredentials: true },
    )
    await authStore.fetchUser()
    // show success toast then redirect
    loginSuccess.value = 'Login successful, redirecting...'
    setTimeout(() => router.push('/'), 1500)
  } catch (error) {
    console.error('Error during login:', error)
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const msg = (error.response?.data as any)?.message
      if (status === 401 && msg) {
        loginError.value = msg
      } else {
        loginError.value = 'Login failed. Please check your credentials and try again.'
      }
    } else {
      loginError.value = 'Login failed. Please check your credentials and try again.'
    }
    // auto-hide after 3s
    setTimeout(() => (loginError.value = null), 3000)
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
    // the backend returns a message string on success
    resetSuccess.value =
      typeof response.data === 'string'
        ? response.data
        : 'Password reset link sent. Check your email.'
  } catch (err) {
    resetError.value =
      axios.isAxiosError(err) && err.response?.data
        ? (err.response.data as string)
        : 'Failed to send reset link.'
  } finally {
    isResetLoading.value = false
  }
}
</script>

<template>
  <div class="page-wrapper">
    <!-- toast notification -->
    <div v-if="loginError" class="toast error">
      {{ loginError }}
    </div>
    <div v-if="loginSuccess" class="toast success">
      {{ loginSuccess }}
    </div>

    <!-- login form -->
    <form v-if="!isResetMode" class="login-form" @submit.prevent="handleLogin">
      <h2>Login</h2>
      <div class="field">
        <label for="email">Email</label>
        <InputText
          id="email"
          v-model="email"
          placeholder="Email"
          @blur="validateEmail"
          :class="{ 'p-invalid': emailError }"
        />
        <small v-if="emailError" class="p-error">Email invalid</small>
      </div>
      <div class="field">
        <label for="password">Password</label>
        <Password
          inputId="password"
          v-model="password"
          toggleMask
          :feedback="false"
          placeholder="Password"
          :invalid="touched && !password"
        />
      </div>
      <button type="submit" :disabled="!formValid">Login</button>
      <p class="register-link">
        Don't have an account? <router-link to="/register">Register here</router-link>
      </p>
      <p class="register-link forgot-password">
        <a href="#" @click.prevent="isResetMode = true">Forgot password?</a>
      </p>
    </form>

    <!-- reset-password form -->
    <form v-else class="reset-form" @submit.prevent="handleReset">
      <h2>Reset Password</h2>
      <div class="field">
        <label for="reset-email">Email</label>
        <InputText
          id="reset-email"
          v-model="resetEmail"
          placeholder="Enter your email"
          @blur="validateResetEmail"
          :class="{ 'p-invalid': resetEmailError }"
        />
        <small v-if="resetError" class="p-error">{{ resetError }}</small>
        <small v-else-if="resetSuccess" class="p-success">{{ resetSuccess }}</small>
      </div>
      <button type="submit" :disabled="!resetValid || isResetLoading">
        {{ isResetLoading ? 'Sending...' : 'Reset Password' }}
      </button>
      <button type="button" class="cancel-btn" @click="isResetMode = false">Cancel</button>
    </form>
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.reset-form {
  width: 100%;
  max-width: 400px;
  margin: auto;
  padding: 2rem;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.field :deep(.p-inputtext),
.field :deep(.p-password-input) {
  width: 100%;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.p-error {
  color: #d9534f;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}

.register-link {
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
}

.forgot-password {
  margin-top: 0.25rem;
}

.cancel-btn {
  margin-top: 0.5rem;
  background: transparent;
  color: #555;
  border: none;
  cursor: pointer;
}

.p-success {
  color: #28a745;
  display: block;
  margin-top: 0.5rem;
}

.toast {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  padding: 0.75rem 1.25rem;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slide-up 0.3s ease-out;
}
.toast.error {
  background-color: #d9534f;
}
.toast.success {
  background-color: #28a745;
}

@keyframes slide-up {
  from {
    transform: translate(-50%, 100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}
</style>
