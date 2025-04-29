<script setup lang="ts">
/**
 * A reusable card component for displaying information content
 */
import { defineProps, defineEmits } from 'vue'

interface InfoCard {
  cardClass?: string
  to?: string
  clickable?: boolean
}

const props = defineProps<InfoCard>()

const emit = defineEmits(['click'])

/**
 * Handles click on the card
 */
const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<template>
  <div :class="['info-card', cardClass, { clickable: clickable }]" @click="handleClick">
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.info-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0.3rem 1rem 0.3rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  aspect-ratio: 1/1;
  width: 85%;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.card-content {
  width: 100%;
}
</style>
