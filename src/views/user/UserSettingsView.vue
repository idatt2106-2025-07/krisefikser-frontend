<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import InputSwitch from 'primevue/inputswitch'
import Card from 'primevue/card'
import ProgressSpinner from 'primevue/progressspinner'

const toast = useToast()
const isLocationSharingEnabled = ref(false)
const isLoading = ref(true)
const isSubmitting = ref(false)

// Get the user's current location sharing status on component load
onMounted(async () => {
  try {
    const response = await axios.get('/api/user/profile')
    isLocationSharingEnabled.value = response.data.isSharingLocation || false
  } catch (error) {
    console.error('Error fetching user profile:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch your location sharing settings',
      life: 3000,
    })
  } finally {
    isLoading.value = false
  }
})

// Function to get current user position
const getCurrentPosition = () => {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      { enableHighAccuracy: true },
    )
  })
}

// Toggle location sharing
const toggleLocationSharing = async () => {
  const previousValue = !isLocationSharingEnabled.value
  try {
    isSubmitting.value = true

    if (isLocationSharingEnabled.value) {
      // Enable location sharing
      const position = await getCurrentPosition()
      const { latitude, longitude } = position.coords

      await axios.post('/api/position/share', {
        latitude,
        longitude,
      })

      toast.add({
        severity: 'success',
        summary: 'Location Sharing Enabled',
        detail: 'Your location is now being shared',
        life: 3000,
      })
    } else {
      // Disable location sharing
      await axios.delete('/api/position/delete')

      toast.add({
        severity: 'info',
        summary: 'Location Sharing Disabled',
        detail: 'Your location is no longer being shared',
        life: 3000,
      })
    }
  } catch (error) {
    console.error('Error toggling location sharing:', error)

    // Revert the toggle state since the operation failed
    isLocationSharingEnabled.value = previousValue

    let errorMessage = 'Failed to update location sharing'

    if (error instanceof GeolocationPositionError) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage =
            'Location permission denied. Please enable location access in your browser settings.'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.'
          break
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.'
          break
      }
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000,
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Card class="settings-card">
    <template #title>Location Settings</template>
    <template #content>
      <div v-if="isLoading" class="loading-container">
        <ProgressSpinner />
        <p>Loading settings...</p>
      </div>
      <div v-else class="settings-content">
        <div class="setting-item">
          <div class="setting-info">
            <h3>Share Your Location</h3>
            <p class="setting-description">
              Enable location sharing to allow household members to see your current location. Your
              location will be updated whenever you use the app.
            </p>
          </div>
          <div class="setting-control">
            <div class="switch-container">
              <span class="switch-label">{{ isLocationSharingEnabled ? 'On' : 'Off' }}</span>
              <InputSwitch
                v-model="isLocationSharingEnabled"
                @change="toggleLocationSharing"
                :disabled="isSubmitting"
                class="location-toggle"
              />
            </div>
          </div>
        </div>

        <div v-if="isLocationSharingEnabled" class="privacy-notice">
          <p>
            <strong>Privacy Notice:</strong> When location sharing is enabled, your current location
            will be visible to members of your household. You can disable location sharing at any
            time.
          </p>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.settings-card {
  margin-bottom: 1.5rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.loading-container p {
  margin-top: 1rem;
  color: #666;
}

.settings-content {
  padding: 0.5rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.setting-info {
  flex: 1;
}

.setting-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #333;
}

.setting-description {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.setting-control {
  margin-left: 1.5rem;
}

.switch-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.switch-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
  min-width: 30px;
}

.privacy-notice {
  margin-top: 1.5rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-left: 4px solid #007bff;
  border-radius: 4px;
}

.privacy-notice p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.location-toggle {
  min-width: 3rem;
}

:deep(.p-inputswitch.p-inputswitch-checked .p-inputswitch-slider) {
  background-color: #4caf50;
}

:deep(.p-inputswitch.p-inputswitch-checked:not(.p-disabled):hover .p-inputswitch-slider) {
  background-color: #43a047;
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .setting-control {
    margin-left: 0;
    margin-top: 1rem;
    width: 100%;
  }

  .switch-container {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
