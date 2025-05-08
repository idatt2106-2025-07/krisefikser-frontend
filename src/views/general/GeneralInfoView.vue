<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

interface GeneralInfoResponse {
  id: number
  title: string
  content: string
  theme: string
}

const allInfos = ref<GeneralInfoResponse[]>([])
const error = ref<string | null>(null)
const isLoading = ref(false)

// 👉 replace single-active with multi-active
// const activeCategory = ref<string | null>(null)
const activeCategories = ref<string[]>([])

const categories = [
  { key: 'BEFORE_CRISIS', label: 'Before Crisis', color: '#D0E8FF' },
  { key: 'DURING_CRISIS', label: 'During Crisis', color: '#FFF4D6' },
  { key: 'AFTER_CRISIS', label: 'After Crisis', color: '#E6FFE6' },
]

const grouped = computed(() => {
  const groups: Record<string, GeneralInfoResponse[]> = {}
  categories.forEach((cat) => (groups[cat.key] = []))
  allInfos.value.forEach((info) => {
    const key = info.theme.toUpperCase()
    if (groups[key]) groups[key].push(info)
  })
  return groups
})

// 👉 toggle only the clicked key
function toggleCategory(key: string) {
  const idx = activeCategories.value.indexOf(key)
  if (idx >= 0) {
    activeCategories.value.splice(idx, 1)
  } else {
    activeCategories.value.push(key)
  }
}

async function fetchAllInfos() {
  isLoading.value = true
  error.value = null
  try {
    const res = await axios.get<GeneralInfoResponse[]>('/api/general-info/all', {
      withCredentials: true,
    })
    allInfos.value = res.data
  } catch (err: any) {
    error.value = 'Failed to load general information.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchAllInfos)
</script>

<template>
  <div class="general-info">
    <h2 class="page-title">General Information</h2>

    <div v-if="isLoading" class="status">Loading…</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else class="categories">
      <div
        v-for="cat in categories"
        :key="cat.key"
        class="card"
        :class="{ active: activeCategories.includes(cat.key) }"
        @click="toggleCategory(cat.key)"
      >
        <div class="header" :style="{ backgroundColor: cat.color }">
          {{ cat.label }}
          <span class="icon">
            {{ activeCategories.includes(cat.key) ? '−' : '+' }}
          </span>
        </div>

        <transition name="accordion">
          <div v-if="activeCategories.includes(cat.key)" class="content">
            <div v-if="grouped[cat.key]?.length">
              <div v-for="info in grouped[cat.key]" :key="info.id" class="item">
                <h3>{{ info.title }}</h3>
                <p>{{ info.content }}</p>
              </div>
            </div>
            <div v-else class="no-info">No information available for this category</div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.general-info {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.status {
  text-align: center;
  padding: 20px;
  font-size: 16px;
}

.status.error {
  color: #e53e3e;
}

.categories {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.card {
  width: 100%;
  max-width: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card.active {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.header {
  padding: 15px 20px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: background-color 0.3s;
}

.icon {
  font-weight: bold;
  font-size: 20px;
  line-height: 1;
}

.content {
  background-color: white;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0;
  overflow: hidden;
}

.item {
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.item:last-child {
  border-bottom: none;
}

.item h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.item p {
  margin: 0;
  line-height: 1.5;
  color: #555;
}

.no-info {
  padding: 20px;
  text-align: center;
  color: #777;
  font-style: italic;
}

/* Animation for accordion */
.accordion-enter-active,
.accordion-leave-active {
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
