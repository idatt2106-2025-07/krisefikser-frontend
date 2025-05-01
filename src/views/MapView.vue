<script setup lang="ts">
import TheMap from '@/components/map/TheMap.vue'
import MapFilter from '@/components/map/MapFilter.vue'
import { ref } from 'vue'

const activeFilters = ref({})

const handleFilterChange = (filters: {}) => {
  activeFilters.value = filters
}
</script>

<template>
  <div class="map-view">
    <MapFilter class="filter-sidebar" @filter-change="handleFilterChange" />
    <div class="map-wrapper">
      <TheMap :filters="activeFilters" />
    </div>
  </div>
</template>

<style scoped>
.map-view {
  margin: 32px 128px;
  display: flex;
  flex-direction: row;
  gap: 16px;
}

.filter-sidebar {
  align-self: flex-start;
}

.map-wrapper {
  flex-grow: 1;
  height: calc(100vh - 124px); /* Full height minus padding */
  border-radius: 10px;
  overflow: hidden;
}
</style>
