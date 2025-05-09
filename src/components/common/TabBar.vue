<!-- TabBar.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { path: '/storage', name: 'Household Storage' },
  { path: '/group-storage', name: 'Group Storage' },
]

const currentPath = computed(() => route.path)

const isActive = (path: string) => {
  return currentPath.value.startsWith(path)
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="tab-bar-container">
    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        :class="['tab', { active: isActive(tab.path) }]"
        @click="navigateTo(tab.path)"
      >
        {{ tab.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-bar-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
  margin-top: 1rem;
}

.tab-bar {
  display: flex;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 450px;
}

.tab {
  flex: 1;
  padding: 0.75rem 2rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
  text-align: center;
  white-space: nowrap;
}

.tab:hover {
  background-color: #f1f9fa;
}

.tab.active {
  background-color: #5acbdd;
  color: white;
}
</style>
