<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import selectArrow from '../assets/select-arrow.svg'

const props = defineProps({
  options: {
    type: Array as () => { value: string; label: string }[],
    required: true,
  },
  value: {
    type: String,
    default: '',
  },
  customClass: {
    type: String,
    default: '',
  },
  selectClass: {
    type: String,
    default: '',
  },
  containerClass: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:value', 'sort'])

const selectedValue = ref(props.value)
const isDropdownOpen = ref(false)

// Watch for external value changes
watch(
  () => props.value,
  (newValue) => {
    selectedValue.value = newValue
  },
)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const updateSort = (event: Event) => {
  const target = event.target as HTMLSelectElement
  selectedValue.value = target.value
  emit('update:value', selectedValue.value)
  emit('sort', selectedValue.value)
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}
</script>

<template>
  <div :class="['select-container', containerClass]">
    <select
      :value="selectedValue"
      :class="['sort-select', selectClass]"
      @change="updateSort"
      @click="toggleDropdown()"
      @blur="closeDropdown()"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <div :class="['select-arrow', { 'arrow-open': isDropdownOpen }]">
      <img :src="selectArrow" alt="Select Arrow" />
    </div>
  </div>
</template>

<style scoped>
.select-container {
  position: relative;
  width: 150px;
}

.sort-select {
  appearance: none;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  width: 100%;
  font-size: 1rem;
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
}

.sort-select:focus {
  outline: none;
  border-color: #18daff;
  box-shadow: 0 0 0 3px rgba(76, 199, 144, 0.2);
}

.sort-select:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.select-arrow {
  pointer-events: none;
  position: absolute;
  top: 0;
  right: 0.5rem;
  bottom: 0;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
  transform-origin: 50% 50%;
}

.select-arrow.arrow-open {
  transform: rotate(180deg);
}

.select-arrow img {
  height: 2.5rem;
  width: 2.5rem;
  display: block;
}
</style>
