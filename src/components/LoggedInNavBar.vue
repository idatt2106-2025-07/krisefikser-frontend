<script setup lang="ts">
import { useRouter } from 'vue-router'
import ColorToggleButton from '@/Buttons/ColorToggleButton.vue'

const router = useRouter()

function navigateToProfile() {
  router.push('/profile')
}

function navigateToDashboard() {
  router.push('/dashboard')
}

function logout() {
  // Trigger logout logic
  // Then redirect to home
  router.push('/')
}
</script>

<template>
  <nav class="logged-in-navbar">
    <ul>
      <li><button @click="navigateToDashboard">Dashboard</button></li>
      <li><button @click="navigateToProfile">Profile</button></li>
      <li><ColorToggleButton /></li>
      <li><button @click="logout">Logout</button></li>
    </ul>
  </nav>
</template>

<style scoped>
.logged-in-navbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: #e9f5f9;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #ccc;
}

.logged-in-navbar ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  background-color: #28a745;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background-color: #218838;
}
</style>
