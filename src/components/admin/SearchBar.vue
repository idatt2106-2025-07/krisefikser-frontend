<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Search...',
  },
  value: {
    type: String,
    default: '',
  },
  customClass: {
    type: String,
    default: '',
  },
  inputClass: {
    type: String,
    default: '',
  },
  wrapperClass: {
    type: String,
    default: '',
  },
  iconClass: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:value', 'search'])

const searchValue = ref(props.value)

const updateSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchValue.value = target.value
  emit('update:value', searchValue.value)
  emit('search', searchValue.value)
}
</script>

<template>
  <div :class="['search-container', customClass]">
    <div :class="['search-input-wrapper', wrapperClass]">
      <img alt="Search" :class="['search-icon', iconClass]" />
      <input
        type="text"
        :placeholder="placeholder"
        :class="['search-input', inputClass]"
        :value="searchValue"
        @input="updateSearch"
      />
    </div>
  </div>
</template>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 1.2rem;
  height: 1.2em;
  pointer-events: none;
  z-index: 1;
  opacity: 0.5;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e0e0e0;
  font-size: 1rem;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #18daff;
  box-shadow: 0 0 0 3px rgba(76, 199, 144, 0.2);
}

.search-input:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.search-input::placeholder {
  color: #aaa;
}
</style>
