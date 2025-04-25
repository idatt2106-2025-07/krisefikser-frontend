<script setup lang="ts">
import { ref } from 'vue'
import Password from 'primevue/password'
import InputText from 'primevue/inputtext'
import { useForm } from 'vee-validate'

const { handleSubmit, errors } = useForm()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const emailError = ref(false)

function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailError.value = !emailRegex.test(email.value)
}

function handleLogin() {
  validateEmail()
  if (emailError.value) {
    alert('Please fix the errors before logging in!')
    return
  }
  if (!email.value || !password.value) {
    alert('Please fill in all fields!')
    return
  }
  alert('Login successful!')
}
</script>

<template>
  <div class="page-wrapper">
    <div class="login-form">
      <h2>Login</h2>

        <div class="email-input">
            <InputText
              id="email"
              v-model="email"
              type="text"
              placeholder="Email"
              @input="validateEmail"
            />
            <p v-if="emailError" class="error-text">Email invalid</p>
        </div>



        <div class="password-input">
            <Password
              id="password"
              v-model="password"
              toggleMask
              :feedback="false"
              placeholder="Password"
              :inputStyle="{ fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#333' }"
            />
        </div>

      <button @click="handleLogin" :disabled="!email || !password">Login</button>
      <p>Don't have an account? <a href="/register">Register here</a></p>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-form h2 {
  margin-bottom: 1rem;
}

.field {
  margin-bottom: 1rem;
}

.email-input {
  margin-bottom: 1rem;
}

.email-input .p-inputtext {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  color: #333;
}

.password-input {
  margin-bottom: 1rem;
}

.password-input :deep(.p-password-input > input) {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  color: #333;
}

button {
  width: 100%;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}

.login-form p {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.error-text {
  color: red;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
</style>
