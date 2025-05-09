<!-- StorageView.vue (updated) -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import TabBar from '@/components/common/TabBar.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import SortDropdown from '@/components/common/SortDropdown.vue'
import DaysCircle from '@/components/common/DaysCircle.vue'
import FilterSidebar from '@/components/storage/FilterSidebar.vue'
import threeDots from '@/assets/three-dots-horizontal.svg'
import { useStorageItemStore } from '@/stores/storageItemStore.ts'
import { useRouter } from 'vue-router'

const storageItemStore = useStorageItemStore()
const router = useRouter()

const tabs = [
  { path: '/storage', label: 'Household Storage' },
  { path: '/group-storage', label: 'Group Storage' }
]

const categories = [
  { id: 'DRINK', name: 'Drink' },
  { id: 'FOOD', name: 'Food' },
  { id: 'ACCESSORIES', name: 'Accessories' },
]

const sortOptions = [
  { value: '', label: 'Sort by...' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'expirationDate_asc', label: 'Expiration date (earliest first)' },
  { value: 'expirationDate_desc', label: 'Expiration date (latest first)' },
  { value: 'quantity_asc', label: 'Quantity (lowest first)' },
  { value: 'quantity_desc', label: 'Quantity (highest first)' },
]

const SUSTAIN_DAYS_GOAL = 21

const navigateToAddItem = () => {
  router.push('/storage/add-storage-item')
}

const navigateToUpdateItem = (itemId: number) => {
  router.push(`/storage/update/${itemId}`)
}

const selectedSortOption = ref('')
const searchQuery = ref('')
const checkedCategories = ref<string[]>([])

const searchDebounceTimeout = ref<number | null>(null)

const selectedSort = computed(() => {
  if (!selectedSortOption.value) return ''

  const lastUnderscoreIndex = selectedSortOption.value.lastIndexOf('_')
  if (lastUnderscoreIndex === -1) return selectedSortOption.value

  return selectedSortOption.value.substring(0, lastUnderscoreIndex)
})

const sortDirection = computed(() => {
  if (!selectedSortOption.value) return 'asc'
  const parts = selectedSortOption.value.split('_')
  return parts.length > 1 ? parts[1] : 'asc'
})

const items = computed(() => {
  return storageItemStore.aggregatedItems.map((item) => {
    const expirationDate = new Date(item.earliestExpirationDate)
    const today = new Date()
    const diffTime = expirationDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return {
      id: item.itemId,
      name: item.item.name,
      expirationDays: diffDays > 0 ? diffDays : 0,
      quantity: item.totalQuantity,
      unit: item.item.unit,
      calories: item.item.calories,
      category: item.item.type,
    }
  })
})

const daysLeft = ref(13)

watch(searchQuery, () => {
  if (searchDebounceTimeout.value) {
    clearTimeout(searchDebounceTimeout.value)
  }

  searchDebounceTimeout.value = setTimeout(() => {
    applyFiltersSearchAndSort()
  }, 500) as unknown as number
})

// Watch category and sort changes immediately
watch([checkedCategories, selectedSortOption], () => {
  applyFiltersSearchAndSort()
})

// Function to handle search input
const handleSearch = (value: string | Event) => {
  if (
    typeof value === 'object' &&
    value !== null &&
    'target' in value &&
    value.target instanceof HTMLInputElement
  ) {
    searchQuery.value = value.target.value
  } else if (typeof value === 'string') {
    searchQuery.value = value
  }
}

const handleSort = (value: string) => {
  selectedSortOption.value = value
}

const handleFilterClear = () => {
  checkedCategories.value = []
}

// Combined function to apply filters, search, and sort
const applyFiltersSearchAndSort = () => {
  const hasSearchTerm = typeof searchQuery.value === 'string' && searchQuery.value.trim() !== ''
  const hasCategories = checkedCategories.value.length > 0
  const hasSort = selectedSort.value && selectedSort.value !== ''

  // If we have a search term, use the search endpoint with all parameters
  if (hasSearchTerm) {
    storageItemStore.searchAggregatedItems(
      searchQuery.value as string,
      hasCategories ? checkedCategories.value : undefined,
      hasSort ? selectedSort.value : undefined,
      hasSort ? sortDirection.value : 'asc',
    )
    return
  }

  // No search term, but we have categories and/or sort
  if (hasCategories && hasSort) {
    storageItemStore.filterAndSortAggregatedItems(
      checkedCategories.value,
      selectedSort.value,
      sortDirection.value,
    )
  } else if (hasCategories) {
    storageItemStore.filterByItemType(checkedCategories.value)
  } else if (hasSort) {
    storageItemStore.sortAggregatedItems(selectedSort.value, sortDirection.value)
  } else {
    storageItemStore.fetchAggregatedItems()
  }
}

const getExpirationClass = (days: number) => {
  if (days === Infinity) return 'status-good'
  if (days > 61) return 'status-good'
  if (days > 14) return 'status-warning'
  if (days > 0) return 'status-danger'
  return 'status-expired'
}

// Fetch data on component mount
onMounted(async () => {
  await storageItemStore.fetchAggregatedItems()
})
</script>

<template>
  <div class="storage-container">
    <h1 class="storage-title">Emergency Storage</h1>

    <TabBar :tabs="tabs" />

    <div class="content-wrapper">
      <FilterSidebar
        :categories="categories"
        v-model:checked-categories="checkedCategories"
        title="Categories"
        @clear="handleFilterClear"
        sidebar-class="my-filter-sidebar"
        header-class="my-filter-header"
        title-class="my-filter-title"
      />

      <div class="main-content">
        <div class="actions-container">
          <div class="sort-section">
            <SearchBar
              placeholder="Search items..."
              v-model:value="searchQuery"
              @search="handleSearch"
              custom-class="my-search-container"
              input-class="my-custom-input"
            />
            <SortDropdown
              :options="sortOptions"
              v-model:value="selectedSortOption"
              @sort="handleSort"
              container-class="my-dropdown-container"
              select-class="my-dropdown-select"
            />
          </div>

          <div class="days-container">
            <DaysCircle
              :current-days="daysLeft"
              :goal-days="SUSTAIN_DAYS_GOAL"
              container-class="my-days-container"
              circle-class="my-days-circle"
              content-class="my-days-content"
            />
          </div>

          <button class="add-button" @click="navigateToAddItem">Add item</button>
        </div>

        <div v-if="storageItemStore.loading" class="loading-indicator">
          Loading storage items...
        </div>

        <div v-else-if="storageItemStore.error" class="error-message">
          {{ storageItemStore.error }}
        </div>

        <div v-else class="items-container">
          <div class="item-header">
            <div class="item-name-header">Item</div>
            <div class="item-expiration-header">Earliest expiration</div>
            <div class="item-quantity-header">Quantity</div>
            <div class="item-actions-header"></div>
          </div>

          <div class="items-list">
            <div v-if="items.length === 0" class="no-items-message">
              No items found. Try changing your search or filters.
            </div>

            <div v-for="item in items" :key="item.id" class="item-card">
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
              </div>

              <div class="item-expiration">
                <div :class="['status-pill', getExpirationClass(item.expirationDays)]">
                  {{
                    item.expirationDays === Infinity
                      ? 'Infinite'
                      : item.expirationDays <= 0
                        ? 'Expired'
                        : `${item.expirationDays} days`
                  }}
                </div>
              </div>

              <div class="item-quantity">
                <div :class="['status-pill']">{{ item.quantity.toFixed(1) }} {{ item.unit }}</div>
              </div>

              <div class="item-actions">
                <button class="options-button" @click="navigateToUpdateItem(item.id)">
                  <img :src="threeDots" alt="Options" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.storage-container {
  min-height: 100vh;
  background-color: #dbf5fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  font-family: 'Roboto', sans-serif;
}

.storage-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.content-wrapper {
  display: flex;
  width: 100%;
  max-width: 1200px;
  gap: 2rem;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.actions-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin-bottom: 2rem;
}

.sort-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 300px;
}

:deep(.my-dropdown-select) {
  width: 300px;
}

:deep(.my-dropdown-container) {
  width: 300px;
}

.days-container {
  position: relative;
  display: flex;
  align-items: center;
}

.add-button {
  background-color: white;
  border: none;
  border-radius: 9999px;
  padding: 0.5rem 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: box-shadow 0.2s;
  font-size: 1rem;
  color: black;
}

.add-button:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.items-container {
  width: 100%;
  max-width: 800px;
}

.item-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 2rem;
  color: #666;
  font-weight: 500;
}

.item-name-header {
  flex-grow: 1;
}

.item-expiration-header,
.item-quantity-header {
  width: 8rem;
  text-align: center;
}

.item-actions-header {
  width: 3rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-card {
  background-color: white;
  height: 50px;
  border-radius: 10px;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.item-info {
  flex-grow: 1;
}

.item-name {
  font-weight: 500;
}

.item-expiration,
.item-quantity {
  width: 8rem;
  padding: 0 0.5rem;
}

.status-good {
  background-color: #5adf7b;
}

.status-warning {
  background-color: #ffd700;
}

.status-danger {
  background-color: #ff5c5f;
}

.status-expired {
  background-color: lightgrey;
}

.status-pill {
  border-radius: 9999px;
  padding: 0.5rem 0;
  text-align: center;
}

.item-actions {
  width: 3rem;
  display: flex;
  justify-content: center;
}

.options-button {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 50%;
}

.options-button img {
  height: 1.5rem;
  width: 1.5rem;
  display: block;
}

.options-button:hover {
  background-color: lightgrey;
}

.loading-indicator,
.error-message,
.no-items-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.error-message {
  color: #ff5c5f;
}
</style>
