<script setup lang="ts">
import DaysCircle from '@/components/common/DaysCircle.vue'
import { defineProps, ref, onMounted } from 'vue'
import { useReadinessStore } from '@/stores/readinessStore.ts'

const props = defineProps({
  containerClass: {
    type: String,
    default: '',
  },
  circleClass: {
    type: String,
    default: '',
  },
  contentClass: {
    type: String,
    default: '',
  },
  numberClass: {
    type: String,
    default: '',
  },
  labelClass: {
    type: String,
    default: '',
  },
  progressColor: {
    type: String,
    default: '#5ADF7B',
  },
  bgColor: {
    type: String,
    default: '#FF5C5F',
  },
})

const readinessStore = useReadinessStore()

const daysLeft = ref(0)
const hoursLeft = ref(0)

const weeksLeft = ref(0)
const daysLeftInWeek = ref(0)
const isLoading = ref(false)
const error = ref('')

const SUSTAIN_DAYS_GOAL = 7

onMounted(async () => {
  isLoading.value = true
  try {
    const readinessData = await readinessStore.getReadinessLevel()
    if (readinessData) {
      daysLeft.value = readinessData.days || 0
      hoursLeft.value = readinessData.hours || 0

      weeksLeft.value = Math.floor(daysLeft.value / 7)
      daysLeftInWeek.value = daysLeft.value % 7
    }
  } catch (err) {
    error.value = 'Failed to load readiness data'
    console.error(err)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="container">
    <div class="text">
      <div class="preparednessHeader">Estimated duration:</div>
      <div class="preparednessBody">
        <p v-if="weeksLeft == 1">{{ weeksLeft }} week, {{ '\u200B' }}</p>
        <p v-else>{{ weeksLeft }} weeks, {{ '\u200B' }}</p>
        <p v-if="daysLeft > 0 && daysLeftInWeek == 1">{{ daysLeftInWeek }} day {{ '\u200B' }}</p>
        <p v-else>{{ daysLeftInWeek }} days {{ '\u200B' }}</p>
        <p v-if="hoursLeft == 1 && daysLeft == 0">{{ hoursLeft }} hour</p>
        <p v-if="hoursLeft != 1 && daysLeft == 0">{{ hoursLeft }} hours</p>
        <p v-if="hoursLeft != 1 && daysLeft > 0">and {{ hoursLeft }} hours</p>
        <p v-if="hoursLeft == 1 && daysLeft > 0">and {{ hoursLeft }} hour</p>
      </div>
    </div>
    <DaysCircle
      :current-days="daysLeft"
      :goal-days="SUSTAIN_DAYS_GOAL"
      :loading="isLoading"
      container-class="my-days-container"
      circle-class="my-days-circle"
      content-class="my-days-content"
    />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 30px;
}
.text {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: white;
  padding: 10px;
  gap: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  height: 100%;
}

.preparednessHeader {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  border-bottom: 1px #333 solid;
  padding-bottom: 6px;
}

.preparednessBody {
  display: flex;
  flex-direction: row;
  font-size: 1rem;
  color: #666;
}

.preparednessBody p {
  font-size: 1rem;
  color: #666;
  margin: 0;
}
</style>
