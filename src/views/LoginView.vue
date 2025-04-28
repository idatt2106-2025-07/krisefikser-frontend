<script setup lang="ts">
import { ref, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'

const email = ref('')
const password = ref('')
const emailError = ref(false)
const touched = ref(false)

function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailError.value = !emailRegex.test(email.value)
}

const formValid = computed(() => email.value && password.value && !emailError.value)

function handleLogin() {
  touched.value = true
  validateEmail()
  if (!formValid.value) return
  alert('Login successful!')
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
          id="password"
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

/* make PrimeVue inputs 100% wide */
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
