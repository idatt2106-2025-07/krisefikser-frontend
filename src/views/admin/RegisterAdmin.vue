<script setup lang="ts">
import { ref, computed } from 'vue'
import Password from 'primevue/password'
import { useRoute } from 'vue-router'
import axios from 'axios'

// Reactive state
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const confirmTouched = ref(false)
const token = ref('')

// Fetch the username and token from the route query parameters
const route = useRoute()
username.value = (route.query.username as string) || ''
token.value = (route.query.token as string) || ''

// Computed properties
const passwordsMatch = computed(() => password.value === confirmPassword.value)
const formValid = computed(() => password.value && confirmPassword.value && passwordsMatch.value)

// Submit handler
async function handleSubmit() {
  confirmTouched.value = true

  if (!formValid.value) {
    return
  }

  try {
    await axios.post('/api/admin/register', {
      username: username.value,
      password: password.value,
      token: token.value,
    })
    alert('Password set successfully! You can now log in.')
  } catch (error) {
    console.error(error)
    alert('Failed to set password. Please try again.')
  }
}
</script>

<template>
  <div class="page-wrapper">
    <form class="register-admin-form" @submit.prevent="handleSubmit">
      <h2>Set Your Password</h2>

      <div class="field">
        <label for="username">Username</label>
        <input id="username" type="text" v-model="username" disabled />
      </div>

      <div class="field">
        <label for="password">Password</label>
        <Password id="password" v-model="password" toggleMask placeholder="Password" />
      </div>

      <div class="field">
        <label for="confirmPassword">Confirm Password</label>
        <Password
          id="confirmPassword"
          v-model="confirmPassword"
          toggleMask
          :feedback="false"
          placeholder="Confirm Password"
          :class="{ 'p-invalid': confirmTouched && !passwordsMatch }"
          @blur="confirmTouched = true"
        />
        <small v-if="confirmTouched && !passwordsMatch" class="p-error"
          >Passwords don’t match</small
        >
      </div>

      <button type="submit" :disabled="!formValid">Set Password</button>
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

.register-admin-form {
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

.p-error {
  color: #d9534f;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

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

button:hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}
</style>
