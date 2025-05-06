<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'

interface GeneralInfoResponse {
  id: number
  title: string
  content: string
  theme: string
}

const allInfos = ref<GeneralInfoResponse[]>([]) // <-- full list
const infos = ref<GeneralInfoResponse[]>([]) // <-- displayed list
const error = ref<string | null>(null)
const isLoading = ref(false)

// selected theme filter
const themeFilter = ref<string | null>(null)

// compute unique theme options from the full list
const themes = computed(() => Array.from(new Set(allInfos.value.map((i) => i.theme))))

// helper to display nicer theme names
function formatTheme(t: string) {
  return t.replace(/_/g, ' ').toUpperCase()
}

async function fetchAllInfos() {
  try {
    const res = await axios.get<GeneralInfoResponse[]>('/api/general-info/all', {
      withCredentials: true,
    })
    allInfos.value = res.data
  } catch (err) {
    console.error('Error fetching all themes:', err)
  }
}

async function fetchGeneralInfo(theme?: string) {
  isLoading.value = true
  error.value = null

  const url = theme ? `/api/general-info/${theme}` : '/api/general-info/all'

  try {
    const res = await axios.get<GeneralInfoResponse[]>(url, {
      withCredentials: true,
    })
    infos.value = res.data
  } catch (err) {
    console.error('Error fetching general info:', err)
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      error.value = err.response.data.message
    } else {
      error.value = 'Failed to load general information.'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchAllInfos() // load themes
  fetchGeneralInfo() // load initial list
})

// refetch only the displayed list when filter changes
watch(themeFilter, (newTheme) => {
  fetchGeneralInfo(newTheme || undefined)
})
</script>

<template>
  <div class="general-info">
    <h2 class="page-title">General Information</h2>

    <!-- theme filter dropdown -->
    <div class="field filter-field">
      <label for="theme">Filter by theme:</label>
      <select id="theme" v-model="themeFilter">
        <option :value="null">All</option>
        <option v-for="t in themes" :key="t" :value="t">{{ formatTheme(t) }}</option>
      </select>
    </div>

    <div v-if="isLoading" class="loading">Loading…</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <ul v-else class="info-list">
      <li v-for="info in infos" :key="info.id" class="info-item">
        <h3 class="info-title">
          {{ info.title }}
          <small class="info-theme">{{ formatTheme(info.theme) }}</small>
          <!-- no () around theme -->
        </h3>
        <p class="info-content">{{ info.content }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.general-info {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, sans-serif;
  color: #333;
}

.page-title {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  color: #2c3e50;
}

.filter-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.filter-field select {
  flex-shrink: 0;
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-field select:hover {
  border-color: #888;
}

.loading,
.error {
  text-align: center;
  font-size: 1.1rem;
  margin: 2rem 0;
}

.error {
  color: #e74c3c;
}

.info-list {
  list-style: none;
  padding: 0;
}

.info-item {
  background: #fff;
  border: 1px solid #e1e1e1;
  border-radius: 6px;
  padding: 1rem 1.2rem;
  margin-bottom: 1rem;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.info-title {
  margin: 0 0 0.5rem;
  font-weight: 600;
  color: #34495e;
}

.info-theme {
  margin-left: 0.6rem;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.info-content {
  margin: 0;
  line-height: 1.6;
  color: #555;
}
</style>
