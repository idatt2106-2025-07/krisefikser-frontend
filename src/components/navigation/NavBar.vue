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
  <div>
    <LoggedInNavBar v-if="isLoggedIn" />
    <LoggedOutNavBar v-else />
  </div>
</template>
