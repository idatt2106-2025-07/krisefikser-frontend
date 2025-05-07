<template>
  <div class="registration-page">
    <div class="registration-card">
      <div class="card-header">
        <h1>Complete Your Admin Registration</h1>
        <p>Please set up your account credentials</p>
      </div>

      <form @submit.prevent="onSubmit" class="registration-form">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="you@example.com"
            required
            :class="{ 'input-error': errors.email }"
          />
          <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
            @input="validatePassword"
            :class="{ 'input-error': errors.password }"
          />
          <div class="password-requirements">
            <p class="requirement" :class="{ met: hasMinLength }">
              <span class="icon">{{ hasMinLength ? '✓' : '•' }}</span>
              Minimum 8 characters
            </p>
            <p class="requirement" :class="{ met: hasUpperCase }">
              <span class="icon">{{ hasUpperCase ? '✓' : '•' }}</span>
              At least one uppercase letter
            </p>
            <p class="requirement" :class="{ met: hasLowerCase }">
              <span class="icon">{{ hasLowerCase ? '✓' : '•' }}</span>
              At least one lowercase letter
            </p>
            <p class="requirement" :class="{ met: hasNumber }">
              <span class="icon">{{ hasNumber ? '✓' : '•' }}</span>
              At least one number
            </p>
            <p class="requirement" :class="{ met: hasSpecialChar }">
              <span class="icon">{{ hasSpecialChar ? '✓' : '•' }}</span>
              At least one special character
            </p>
          </div>
          <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
        </div>

        <button type="submit" :disabled="loading" class="submit-button">
          <span v-if="loading">Creating account...</span>
          <span v-else>Complete Registration</span>
        </button>
      </form>
    </div>

    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" :class="['toast-message', t.type]">
        {{ t.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

interface RegisterForm {
  token: string
  email: string
  password: string
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

interface FormErrors {
  email?: string
  password?: string
  token?: string
}

const route = useRoute()
const router = useRouter()

const form = reactive<RegisterForm>({ token: '', email: '', password: '' })
const errors = reactive<FormErrors>({})
const loading = ref(false)
const toasts = ref<Toast[]>([])

// Password validation states
const hasMinLength = ref(false)
const hasUpperCase = ref(false)
const hasLowerCase = ref(false)
const hasNumber = ref(false)
const hasSpecialChar = ref(false)

onMounted(() => {
  const t = route.query.token as string
  if (!t) {
    errors.token = 'Invite token is required'
    addToast('Invite token missing in URL.', 'error')
    return
  }
  form.token = t
})

function addToast(message: string, type: 'success' | 'error') {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, 3000)
}

function validatePassword() {
  const pass = form.password

  hasMinLength.value = pass.length >= 8
  hasUpperCase.value = /[A-Z]/.test(pass)
  hasLowerCase.value = /[a-z]/.test(pass)
  hasNumber.value = /[0-9]/.test(pass)
  hasSpecialChar.value = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)

  if (!pass) {
    errors.password = 'Password is required'
  } else if (
    !hasMinLength.value ||
    !hasUpperCase.value ||
    !hasLowerCase.value ||
    !hasNumber.value ||
    !hasSpecialChar.value
  ) {
    errors.password = 'Password does not meet all requirements'
  } else {
    errors.password = undefined
  }
}

async function onSubmit() {
  // Clear previous errors
  errors.email = undefined
  errors.password = undefined

  // Validate form
  if (!form.email) errors.email = 'Email is required'
  validatePassword()

  // Check if there are any errors
  if (errors.email || errors.password) {
    return
  }

  loading.value = true
  try {
    const { data } = await axios.post<string>('/api/admin/register', form)
    addToast(data, 'success')
    setTimeout(() => router.push('/login'), 1500)
  } catch (err: unknown) {
    // Update the error handling in the onSubmit function
    if (axios.isAxiosError(err)) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.'

      // Parse the validation errors from the message
      if (typeof message === 'string' && message.includes('Validation failed')) {
        const validationErrors = message.split(':')[1].trim()
        const errorList = validationErrors
          .replace(/\[|\]/g, '')
          .split(',')
          .map((e: string) => e.trim())

        errorList.forEach((error: string) => {
          if (error.includes('Token')) {
            errors.token = error
            addToast(error, 'error')
          } else if (error.includes('Password')) {
            errors.password = error
          } else if (error.includes('Email')) {
            errors.email = error
          }
        })
      } else {
        addToast(message, 'error')
      }
    } else if (err instanceof Error) {
      addToast(err.message, 'error')
    } else {
      addToast('Registration failed. Please try again.', 'error')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.registration-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.registration-card {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.card-header h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.card-header p {
  color: #718096;
  font-size: 0.9375rem;
}

.registration-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
  font-size: 0.9375rem;
}

.form-group input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #f8fafc;
}

.form-group input.input-error {
  border-color: #e53e3e;
  background-color: #fff5f5;
}

.form-group input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  background-color: white;
}

.error-message {
  color: #e53e3e;
  font-size: 0.8125rem;
  margin-top: 0.25rem;
}

.password-requirements {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #f8fafc;
  border-radius: 6px;
}

.requirement {
  display: flex;
  align-items: center;
  color: #718096;
  font-size: 0.8125rem;
  margin: 0.25rem 0;
}

.requirement.met {
  color: #38a169;
}

.requirement .icon {
  display: inline-block;
  width: 1.2em;
  text-align: center;
  margin-right: 0.5rem;
}

.submit-button {
  width: 100%;
  padding: 1rem;
  background-color: #4299e1;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background-color: #3182ce;
  transform: translateY(-1px);
}

.submit-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
  opacity: 0.8;
}

.toast-container {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 1000;
  width: 90%;
  max-width: 400px;
}

.toast-message {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: toast-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

.toast-message.success {
  background-color: #38a169;
}

.toast-message.error {
  background-color: #e53e3e;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .registration-page {
    padding: 1rem;
  }

  .registration-card {
    border-radius: 10px;
  }

  .card-header {
    padding: 1.5rem 1.5rem 1rem;
  }

  .registration-form {
    padding: 1.5rem;
  }
}
</style>
