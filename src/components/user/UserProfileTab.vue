<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import type { UserInfo } from '@/types/userTypes'

const userStore = useUserStore()
const userInfo = ref<UserInfo | null>(userStore.getUserInfo)

const parseRole = (role: string | undefined): string => {
  if (!role) return ''
  return role.split('_')[1].charAt(0).toUpperCase() + role.split('_')[1].slice(1).toLowerCase()
}

const isSharingLocation = ref<boolean>(userStore.getIsSharingLocation || false)

const handleIsSharingToggle = async () => {
  isSharingLocation.value = !isSharingLocation.value
  if (isSharingLocation.value) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        await userStore.updateIsSharingLocation(isSharingLocation.value, latitude, longitude)
      },
      (error) => {
        isSharingLocation.value = false
        alert(
          'Error getting location, make sure location services are enabled ' + 'in your browser.',
        )
      },
      { enableHighAccuracy: true },
    )
  } else {
    await userStore.updateIsSharingLocation(isSharingLocation.value, null, null)
  }
}

onMounted(async () => {
  await userStore.fetchUserInfo()
})
</script>

<template>
  <div class="container">
    <div class="info-container">
      <h3 class="sub-header">Name:</h3>
      <p class="sub-info">{{ userInfo?.name }}</p>
    </div>
    <div class="info-container">
      <h3 class="sub-header">Email:</h3>
      <p class="sub-info">{{ userInfo?.email }}</p>
    </div>
    <div class="info-container">
      <h3 class="sub-header">Role:</h3>
      <p class="sub-info">{{ parseRole(userInfo?.role) }}</p>
    </div>
    <div class="location-sharing-container">
      <label for="location-sharing" class="sub-header">Share my location:</label>
      <input
        type="checkbox"
        class="location-sharing"
        :checked="isSharingLocation"
        @click="handleIsSharingToggle"
      />
    </div>
  </div>
</template>

<style scoped>
.info-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 10px;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.sub-header {
  font-size: 1rem;
  font-weight: bold;
}

.sub-info {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  padding: 0;
}

.location-sharing-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin: 10px;
  padding: 10px;
  gap: 10px;
  border-bottom: 1px solid #ccc;
}

.location-sharing input {
  margin: 0;
}

.sub-header {
  font-size: 1rem;
  font-weight: bold;
}
</style>
