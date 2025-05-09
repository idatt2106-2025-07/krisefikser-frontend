<script setup lang="ts">
import NavBar from './components/navigation/NavBar.vue'
import FooterComponent from './components/footer/FooterComponent.vue'
import { useLocationSharing } from '@/composables/useLocationSharing'
import { useUserStore } from '@/stores/userStore'
import { watch, onMounted } from 'vue'
import BackButton from '@/components/common/BackButton.vue'

const userStore = useUserStore()
const { startSharing, stopSharing, isSharing } = useLocationSharing(30000)

watch(
  () => userStore.getIsSharingLocation,
  (isSharingEnabled) => {
    if (isSharingEnabled && !isSharing.value) {
      startSharing()
    } else if (!isSharingEnabled && isSharing.value) {
      stopSharing()
    }
  },
)

onMounted(async () => {
  await userStore.fetchUserInfo()

  if (userStore.getIsSharingLocation) {
    startSharing()
  }
})
</script>

<template>
  <div class="app-layout">
    <NavBar />
    <main class="main-content">
      <back-button v-if="$route.path !== '/'" />
      <router-view />
    </main>
    <footer-component />
  </div>
</template>

<style>
html,
body {
  height: 100%;
  margin: 0;
}

.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  position: relative;
}
</style>
