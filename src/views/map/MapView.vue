<script setup lang="ts">
import TheMap from '@/components/map/TheMap.vue'
import MapFilter from '@/components/map/MapFilter.vue'
import { ref, onMounted } from 'vue'

const activeFilters = ref<Record<string, boolean>>({})
const isFilterVisible = ref(false)
const screenWidth = ref(window.innerWidth)

const handleFilterChange = (filters: Record<string, boolean>) => {
  activeFilters.value = filters
}

const toggleFilterVisibility = () => {
  isFilterVisible.value = !isFilterVisible.value
}

onMounted(() => {
  window.addEventListener('resize', () => {
    screenWidth.value = window.innerWidth
  })
})
</script>

<template>
  <div class="map-view">
    <!-- Always render the filter component but control visibility with CSS classes -->
    <MapFilter
      class="filter-sidebar"
      :class="{ 'filter-hidden': !isFilterVisible && screenWidth < 768 }"
      @filter-change="handleFilterChange"
    />
    <div class="map-wrapper">
      <button v-if="screenWidth < 768" class="filter-toggle-button" @click="toggleFilterVisibility">
        {{ isFilterVisible ? 'Hide Filters' : 'Show Filters' }}
      </button>
      <TheMap :filters="activeFilters" />
    </div>
  </div>
</template>

<style scoped>
.map-view {
  padding: 32px 128px;
  display: flex;
  flex-direction: row;
  gap: 16px;
  background-color: #ecfbff;
}

.filter-sidebar {
  align-self: flex-start;
  display: block;
}

.filter-hidden {
  display: none !important;
}

.map-wrapper {
  flex-grow: 1;
  height: calc(100vh - 124px); /* Full height minus padding */
  border-radius: 10px;
  overflow: hidden;
}

.filter-toggle-button {
  display: none;
  position: absolute;
  top: 138px;
  left: 32px;
  z-index: 1;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: black;
}

@media (max-width: 768px) {
  .map-view {
    padding: 16px 16px;
    flex-direction: column;
  }

  .map-wrapper {
    flex-grow: 1;
    height: calc(100vh - 108px); /* Full height minus padding */
    border-radius: 10px;
    overflow: hidden;
  }

  .filter-sidebar {
    position: absolute;
    top: 182px;
    left: 32px;
    z-index: 20;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    max-width: 80%;
    max-height: 70vh;
    overflow-y: auto;
  }

  .filter-toggle-button {
    display: block;
  }
}
</style>
