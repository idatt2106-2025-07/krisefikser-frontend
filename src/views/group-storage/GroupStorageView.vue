<!-- GroupStorageView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import TabBar from '@/components/common/TabBar.vue'
import SortDropdown from '@/components/common/SortDropdown.vue'
import FilterSidebar from '@/components/storage/FilterSidebar.vue'
import threeDots from '@/assets/three-dots-horizontal.svg'
import { useRouter } from 'vue-router'
import { useGroupStorageItemStore } from '@/stores/groupStorageItemStore'

const router = useRouter()
const groupStorageItemStore = useGroupStorageItemStore()

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

const selectedSortOption = ref('')
const checkedCategories = ref<string[]>([])

// Computed properties for sorting
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

// Get items with expiration days calculated
const items = computed(() => {
  return groupStorageItemStore.groupItems.map((item) => {
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

const navigateToGroupItemUpdate = (itemId: number) => {
  router.push(`/group-storage/update/${itemId}`)
}

const handleSort = (value: string) => {
  selectedSortOption.value = value
  applyFiltersAndSort()
}

const handleFilterClear = () => {
  checkedCategories.value = []
  applyFiltersAndSort()
}

const getExpirationClass = (days: number) => {
  if (days === Infinity) return 'status-good'
  if (days > 61) return 'status-good'
  if (days > 14) return 'status-warning'
  if (days > 0) return 'status-danger'
  return 'status-expired'
}

// Watch for changes in filter and sort options
watch([checkedCategories, selectedSortOption], () => {
  applyFiltersAndSort()
})

// Apply filters and sort when changed
const applyFiltersAndSort = () => {
  const hasCategories = checkedCategories.value.length > 0
  const hasSort = selectedSort.value && selectedSort.value !== ''

  if (hasCategories && hasSort) {
    groupStorageItemStore.filterAndSortGroupItems(
      checkedCategories.value,
      selectedSort.value,
      sortDirection.value,
    )
  } else if (hasCategories) {
    groupStorageItemStore.filterByItemType(checkedCategories.value)
  } else if (hasSort) {
    groupStorageItemStore.sortGroupItems(selectedSort.value, sortDirection.value)
  } else {
    groupStorageItemStore.fetchGroupItems()
  }
}

// Load data on component mount
onMounted(async () => {
  await groupStorageItemStore.fetchGroupItems()
})
</script>

<template>
  <div class="storage-container">
    <h1 class="storage-title">Emergency Storage</h1>

    <TabBar />

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
            <SortDropdown
              :options="sortOptions"
              v-model:value="selectedSortOption"
              @sort="handleSort"
              container-class="my-dropdown-container"
              select-class="my-dropdown-select"
            />
          </div>
        </div>

        <div v-if="groupStorageItemStore.loading" class="loading-indicator">
          Loading group storage items...
        </div>

        <div v-else-if="groupStorageItemStore.error" class="error-message">
          {{ groupStorageItemStore.error }}
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
              No group items found. Try changing your search or filters.
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
                <button class="options-button" @click="navigateToGroupItemUpdate(item.id)">
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

/* Media Queries for Responsive Design */

/* Large Mobile Devices (up to 768px) */
@media (max-width: 768px) {
  .storage-title {
    font-size: 2.25rem;
    margin-bottom: 0.75rem;
  }

  .content-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .actions-container {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .sort-section {
    width: 100%;
  }

  :deep(.my-dropdown-select),
  :deep(.my-dropdown-container) {
    width: 100%;
  }

  .item-header {
    padding: 0.75rem 1rem;
  }

  .item-card {
    padding: 0.75rem 1rem;
    height: auto;
    min-height: 50px;
  }

  .item-expiration-header,
  .item-quantity-header {
    width: 6rem;
  }

  .item-expiration,
  .item-quantity {
    width: 6rem;
  }
}

/* Small Mobile Devices (up to 480px) */
@media (max-width: 480px) {
  .storage-container {
    padding: 1rem 0.5rem;
  }

  .storage-title {
    font-size: 1.75rem;
  }

  .item-header {
    display: none; /* Hide headers on very small screens */
  }

  .item-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 1rem;
    height: auto;
  }

  .item-info {
    width: 100%;
  }

  .item-name {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .item-expiration,
  .item-quantity {
    width: 100%;
    padding: 0;
    margin-bottom: 0.25rem;
  }

  .status-pill {
    width: 100%;
    text-align: left;
    padding: 0.25rem 0.5rem;
  }

  .item-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .options-button {
    padding: 0.5rem;
  }

  .options-button img {
    height: 1.25rem;
    width: 1.25rem;
  }
}

/* Specific styling for tablets (between 481px and 992px) */
@media (min-width: 481px) and (max-width: 992px) {
  .storage-container {
    padding: 1.5rem 1rem;
  }

  .content-wrapper {
    max-width: 100%;
  }

  .items-container {
    max-width: 100%;
  }

  .item-expiration-header,
  .item-quantity-header {
    width: 7rem;
  }

  .item-expiration,
  .item-quantity {
    width: 7rem;
  }
}

/* Adjustments for FilterSidebar on mobile */
@media (max-width: 768px) {
  :deep(.my-filter-sidebar) {
    width: 100%;
    margin-bottom: 1rem;
    position: static !important; /* Override any sticky/fixed positioning */
    top: auto !important; /* Reset top value */
    height: auto !important; /* Allow height to be determined by content */
    overflow: visible !important; /* Ensure content isn't cut off */
  }

  /* Target any sticky container that might be inside the sidebar */
  :deep(.my-filter-sidebar > div),
  :deep(.my-filter-sidebar > aside) {
    position: static !important;
    top: auto !important;
    height: auto !important;
  }
}
</style>
