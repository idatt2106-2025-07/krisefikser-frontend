<script setup lang="ts">
import { computed, defineProps } from 'vue';

const props = defineProps({
  currentDays: {
    type: Number,
    required: true
  },
  goalDays: {
    type: Number,
    default: 14
  },
  containerClass: {
    type: String,
    default: ''
  },
  circleClass: {
    type: String,
    default: ''
  },
  contentClass: {
    type: String,
    default: ''
  },
  numberClass: {
    type: String,
    default: ''
  },
  labelClass: {
    type: String,
    default: ''
  },
  progressColor: {
    type: String,
    default: '#5ADF7B'
  },
  bgColor: {
    type: String,
    default: '#FF5C5F'
  }
});

const daysPercentage = computed(() => {
  return Math.min(100, Math.max(0, (props.currentDays / props.goalDays) * 100));
});

const circleCircumference = 100.53;

const strokeDasharray = computed(() => {
  return `${daysPercentage.value * circleCircumference / 100} ${circleCircumference}`;
});
</script>

<template>
  <div :class="['days-container', containerClass]">
    <div :class="['days-circle', circleClass]">
      <svg class="days-progress" viewBox="0 0 36 36">
        <circle class="circle-bg"
                cx="18" cy="18" r="16"
                fill="none"
                :stroke="bgColor"
                stroke-width="3.8" />

        <circle class="circle-progress"
                cx="18" cy="18" r="16"
                fill="none"
                :stroke="progressColor"
                stroke-width="3.8"
                stroke-linecap="round"
                :stroke-dasharray="strokeDasharray"
                transform="rotate(-90 18 18)" />
      </svg>
      <div :class="['days-content', contentClass]">
        <div :class="['days-number', numberClass]">{{ currentDays }}/{{ goalDays }}</div>
        <div :class="['days-label', labelClass]">days</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.days-container {
  position: relative;
  display: flex;
  align-items: center;
}

.days-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  z-index: 1;
  position: relative;
}

.days-content {
  text-align: center;
  position: absolute;
  z-index: 2;
}

.days-number {
  font-size: 1rem;
  font-weight: bold;
}

.days-label {
  font-size: 0.75rem;
}

.days-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: none;
}

.circle-progress {
  fill: none;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
}
</style>
