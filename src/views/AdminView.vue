<script setup lang="ts">
import { ref } from 'vue'

// PrimeVue components
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Listbox from 'primevue/listbox'
import Panel from 'primevue/panel'
import Map from '@/components/TheMap.vue'

// Menu logic
const menuItems = ['Manage Map', 'Gamification']
const selectedItem = ref(menuItems[0])

// Add Icon Form state
const showAddIconForm = ref(false)
const iconType = ref('')
const selectedIcon = ref(null)

const iconTypes = [
  'Shelter',
  'Affected Area',
  'Defibrillator',
  'Water Station',
  'Food central',
  'Hospital',
]

const icons = {
  Shelter: [
    { name: 'Home Icon', src: new URL('@/assets/icons/home_icon.svg', import.meta.url).href },
  ],
  'Affected Area': [
    { name: 'Bolt Icon', src: new URL('@/assets/icons/bolt_icon.svg', import.meta.url).href },
  ],
  Other: [
    { name: 'Heart Icon', src: new URL('@/assets/icons/heart_icon.svg', import.meta.url).href },
  ],
}

function handleAddIcon() {
  if (!iconType.value) {
    alert('Please select an icon type.')
    return
  }
  alert(`Icon added: Type - ${iconType.value}`)
  showAddIconForm.value = false
}
</script>

<template>
  <div class="admin-page">
    <h1 class="title">Admin Panel</h1>
    <div class="admin-container">
      <!-- Sidebar -->
      <div class="sidebar">
        <Button
          v-for="item in menuItems"
          :key="item"
          label=" "
          :class="['sidebar-item', { active: item === selectedItem }]"
          @click="selectedItem = item"
        >
          <template #default>{{ item }}</template>
        </Button>
      </div>

      <!-- Content -->
      <div class="content">
        <Panel :header="selectedItem">
          <div v-if="selectedItem === 'Manage Map'">
            <p>Manage the map settings and icons here.</p>

            <div>
              <Map />
            </div>

            <div class="button-group">
              <Button label="Add Map Icon" @click="showAddIconForm = true" />
              <Button label="Remove Map Icon" severity="danger" />
              <Button label="Save Changes" severity="success" />
            </div>

            <!-- Add Map Icon Form -->
            <div v-if="showAddIconForm" class="add-icon-form">
              <div class="dropdown-container">
                <!-- Icon Type Dropdown -->
                <div class="dropdown-item">
                  <label for="iconType">Select Icon Type:</label>
                  <Dropdown
                    v-model="iconType"
                    :options="iconTypes"
                    placeholder="-- Select Icon Type --"
                    class="smooth-font"
                  />
                </div>
              </div>

              <div class="form-buttons">
                <Button label="Submit" :disabled="!iconType" @click="handleAddIcon" />
                <Button label="Cancel" severity="secondary" @click="showAddIconForm = false" />
              </div>
            </div>
          </div>

          <div v-else-if="selectedItem === 'Gamification'">
            <p>Manage gamification settings here.</p>
            <Button label="Enable Feature" />
            <Button label="Disable Feature" severity="danger" />
          </div>
        </Panel>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  background-color: #dbf5fa; /* Main background color */
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Roboto', sans-serif; /* Smooth font */
  -webkit-font-smoothing: antialiased; /* Smoother font rendering */
  -moz-osx-font-smoothing: grayscale;
}

.title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
}

.admin-container {
  display: flex;
  max-width: 900px;
  margin: 0 auto;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.sidebar {
  width: 200px;
  display: flex;
  flex-direction: column;
  border-right: 2px solid black;
  background-color: #fff;
}

.sidebar-item {
  padding: 1rem;
  border-bottom: 1px solid black;
  cursor: pointer;
  font-weight: bold;
  text-align: center;
  transition:
    background-color 0.3s ease,
    color 0.3s ease; /* Smooth hover transition */
}

.sidebar-item:hover {
  background-color: #18daff80;
  color: white;
}

.sidebar-item.active {
  background-color: #18daff80;
  color: white;
}

.content {
  flex: 1;
  padding: 2rem;
  text-align: center;
}

button {
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #18daff80; /* Updated button background color */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease; /* Smooth hover and click effects */
}

button:hover {
  background-color: #18daff; /* Slightly darker blue on hover */
  transform: scale(1.05); /* Slight zoom effect on hover */
}

button:active {
  transform: scale(0.95); /* Slight shrink effect on click */
}

button:disabled {
  background-color: #b3e4ed; /* Disabled button color */
  color: #666;
  cursor: not-allowed;
}

.add-icon-form {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  text-align: left;
}

.add-icon-form h3 {
  margin-bottom: 1rem;
}

.add-icon-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.dropdown-container {
  display: flex;
  gap: 1rem; /* Space between the two dropdowns */
  align-items: flex-start;
}

.dropdown-item {
  flex: 1; /* Make both dropdowns take equal space */
}

.add-icon-form select,
.custom-dropdown {
  position: relative;
  cursor: pointer;
}

.dropdown-selected {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  height: 50px; /* Make it square */
  display: flex;
  align-items: center;
}

.dropdown-selected.disabled {
  background-color: #f0f0f0;
  color: #aaa;
  cursor: not-allowed;
}

.dropdown-selected.disabled:hover {
  background-color: #f0f0f0; /* Prevent hover effect when disabled */
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  z-index: 10;
  max-height: 150px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}

.icon-preview {
  width: 20px;
  height: 20px;
  margin-right: 0.5rem;
}

.sidebar {
  width: 200px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-right: 2px solid black;
}

.sidebar-item.p-button {
  justify-content: center;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.dropdown-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.icon-preview {
  width: 20px;
  height: 20px;
  margin-right: 0.5rem;
}

.icon-preview-large {
  width: 50px;
  height: 50px;
  margin-top: 10px;
}

.icon-option {
  display: flex;
  align-items: center;
}
</style>
