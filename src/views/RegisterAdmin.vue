<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { getAuth } from "firebase/auth";
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'

// reactive state
const username = ref('')
const email = ref('')
const password = ref('')
const confirmpassword = ref('')
const agreeToTerms = ref(false)
const emailError = ref(false)
const confirmTouched = ref(false)

// Google reCAPTCHA
const token = ref('')
const recaptchaRef = ref<HTMLElement | null>(null)

/** e‑mail syntax check */
function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailError.value = !emailRegex.test(email.value)
}

/** true if the two password boxes match */
const passwordsMatch = computed(() => password.value === confirmpassword.value)

/** only allow submit if everything is valid */
const formValid = computed(
  () =>
    username.value &&
    email.value &&
    password.value &&
    confirmpassword.value &&
    agreeToTerms.value &&
    passwordsMatch.value &&
    !emailError.value &&
    !!token.value,
)

function handleSubmit() {
  validateEmail()
  confirmTouched.value = true

  if (!formValid.value) {
    return
  }

  alert(`Submitted with token: ${token.value}`)
}

function renderRecaptcha() {
  if (window.grecaptcha && recaptchaRef.value) {
    window.grecaptcha.render(recaptchaRef.value, {
      sitekey: import.meta.env.VITE_APP_RECAPTCHA_SITE_KEY,
      callback: (response: string) => {
        token.value = response
      },
    })
  } else {
    setTimeout(renderRecaptcha, 500)
  }
}

onMounted(() => {
  nextTick(renderRecaptcha)
})
</script>

<template>
  <div class="page-wrapper">
    <form class="register-form" @submit.prevent="handleSubmit">
      <h2>Register Admin</h2>

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
        <Password id="password" v-model="password" toggleMask placeholder="Password" />
      </div>

      <div class="field">
        <label for="confirmPassword">Confirm Password</label>
        <Password
          id="confirmPassword"
          v-model="confirmpassword"
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

      <div class="checkbox-container">
        <input type="checkbox" id="agreeToTerms" v-model="agreeToTerms" />
        <label for="agreeToTerms">I agree to the terms and conditions</label>
      </div>

      <!-- 🔐 reCAPTCHA -->
      <div ref="recaptchaRef" class="recaptcha-container" />

      <button type="submit" :disabled="!formValid">Register</button>

      <p class="login-link">
        Already have an account?
        <router-link to="/login">Login here</router-link>
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

.register-form {
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

/* make PrimeVue inputs 100% wide */
.field :deep(.p-inputtext),
.field :deep(.p-password-input) {
  width: 100%;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
}

.recaptcha-container {
  margin: 1rem 0;
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

.login-link {
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
}
</style>
