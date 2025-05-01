<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LoggedInNavBar from './LoggedInNavBar.vue'
import LoggedOutNavBar from './LoggedOutNavBar.vue'

const authStore = useAuthStore()

// Use the store's getter to determine login status
const isLoggedIn = computed(() => authStore.isLoggedIn)

function logout() {
  authStore.clearToken()
  window.location.href = '/login'
}
</script>

<template>
  <nav class="navbar">
    <div v-if="isLoggedIn">
      <!-- Logged-in NavBar -->
      <LoggedInNavBar />
    </div>
    <div v-else>
      <!-- Logged-out NavBar -->
      <LoggedOutNavBar />
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: #007bff;
  color: white;
}

.navbar a {
  color: white;
  text-decoration: none;
  margin: 0 0.5rem;
}

.navbar button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}
</style>
