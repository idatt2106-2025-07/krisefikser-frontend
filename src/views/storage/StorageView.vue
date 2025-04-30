<script setup lang="ts">
import { ref } from 'vue'
import SearchBar from '@/components/common/SearchBar.vue'
import SortDropdown from '@/components/common/SortDropdown.vue'
import DaysCircle from '@/components/common/DaysCircle.vue'
import FilterSidebar from '@/components/storage/FilterSidebar.vue'
import threeDots from '@/assets/three-dots-horizontal.svg'

interface StorageItem {
  id: number
  name: string
  expirationDays: number
  quantity: number
  unit: string
  calories?: number
  category: string
}

const categories = [
  { id: 'liquid', name: 'Liquid' },
  { id: 'food', name: 'Food' },
  { id: 'tools', name: 'Tools' },
  { id: 'medicine', name: 'Medicine' },
  { id: 'other', name: 'Other' },
]

const sortOptions = [
  { value: '', label: 'Sort by...' },
  { value: 'name', label: 'Name' },
  { value: 'expiration', label: 'Expiration date' },
  { value: 'quantity', label: 'Quantity' },
]

const SUSTAIN_DAYS_GOAL = 21

const items = ref<StorageItem[]>([
  {
    id: 1,
    name: 'Water',
    expirationDays: 253,
    quantity: 35,
    unit: 'liters',
    calories: 0,
    category: 'liquid',
  },
  {
    id: 2,
    name: 'Crisp bread',
    expirationDays: 7,
    quantity: 6,
    unit: 'pcs',
    calories: 1000,
    category: 'food',
  },
  {
    id: 3,
    name: 'Oatmeal',
    expirationDays: 23,
    quantity: 2,
    unit: 'kg',
    calories: 1500,
    category: 'food',
  },
  {
    id: 4,
    name: 'Canned food',
    expirationDays: 460,
    quantity: 5,
    unit: 'pcs',
    calories: 2000,
    category: 'food',
  },
  {
    id: 5,
    name: 'Matchsticks',
    expirationDays: Infinity,
    quantity: 1,
    unit: 'box',
    calories: 0,
    category: 'tools',
  },
])

const selectedSort = ref('')
const searchQuery = ref('')
const checkedCategories = ref<string[]>([])

// Handler for filter clear event
const handleFilterClear = () => {
  console.log('Filters cleared')
  // Add any additional logic here
}

// Placeholder value, will be calculated by API later
const daysLeft = ref(13)

const getExpirationClass = (days: number) => {
  if (days === Infinity) return 'status-good'
  if (days > 61) return 'status-good'
  if (days > 14) return 'status-warning'
  return 'status-danger'
}

// Function to handle search
const handleSearch = (value: string) => {
  searchQuery.value = value
  // Add search logic here
  console.log('Searching for:', value)
}

// Function to handle sort selection
const handleSort = (value: string) => {
  selectedSort.value = value
  // Add sorting logic here
  console.log('Sorting by:', value)
}
</script>

<template>
  <div class="storage-container">
    <h1 class="storage-title">Emergency Storage</h1>

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
              v-model:value="selectedSort"
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

          <button class="add-button">Add item</button>
        </div>

        <div class="items-container">
          <div class="item-header">
            <div class="item-name-header">Item</div>
            <div class="item-expiration-header">Earliest expiration</div>
            <div class="item-quantity-header">Quantity</div>
            <div class="item-actions-header"></div>
          </div>

          <div class="items-list">
            <div v-for="item in items" :key="item.id" class="item-card">
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
              </div>

              <div class="item-expiration">
                <div :class="['status-pill', getExpirationClass(item.expirationDays)]">
                  {{
                    item.expirationDays === Infinity ? 'Infinite' : `${item.expirationDays} days`
                  }}
                </div>
              </div>

              <div class="item-quantity">
                <div :class="['status-pill']">{{ item.quantity }} {{ item.unit }}</div>
              </div>

              <div class="item-actions">
                <button class="options-button">
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
  margin-bottom: 3rem;
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
</style>
