<script setup lang="ts">
import { ref } from 'vue';

const username = ref('');
const email = ref('');
const password = ref('');
const confirmpassword = ref('');
const agreeToTerms = ref(false);

function handleRegister() {
  if (password.value !== confirmpassword.value) {
    alert('Passwords do not match!');
    return;
  }
  if (!agreeToTerms.value) {
    alert('You must agree to the terms and conditions!');
    return;
  }
  alert('Registration successful!');
}
</script>

<template>
  <div class="page-wrapper">
    <div class="register-form">
      <h2>Register</h2>
      <div class="field">
        <label for="username">Username</label>
        <input id="username" v-model="username" type="text" placeholder="Enter your username" required />
      </div>
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" placeholder="Enter your email" required />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" placeholder="Enter your password" required />
      </div>
      <div class="field">
        <label for="confirmpassword">Confirm Password</label>
        <input id="confirmpassword" v-model="confirmpassword" type="password" placeholder="Confirm your password" required />
      </div>
      <div class="checkbox-container">
        <input type="checkbox" id="agreeToTerms" v-model="agreeToTerms" />
        <label for="agreeToTerms">I agree to the terms and conditions</label>
      </div>
      <button @click="handleRegister" :disabled="!agreeToTerms || password !== confirmpassword">Register</button>
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

.register-form h2 {
  margin-bottom: 1rem;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  color: black;
}

.field input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
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

.register-form p {
  margin-top: 1rem;
  font-size: 0.9rem;
}
</style>
