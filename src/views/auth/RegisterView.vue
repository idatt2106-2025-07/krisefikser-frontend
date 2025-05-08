<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const confirmpassword = ref('')
const agreeToTerms = ref(false)
const emailError = ref(false)
const confirmTouched = ref(false)
const isLoading = ref(false)

// toast state
const toastMessage = ref<string | null>(null)
const toastType = ref<'' | 'success' | 'error'>('')

const siteKey = 'a754b964-3852-4810-a35e-c13ad84ce644'

const hcaptchaToken = ref<string | null>(null)

function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailError.value = !emailRegex.test(email.value)
}

const passwordsMatch = computed(() => password.value === confirmpassword.value)

const formValid = computed(
  () =>
    !!(
      name.value &&
      email.value &&
      password.value &&
      confirmpassword.value &&
      agreeToTerms.value &&
      passwordsMatch.value &&
      !emailError.value &&
      hcaptchaToken.value
    ),
)

async function handleSubmit() {
  toastMessage.value = null
  toastType.value = ''

  validateEmail()
  confirmTouched.value = true
  if (!formValid.value) return

  try {
    isLoading.value = true

    const verify = await axios.post(
      'http://dev.krisefikser.localhost:8080/api/hcaptcha/verify',
      { token: hcaptchaToken.value },
      { withCredentials: true },
    )
    if (verify.status !== 200 || !verify.data.success) {
      toastMessage.value = 'Captcha verification failed'
      toastType.value = 'error'
      isLoading.value = false
      return
    }

    const res = await axios.post(
      'http://dev.krisefikser.localhost:8080/api/auth/register',
      { name: name.value, email: email.value, password: password.value },
      { withCredentials: true },
    )

    if (res.status === 201) {
      toastMessage.value =
        'Registered successfully. A verification email has been sent. Redirecting to login…'
      toastType.value = 'success'
      setTimeout(() => {
        toastMessage.value = null
        toastType.value = ''
        router.push('/login')
      }, 2000)
      return
    }

    console.error('Unexpected response status:', res.status)
    toastMessage.value = 'Unexpected response. Please try again.'
    toastType.value = 'error'
  } catch (err) {
    console.error('Error during registration:', err)
    if (axios.isAxiosError(err) && err.response) {
      toastMessage.value = err.response.data?.message || 'Registration failed. Please try again.'
    } else {
      toastMessage.value = 'An unexpected error occurred. Please try again.'
    }
    toastType.value = 'error'
  } finally {
    /* cleared only for error paths */
    isLoading.value = false
  }
}
</script>

<template>
  <div class="page-wrapper">
    <!-- toast notification -->
    <div v-if="toastMessage" :class="['toast', toastType]">
      {{ toastMessage }}
    </div>

    <form class="register-form" @submit.prevent="handleSubmit">
      <h2>Register</h2>

      <div class="field">
        <label for="name">Name</label>
        <InputText id="name" v-model="name" placeholder="Name" :disabled="isLoading" />
      </div>

      <div class="field">
        <label for="email">Email</label>
        <InputText
          id="email"
          v-model="email"
          placeholder="Email"
          @blur="validateEmail"
          :class="{ 'p-invalid': emailError }"
          :disabled="isLoading"
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
          :disabled="isLoading"
        />
      </div>

      <div class="field">
        <label for="confirmPassword">Confirm Password</label>
        <Password
          inputId="confirmPassword"
          v-model="confirmpassword"
          toggleMask
          :feedback="false"
          placeholder="Confirm Password"
          :class="{ 'p-invalid': confirmTouched && !passwordsMatch }"
          @blur="confirmTouched = true"
          :disabled="isLoading"
        />
        <small v-if="confirmTouched && !passwordsMatch" class="p-error"
          >Passwords don’t match</small
        >
      </div>

      <div class="checkbox-container">
        <input type="checkbox" class="agreeToTerms" v-model="agreeToTerms" :disabled="isLoading" />
        <label for="agreeToTerms">I agree to the terms and conditions</label>
      </div>

      <vue-hcaptcha
        sitekey="a754b964-3852-4810-a35e-c13ad84ce644"
        @verify="(token: string) => (hcaptchaToken = token)"
        @expire="() => (hcaptchaToken = null)"
      ></vue-hcaptcha>

      <button type="submit" :disabled="!formValid || isLoading">
        {{ isLoading ? 'Registering…' : 'Register' }}
      </button>

      <p class="login-link">
        Already have an account?
        <router-link to="/login">Login here</router-link>
      </p>
    </form>
  </div>
</template>

<style scoped>
/* — layout + form — */
.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
}
.register-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
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

/* — messages & validation — */
.p-error {
  color: #d9534f;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
.status-message {
  margin-bottom: 1rem;
  font-size: 0.95rem;
  text-align: center;
}
.status-message.success {
  color: #28a745;
}
.status-message.error {
  color: #dc3545;
}

/* — misc controls — */
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
}
button {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: #fff;
  border: 0;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
button:hover:not(:disabled) {
  background: #0056b3;
}
button:disabled {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
}
.login-link {
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
}
</style>
