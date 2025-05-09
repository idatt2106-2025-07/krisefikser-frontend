<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import InfoCard from '@/components/common/InfoCard.vue'
import NotificationBar from '@/components/admin/NotificationBar.vue'
import TheMap from '@/components/map/TheMap.vue'
import DaysCircle from '@/components/common/DaysCircle.vue'
import { useReadinessStore } from '@/stores/readinessStore.ts'

interface Notification {
  type: 'danger' | 'warning' | 'info'
  message: string
}

const notifications = ref<Notification[]>([
  {
    type: 'danger',
    message:
      'Nuclear accident near Alta - Citizens close by is recommended to stay inside or evacuate the area',
  },
  {
    type: 'warning',
    message: 'Water needs to be changed in 1 day',
  },
  {
    type: 'info',
    message: 'You have 3 days of food left',
  },
])

const router = useRouter()
const currentStorageDays = ref(10)

/**
 * Navigation functions for different sections of the app
 */
const navigateToStorage = () => {
  router.push('/storage')
}

const navigateToInfo = () => {
  router.push('/general-info')
}

const navigateToProfile = () => {
  router.push('/profile')
}

const navigateToNews = () => {
  router.push('/news')
}

const readinessStore = useReadinessStore()

const daysLeft = ref(0)
const hoursLeft = ref(0)

const readinessIsLoading = ref(false)
const error = ref('')

const SUSTAIN_DAYS_GOAL = 7

onMounted(async () => {
  readinessIsLoading.value = true
  try {
    const readinessData = await readinessStore.getReadinessLevel()
    if (readinessData) {
      daysLeft.value = readinessData.days || 0
      hoursLeft.value = readinessData.hours || 0
    }
  } catch (err) {
    error.value = 'Failed to load readiness data'
    console.error(err)
  } finally {
    readinessIsLoading.value = false
  }
})
</script>

<template>
  <div class="home-page">
    <div class="home-container">
      <div class="header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
      </div>

      <NotificationBar :notifications="notifications" />

      <div class="main-content">
        <TheMap class="map-area" :isHomePage="true" />

        <div class="content-column buttons-column">
          <div class="page-buttons">
            <div class="buttons-grid">
              <div class="button-container" @click="navigateToStorage">
                <InfoCard clickable>
                  <h2>Emergency Storage</h2>
                  <div class="days-circle-wrapper">
                    <DaysCircle
                      :current-days="daysLeft"
                      :goal-days="SUSTAIN_DAYS_GOAL"
                      :loading="readinessIsLoading"
                    />
                  </div>
                  <p id="emergancy-storage-text">View Emergency Storage -></p>
                </InfoCard>
              </div>

              <div class="button-container" @click="navigateToInfo">
                <InfoCard clickable>
                  <h2>General Info</h2>
                  <p>Information about before, under and after a crisis</p>
                </InfoCard>
              </div>

              <div class="button-container" @click="navigateToNews">
                <InfoCard clickable>
                  <h2>News</h2>
                  <p>Get the latest new related to emergencies</p>
                </InfoCard>
              </div>

              <div class="button-container" @click="navigateToProfile">
                <InfoCard clickable>
                  <h2>Profile</h2>
                  <p>View and administrate your profile, household and emergency group</p>
                </InfoCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  background-color: var(--background-color);
  min-height: 100vh;
  width: 100%;
}

.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  background-color: var(--background-color);
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.logo {
  height: 100px;
  width: auto;
}

.main-content {
  display: flex;
  gap: 2rem;
  flex: 1;
  margin-bottom: 2rem;
  align-items: center;
}

.map-area {
  display: flex;
  width: 50%;
  height: 508px;
  border-radius: 10px;
  overflow: hidden;
}

.content-column {
  display: flex;
  flex-direction: column;
}

.buttons-column {
  width: 50%;
  height: 508px;
}

.page-buttons {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.buttons-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
  height: 100%;
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.button-container h2 {
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.button-container p {
  text-align: center;
  margin: 0;
  font-size: 1rem;
  line-height: 1.4;
}

.days-circle-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

@media (max-width: 1156px) {
  #emergancy-storage-text {
    display: none;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .content-column {
    width: 100%;
  }

  .buttons-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .map-area {
    order: 2;
    width: 100%;
    height: 400px;
  }

  .buttons-column {
    order: 1;
    width: 100%;
    height: auto;
    margin-bottom: 16px;
  }
}

@media (max-width: 576px) {
  .buttons-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  h2 {
    font-size: 1rem;
  }

  .button-container p {
    display: none;
  }

  .days-circle-wrapper {
    display: none;
  }
}
</style>
