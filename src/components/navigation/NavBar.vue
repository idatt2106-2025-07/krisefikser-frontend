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
  <div class="sticky-nav">
    <LoggedInNavBar v-if="isLoggedIn" />
    <LoggedOutNavBar v-else />
  </div>
</template>

<style scoped>
.sticky-nav {
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
