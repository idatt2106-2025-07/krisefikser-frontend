<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LoggedInNavBar from './LoggedInNavBar.vue'
import LoggedOutNavBar from './LoggedOutNavBar.vue'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)

onMounted(() => authStore.fetchUser())
</script>

<template>
  <div>
    <LoggedInNavBar v-if="isLoggedIn" />
    <LoggedOutNavBar v-else />
  </div>
</template>
