<script setup lang="ts">
import { defineProps, ref, onMounted } from 'vue'
import axios from 'axios'

enum CrisisTime {
  BEFORE_CRISIS = 'BEFORE_CRISIS',
  DURING_CRISIS = 'DURING_CRISIS',
  AFTER_CRISIS = 'AFTER_CRISIS',
}

const props = defineProps({
  time: {
    type: String,
    required: true,
  },
})

interface GeneralInfoResponse {
  id: number
  title: string
  content: string
  theme: string
}

const infos = ref<GeneralInfoResponse[]>([])
const error = ref<string | null>(null)
const isLoading = ref(false)

async function fetchInfos() {
  isLoading.value = true
  error.value = null
  try {
    const res = await axios.get<GeneralInfoResponse[]>('/api/general-info/' + props.time, {
      withCredentials: true,
    })
    infos.value = res.data
  } catch (err: any) {
    error.value = 'Failed to load information.'
  } finally {
    isLoading.value = false
  }
}

function formatTitle(str: string): string {
  return str
    .replace('_', ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

onMounted(fetchInfos)
</script>

<template>
  <div class="crisis-view">
    <h2 class="page-title">{{ formatTitle(props.time) }}</h2>

    <div v-if="isLoading" class="status">Loading…</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else class="info-list">
      <div v-if="infos.length" class="info-list">
        <div v-for="info in infos" :key="info.id" class="info-item">
          <h3>{{ info.title }}</h3>
          <p>{{ info.content }}</p>
        </div>
      </div>
      <div v-else class="no-info">No information available for before crisis</div>
    </div>
  </div>
</template>

<style scoped>
.crisis-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.page-title {
  text-align: center;
  margin: 30px 0;
  color: #333;
  font-size: 3rem;
  padding: 0 20px;
}

.status {
  text-align: center;
  padding: 20px;
  font-size: 16px;
}

.status.error {
  color: #e53e3e;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.info-item {
  background-color: white;
  border-radius: 30px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-item h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.info-item p {
  margin: 0;
  line-height: 1.5;
  color: #555;
  text-align: left;
}

.no-info {
  padding: 20px;
  text-align: center;
  color: #777;
  font-style: italic;
}
</style>
