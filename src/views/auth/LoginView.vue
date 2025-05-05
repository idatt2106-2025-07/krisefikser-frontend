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

function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailError.value = !emailRegex.test(email.value)
}

const formValid = computed(() => email.value && password.value && !emailError.value)

async function handleLogin() {
  touched.value = true
  validateEmail()

  if (!formValid.value) return

  try {
    const response = await axios.post(  'http://localhost:8080/api/auth/login',
      {
        email: email.value,
        password: password.value,
      },
      {
        withCredentials: true,
      },
    )

    alert(`Login successful: ${response.data.message}`)
    await authStore.fetchUser()
    router.push('/')
  } catch (error) {
    console.error('Error during login:', error)
    alert('Login failed. Please check your credentials and try again.')
  }
}
</script>

<template>
  <div class="page-wrapper">
    <form class="login-form" @submit.prevent="handleLogin">
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
</style>
