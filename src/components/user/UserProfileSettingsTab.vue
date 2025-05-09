<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useLocationSharing } from '@/composables/useLocationSharing'
import type { UserInfo } from '@/types/userTypes'

const userStore = useUserStore()
const userInfo = ref<UserInfo | null>(userStore.getUserInfo)

const locationSharing = useLocationSharing()

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
    locationSharing.startSharing()
  } else {
    await userStore.updateIsSharingLocation(isSharingLocation.value, null, null)
    locationSharing.stopSharing()
  }
}

onMounted(async () => {
  await userStore.fetchUserInfo()
})
</script>

<template>
  <div class="container">
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
