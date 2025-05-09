<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import UserSettingsView from './UserSettingsView.vue'

interface UserInfo {
  id?: number
  email: string
  name: string
  role: string
  householdLatitude?: number
  householdLongitude?: number
  isSharingLocation?: boolean
}

const userInfo = ref<UserInfo | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const fetchUserProfile = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/user/profile')
    console.log('User profile data:', response.data)
    userInfo.value = response.data
  } catch (err) {
    console.error('Failed to fetch user profile:', err)
    error.value = 'Could not load your profile information. Please try again later.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<template>
  <div class="profile-container">
    <h1 class="profile-title">User Profile</h1>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading your profile...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchUserProfile" class="retry-button">Try Again</button>
    </div>

    <!-- Profile data -->
    <div v-else-if="userInfo" class="profile-content">
      <div class="profile-section personal-info">
        <h2>Personal Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Name:</label>
            <span>{{ userInfo.name }}</span>
          </div>
          <div class="info-item">
            <label>Email:</label>
            <span>{{ userInfo.email }}</span>
          </div>
          <div class="info-item">
            <label>Role:</label>
            <span class="role-badge">{{ userInfo.role }}</span>
          </div>
          <div v-if="userInfo.isSharingLocation !== undefined" class="info-item">
            <label>Location Sharing:</label>
            <span class="sharing-badge" :class="userInfo.isSharingLocation ? 'active' : 'inactive'">
              {{ userInfo.isSharingLocation ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-if="userInfo.householdLatitude && userInfo.householdLongitude"
        class="profile-section household-info"
      >
        <h2>Household Location</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Coordinates:</label>
            <span>{{ userInfo.householdLatitude }}, {{ userInfo.householdLongitude }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- User settings section -->
    <div class="profile-section">
      <h2>Settings</h2>
      <UserSettingsView />
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-title {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
  font-weight: 600;
}

.profile-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.profile-section h2 {
  color: #444;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: span 2;
}

.info-item label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.3rem;
}

.info-item span {
  font-size: 1.1rem;
  color: #333;
}

.role-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: #e6f7ff;
  color: #0066cc;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.sharing-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.sharing-badge.active {
  background-color: #e6ffe6;
  color: #009900;
}

.sharing-badge.inactive {
  background-color: #ffe6e6;
  color: #cc0000;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-left-color: #0066cc;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-container {
  text-align: center;
  padding: 2rem;
  color: #d32f2f;
}

.retry-button {
  background-color: #0066cc;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  font-weight: 500;
}

.retry-button:hover {
  background-color: #004c99;
}
</style>
