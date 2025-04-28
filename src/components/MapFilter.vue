<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

const filters = ref({
  affectedAreas: true,
  shelter: true,
  defibrillator: true,
  waterStation: true,
  foodCentral: true,
  hospital: true
});

const emit = defineEmits(['filter-change']);

// Use watch instead of manual toggle
watch(filters, (newValue) => {
  emit('filter-change', { ...newValue });
}, { deep: true });

onMounted(() => {
  emit('filter-change', { ...filters.value });
});
</script>

<template>
  <div class="filter-container">
    <h2 class="filter-title">Filters</h2>

    <div class="filter-item">
      <input type="checkbox" id="affected-areas" v-model="filters.affectedAreas" />
      <label for="affected-areas">Affected Areas</label>
    </div>

    <div class="filter-item">
      <input type="checkbox" id="shelter" v-model="filters.shelter" />
      <label for="shelter">Shelter</label>
    </div>

    <div class="filter-item">
      <input type="checkbox" id="defibrillator" v-model="filters.defibrillator" />
      <label for="defibrillator">Defibrillator</label>
    </div>

    <div class="filter-item">
      <input type="checkbox" id="water-station" v-model="filters.waterStation" />
      <label for="water-station">Water station</label>
    </div>

    <div class="filter-item">
      <input type="checkbox" id="food-central" v-model="filters.foodCentral" />
      <label for="food-central">Food central</label>
    </div>

    <div class="filter-item">
      <input type="checkbox" id="hospital" v-model="filters.hospital" />
      <label for="hospital">Hospital</label>
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
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.2rem;
  font-weight: bold;
}

.filter-item {
  margin-bottom: 12px;
  display: flex;
  flex-direction: row;
  cursor: pointer;
  user-select: none;
}

input[type="checkbox"] {
  margin-right: 8px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

label {
  margin-top: 2px;
  cursor: pointer;

}
</style>
