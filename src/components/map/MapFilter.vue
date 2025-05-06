<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import '@fortawesome/fontawesome-free/css/all.css'
import MapIcon from '@/components/map/MapIcon.vue'

const filters = ref({
  affected_areas: true,
  shelter: true,
  defibrillator: true,
  water_station: true,
  food_central: true,
  hospital: true,
  meeting_place: true,
})

const emit = defineEmits(['filter-change'])

watch(
  filters,
  (newValue) => {
    emit('filter-change', { ...newValue })
  },
  { deep: true },
)

onMounted(() => {
  emit('filter-change', { ...filters.value })
})
</script>
<template>
  <div class="filter-container">
    <h2 class="filter-title">Filters</h2>

    <div class="filter-item">
      <input type="checkbox" id="affected-areas" v-model="filters.affected_areas" />
      <MapIcon type="affected_areas" size="small" />
      <label for="affected-areas">Affected Areas</label>
    </div>

    <div class="filter-item">
      <input type="checkbox" id="hospital" v-model="filters.hospital" />
      <MapIcon type="hospital" size="small" />
      <label for="hospital">Hospital</label>
    </div>

    <div class="filter-item">
      <input type="checkbox" id="shelter" v-model="filters.shelter" />
      <MapIcon type="shelter" size="small" />
      <label for="shelter">Shelter</label>
    </div>

    <div class="filter-item">
      <input type="checkbox" id="defibrillator" v-model="filters.defibrillator" />
      <MapIcon type="defibrillator" size="small" />
      <label for="defibrillator">Defibrillator</label>
    </div>

    <div class="filter-item">
      <input type="checkbox" id="water-station" v-model="filters.water_station" />
      <MapIcon type="water_station" size="small" />
      <label for="water-station">Water Station</label>
    </div>

    <div class="filter-item">
      <input type="checkbox" id="food-central" v-model="filters.food_central" />
      <MapIcon type="food_central" size="small" />
      <label for="food-central">Food Central</label>
    </div>

    <div class="filter-item">
      <input type="checkbox" id="meeting-place" v-model="filters.meeting_place" />
      <MapIcon type="meeting_place" size="small" />
      <label for="meeting-place">Meeting Place</label>
    </div>
  </div>
</template>

<style scoped>
.filter-container {
  background: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 180px;
}

.filter-title {
  margin-bottom: 16px;
  font-size: 1.2rem;
  font-weight: bold;
}

.filter-item {
  margin-bottom: 4px;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

input[type='checkbox'] {
  margin-right: 8px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

label {
  padding-top: 8px;
  margin-left: 8px;
  cursor: pointer;
}
</style>
