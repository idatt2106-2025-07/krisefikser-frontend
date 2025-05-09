<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useItemStore } from '@/stores/itemStore.ts'
import itemService from '@/services/itemService.ts'

const props = defineProps({
  searchInputSelector: {
    type: String,
    default: '.search-input',
  },
})

const emit = defineEmits(['select'])

const itemStore = useItemStore()
const searchResults = ref<any[]>([])
const showDropdown = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

const debounceTimeout = ref<number | null>(null)

const debouncedSearch = async (term: string) => {
  if (debounceTimeout.value !== null) {
    clearTimeout(debounceTimeout.value)
  }

  // Set a new timeout
  debounceTimeout.value = window.setTimeout(async () => {
    if (term.trim() === '') {
      const items = await itemService.fetchSortedItems()
      searchResults.value = items
    } else {
      const results = await itemService.searchItems(term)
      searchResults.value = results
    }
    showDropdown.value = true
    debounceTimeout.value = null
  }, 300)
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (containerRef.value && !containerRef.value.contains(target)) {
    showDropdown.value = false
  }
}

const selectItem = (item: any) => {
  if (searchInputRef.value) {
    searchInputRef.value.value = item.name

    const inputEvent = new Event('input', { bubbles: true })
    searchInputRef.value.dispatchEvent(inputEvent)
  }

  showDropdown.value = false
  emit('select', item)
}

// Setup event listeners after mount
onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  // Get the search input inside our container
  if (containerRef.value) {
    searchInputRef.value = containerRef.value.querySelector(props.searchInputSelector)

    if (searchInputRef.value) {
      // Listen for focus on the search input
      searchInputRef.value.addEventListener('focus', async () => {
        const items = await itemService.fetchSortedItems()
        searchResults.value = items
        showDropdown.value = true
      })

      // Listen for input changes on the search input
      searchInputRef.value.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement
        debouncedSearch(target.value)
      })
    }
  }
})

// Clean up event listeners
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)

  if (searchInputRef.value) {
    searchInputRef.value.removeEventListener('focus', async () => {})
    searchInputRef.value.removeEventListener('input', () => {})
  }

  if (debounceTimeout.value !== null) {
    clearTimeout(debounceTimeout.value)
  }
})
</script>

<template>
  <div ref="containerRef" class="dropdown-provider-container">
    <slot></slot>
    <div v-if="showDropdown && searchResults.length > 0" class="search-results-dropdown">
      <ul>
        <li
          v-for="item in searchResults"
          :key="item.id"
          @click="selectItem(item)"
          class="search-result-item"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.dropdown-provider-container {
  position: relative;
  width: 100%;
}

.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  z-index: 100;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.search-results-dropdown ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.search-result-item {
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f8f8f8;
}

.search-result-item:last-child {
  border-bottom: none;
}
</style>
