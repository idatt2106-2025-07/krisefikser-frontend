<script setup lang="ts">
defineProps({
  type: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'medium' // small, medium, large
  }
});

const getIconDetails = (type) => {
  switch (type.toLowerCase()) {
    case 'hospital':
      return { color: '#ff5252', faIcon: 'fa-hospital' };
    case 'shelter':
      return { color: '#4caf50', faIcon: 'fa-home' };
    case 'defibrillator':
      return { color: '#2196f3', faIcon: 'fa-heartbeat' };
    case 'water_station':
      return { color: '#03a9f4', faIcon: 'fa-tint' };
    case 'food_central':
      return { color: '#ff9800', faIcon: 'fa-utensils' };
    case 'meeting_place':
      return { color: '#9c27b0', faIcon: 'fa-users' };
    case 'affected_areas':
      return { color: '#ff5252', faIcon: 'fa-exclamation-triangle' };
    default:
      return { color: '#757575', faIcon: 'fa-question' };
  }
};
</script>

<template>
  <div
    class="poi-icon"
    :class="[`size-${size}`]"
  >
    <i :class="`fas ${getIconDetails(type).faIcon}`" :style="{ color: getIconDetails(type).color }"></i>
  </div>
</template>

<style scoped>
.poi-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  background-color: transparent; /* Remove background color */
  /* Optional: Add light background circle */
  /* background-color: rgba(240, 240, 240, 0.8); */
}

.size-small {
  width: 20px;
  height: 20px;
  font-size: 16px;
}

.size-medium {
  width: 30px;
  height: 30px;
  font-size: 20px;
}

.size-large {
  width: 40px;
  height: 40px;
  font-size: 24px;
}
</style>
