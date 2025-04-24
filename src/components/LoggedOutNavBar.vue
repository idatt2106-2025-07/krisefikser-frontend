<script setup lang="ts">
import { useRouter } from 'vue-router';
import ColorToggleButton from '@/Buttons/ColorToggleButton.vue';

const router = useRouter();

function navigateToLogin() {
  router.push('/login');
}

function navigateToSignup() {
  router.push('/register');
}

function navigateToHome() {
  router.push('/');
}

function navigateToSettings() {
  router.push('/settings');
}
</script>

<template>
  <nav class="logged-out-navbar">
    <ul>
      <li>
        <button @click="navigateToLogin">Login</button>
      </li>
      <li>
        <button @click="navigateToSignup">Signup</button>
      </li>
      <li>
        <button @click="navigateToHome">Home</button>
      </li>
      <li>
        <button @click="navigateToSettings">Settings</button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.logged-out-navbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: #f8f9fa; /* Light gray background */
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #ddd; /* Optional border for separation */
}

.logged-out-navbar ul {
  display: flex;
  list-style: none; /* Remove dots */
  margin: 0;
  padding: 0;
  gap: 1rem; /* Space between buttons */
}

button {
  padding: 0.5rem 1rem;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background-color: #0056b3;
}
</style>
