<script setup lang="ts">
import { ref } from 'vue';
import threeDots from '../assets/three-dots-horizontal.svg';
import selectArrow from '../assets/select-arrow.svg';
import searchIcon from '../assets/search.svg';

interface StorageItem {
  id: number;
  name: string;
  expirationDays: number;
  quantity: number;
  unit: string;
  calories?: number;
  category: string;
}

const categories = [
  { id: 'liquid', name: 'Liquid' },
  { id: 'food', name: 'Food' },
  { id: 'tools', name: 'Tools' },
  { id: 'medicine', name: 'Medicine' },
  { id: 'other', name: 'Other' }
];

const sortOptions = [
  { value: '', label: 'Sort by...' },
  { value: 'name', label: 'Name' },
  { value: 'expiration', label: 'Expiration date' },
  { value: 'quantity', label: 'Quantity' }
];

const SUSTAIN_DAYS_GOAL = 14;

const items = ref<StorageItem[]>([
  {
    id: 1,
    name: 'Water',
    expirationDays: 253,
    quantity: 35,
    unit: 'liters',
    calories: 0,
    category: 'liquid'
  },
  {
    id: 2,
    name: 'Crisp bread',
    expirationDays: 7,
    quantity: 6,
    unit: 'pcs',
    calories: 1000,
    category: 'food'
  },
  {
    id: 3,
    name: 'Oatmeal',
    expirationDays: 23,
    quantity: 2,
    unit: 'kg',
    calories: 1500,
    category: 'food'
  },
  {
    id: 4,
    name: 'Canned food',
    expirationDays: 460,
    quantity: 5,
    unit: 'pcs',
    calories: 2000,
    category: 'food'
  },
  {
    id: 5,
    name: 'Matchsticks',
    expirationDays: Infinity,
    quantity: 1,
    unit: 'box',
    calories: 0,
    category: 'tools'
  },
]);

const selectedSort = ref('');
const isDropdownOpen = ref(false);
const checkedCategories = ref<string[]>([]);

const clearFilters = () => {
  checkedCategories.value = [];
};

const daysLeft = ref(13); // Placeholder value, will be calculated by API later

const getExpirationClass = (days: number) => {
  if (days === Infinity) return 'status-good';
  if (days > 61) return 'status-good';
  if (days > 14) return 'status-warning';
  return 'status-danger';
};

const addNewItem = () => {
  console.log('Add new item clicked');
};

const getDaysPercentage = () => {
  return Math.min(100, Math.max(0, (daysLeft.value / SUSTAIN_DAYS_GOAL) * 100));
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};
</script>

<template>
  <div class="storage-container">
    <h1 class="storage-title">Emergency Storage</h1>

    <div class="content-wrapper">
      <div class="filter-sidebar">
        <div class="filter-header">
          <h2>Categories</h2>
          <button class="clear-filters" @click="clearFilters">Clear</button>
        </div>

        <div class="category-list">
          <label v-for="category in categories" :key="category.id" class="category-item">
            <input
              type="checkbox"
              :value="category.id"
              v-model="checkedCategories"
            >
            <span>{{ category.name }}</span>
          </label>
        </div>
      </div>

      <!-- Main content -->
      <div class="main-content">
        <div class="actions-container">
          <div class="sort-section">
            <div class="search-container">
              <div class="search-input-wrapper">
                <img :src="searchIcon" alt="Search" class="search-icon" />
                <input
                  type="text"
                  placeholder="Search items..."
                  class="search-input"
                />
              </div>
            </div>
            <div class="select-container">
              <select
                v-model="selectedSort"
                class="sort-select"
                @click="toggleDropdown()"
                @blur="isDropdownOpen = false">
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <div class="select-arrow" :class="{ 'arrow-open': isDropdownOpen }">
                <img :src="selectArrow" alt="Select Arrow" />
              </div>
            </div>
          </div>

          <div class="days-container">
            <div class="days-circle">
              <svg class="days-progress" viewBox="0 0 36 36">
                <circle class="circle-bg"
                        cx="18" cy="18" r="16"
                        fill="none"
                        stroke="#e0e0e0"
                        stroke-width="3.8" />

                <circle class="circle-progress"
                        cx="18" cy="18" r="16"
                        fill="none"
                        stroke="#4CC790"
                        stroke-width="3.8"
                        stroke-linecap="round"
                        :stroke-dasharray="`${getDaysPercentage() * 100.53 / 100} 100.53`"
                        transform="rotate(-90 18 18)" />
              </svg>
              <div class="days-content">
                <div class="days-number">{{ daysLeft }}/{{ SUSTAIN_DAYS_GOAL }}</div>
                <div class="days-label">days</div>
              </div>
            </div>
          </div>

          <button @click="addNewItem" class="add-button">
            Add item
          </button>
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
                  {{ item.expirationDays === Infinity ? 'Infinite' : `${item.expirationDays} days` }}
                </div>
              </div>

              <div class="item-quantity">
                <div :class="['status-pill']">
                  {{ item.quantity }} {{ item.unit }}
                </div>
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
  background-color: #DBF5FA;
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

.filter-sidebar {
  width: 250px;
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-header h2 {
  font-size: 1.5rem;
  margin: 0;
}

.clear-filters {
  background: transparent;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
}

.clear-filters:hover {
  text-decoration: underline;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
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
  transition: box-shadow 0.2s, border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #18DAFF;
  box-shadow: 0 0 0 3px rgba(76, 199, 144, 0.2);
}

.search-input:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.search-input::placeholder {
  color: #aaa;
}

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
  padding-right: 2rem;
  width: 100%;
  font-size: 1rem;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.sort-select:focus {
  outline: none;
  border-color: #18DAFF;
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
  stroke: #e0e0e0;
  stroke-width: 3.8;
}

.circle-progress {
  fill: none;
  stroke: #4CC790;
  stroke-width: 3.8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
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

.item-expiration-header, .item-quantity-header {
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

.item-expiration, .item-quantity {
  width: 8rem;
  padding: 0 0.5rem;
}

.status-good {
  background-color: #4CC790;
}

.status-warning {
  background-color: #FFD700;
}

.status-danger {
  background-color: #FF6B6B;
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
