<script setup lang="ts">
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'medium',
  },
  withBackground: {
    type: Boolean,
    default: false,
  },
})

const getIconDetails = (type: string) => {
  switch (type.toLowerCase()) {
    case 'hospital':
      return { color: '#ff5252', faIcon: 'fa-hospital' }
    case 'shelter':
      return { color: '#4caf50', faIcon: 'fa-home' }
    case 'defibrillator':
      return { color: '#2196f3', faIcon: 'fa-heartbeat' }
    case 'water_station':
      return { color: '#03a9f4', faIcon: 'fa-tint' }
    case 'food_central':
      return { color: '#ff9800', faIcon: 'fa-utensils' }
    case 'meeting_place':
      return { color: '#9c27b0', faIcon: 'fa-users' }
    case 'affected_areas':
      return { color: '#ff5252', faIcon: 'fa-exclamation-triangle' }
    default:
      return { color: '#757575', faIcon: 'fa-question' }
  }
}
</script>

<template>
  <div class="poi-icon" :class="[`size-${size}`, { 'with-background': props.withBackground }]">
    <i
      :class="`fas ${getIconDetails(type).faIcon}`"
      :style="{ color: getIconDetails(type).color }"
    ></i>
  </div>
</template>

<style scoped>
.poi-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  background-color: transparent;
}

.poi-icon.with-background {
  border-radius: 50%;
  background-color: white;
  border: 2px solid rgb(211, 211, 211);
}

.size-small {
  width: 32px;
  height: 32px;
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
