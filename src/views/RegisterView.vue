<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

const username = ref('');
const email = ref('');
const password = ref('');
const confirmpassword = ref('');
const agreeToTerms = ref(false);
const token = ref('');
const recaptchaRef = ref<HTMLElement | null>(null);

function renderRecaptcha() {
  if (window.grecaptcha && recaptchaRef.value) {
    window.grecaptcha.render(recaptchaRef.value, {
      sitekey: import.meta.env.VITE_APP_RECAPTCHA_SITE_KEY,
      callback: (response: string) => {
        token.value = response;
        console.log('reCAPTCHA token:', response);
      }
    });
  } else {
    // Try again if not loaded yet
    setTimeout(renderRecaptcha, 500);
  }
}

onMounted(() => {
  // Wait until DOM is rendered before rendering reCAPTCHA
  nextTick(() => {
    renderRecaptcha();
  });
});

function handleSubmit() {
  if (!token.value) {
    alert('Please complete the reCAPTCHA.');
    return;
  }

  // Submit form to backend (you would post the token with form data)
  alert(`Submitted with token: ${token.value}`);
}
</script>

<template>
  <div class="page-wrapper">
    <div class="register-form">
      <h2>Register</h2>

      <div class="field">
        <label for="username">Username</label>
        <input id="username" v-model="username" type="text" required />
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" required />
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" required />
      </div>

      <div class="field">
        <label for="confirmpassword">Confirm Password</label>
        <input id="confirmpassword" v-model="confirmpassword" type="password" required />
      </div>

      <div class="checkbox-container">
        <input type="checkbox" id="agreeToTerms" v-model="agreeToTerms" />
        <label for="agreeToTerms">I agree to the terms and conditions</label>
      </div>

      <!-- 🔐 reCAPTCHA box -->
      <div ref="recaptchaRef" class="recaptcha-container" />

      <button
        @click="handleSubmit"
        :disabled="!agreeToTerms || password !== confirmpassword"
      >
        Register
      </button>

      <p>Already have an account? <a href="/login">Login here</a></p>
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

.register-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-family: 'Roboto', sans-serif;
}

.field input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 1rem;
}

.checkbox-container label {
  margin-left: 0.5rem;
}

.recaptcha-container {
  margin: 1rem auto;
}

button {
  width: 100%;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}

.register-form p {
  margin-top: 1rem;
  font-size: 0.9rem;
}
</style>
