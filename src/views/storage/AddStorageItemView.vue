<!-- AddStorageItemView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SearchBar from '@/components/common/SearchBar.vue'
import SearchDropdown from '@/components/storage/SearchDropdown.vue'
import { useStorageItemStore } from '@/stores/storageItemStore.ts'
import type { Item } from '@/types/storageItem'

const router = useRouter()
const storageItemStore = useStorageItemStore()

const selectedItem = ref<Item | null>(null)
const quantity = ref(1)
const expirationDate = ref('')
const isSubmitting = ref(false)
const formError = ref('')
const formSuccess = ref(false)

const navigateToAddItem = () => {
  router.push('/storage/add-item')
}

const navigateToStorage = () => {
  router.push('/storage')
}

// Handle item selection from dropdown
const handleSelectItem = (item: any) => {
  selectedItem.value = item
}

// Handle quantity decrease
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// Handle quantity increase
const increaseQuantity = () => {
  quantity.value++
}

// Handle quantity input change
const handleQuantityChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value)
  quantity.value = isNaN(value) || value < 0 ? 1 : value
}

// Validate form before submission
const validateForm = () => {
  if (!selectedItem.value) {
    formError.value = 'Please select a product'
    return false
  }

  if (!expirationDate.value) {
    formError.value = 'Please enter an expiration date'
    return false
  }

  // Basic date validation
  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/
  if (!datePattern.test(expirationDate.value)) {
    formError.value = 'Please enter a valid date in MM/DD/YYYY format'
    return false
  }

  formError.value = ''
  return true
}

const formatDateForApi = (dateString: string) => {
  const [month, day, year] = dateString.split('/')
  return `${year}-${month}-${day}`
}

// Handle form submission
const submitForm = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  formError.value = ''
  formSuccess.value = false

  try {
    if (selectedItem.value === null) {
      formError.value = 'Please select a product'
      return
    }

    await storageItemStore.addStorageItem({
      itemId: selectedItem.value.id,
      quantity: quantity.value,
      expirationDate: formatDateForApi(expirationDate.value),
    })

    formSuccess.value = true

    // Reset form
    selectedItem.value = null
    quantity.value = 1
    expirationDate.value = ''

    // Redirect to inventory after short delay
    setTimeout(() => {
      router.push('/storage')
    }, 1500)
  } catch (error) {
    formError.value = 'Failed to add item to inventory. Please try again.'
    console.error('Error adding item:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="add-item-container">
    <div class="add-item-card">
      <h1 class="title">Add Item To Emergency Storage</h1>

      <div v-if="formSuccess" class="success-message">
        Item added successfully! Redirecting to storage...
      </div>

      <div v-if="formError" class="error-message">
        {{ formError }}
      </div>

      <div class="form-group">
        <label for="productName">Product name</label>
        <div class="select-container">
          <SearchDropdown @select="handleSelectItem">
            <SearchBar placeholder="Search for a product..." />
          </SearchDropdown>
          <div v-if="selectedItem" class="selected-item">Selected: {{ selectedItem.name }}</div>
        </div>
      </div>

      <div class="form-group helper-section">
        <p class="helper-text">
          Cant find an item? Press the button below to add a new item to the list
        </p>
        <div class="button-container">
          <button type="button" class="add-item-button" @click="navigateToAddItem">
            Add new item
          </button>
        </div>
      </div>

      <div class="form-group">
        <label for="quantity">Quantity</label>
        <div class="quantity-control">
          <button type="button" class="quantity-btn" @click="decreaseQuantity">-</button>
          <input
            type="text"
            id="quantity"
            :value="quantity"
            @input="handleQuantityChange"
            :disabled="isSubmitting"
          />
          <span v-if="selectedItem" class="unit-display">{{ selectedItem.unit }}</span>

          <button type="button" class="quantity-btn" @click="increaseQuantity">+</button>
        </div>
      </div>

      <div class="form-group">
        <label for="expirationDate">Expiration date (MM/DD/YYYY)</label>
        <input
          type="text"
          id="expirationDate"
          v-model="expirationDate"
          placeholder="MM/DD/YYYY"
          :disabled="isSubmitting"
        />
      </div>

      <div class="form-actions">
        <button class="add-button" @click="submitForm" :disabled="isSubmitting || !selectedItem">
          <span v-if="isSubmitting">Adding...</span>
          <span v-else>Add Item</span>
        </button>
        <button class="cancel-button" @click="navigateToStorage" :disabled="isSubmitting">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.add-item-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #d9f2f7;
  font-family: Arial, sans-serif;
}

.add-item-card {
  background-color: white;
  border-radius: 16px;
  padding: 40px;
  width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.title {
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 40px;
  color: #333;
}

.form-group {
  margin-bottom: 40px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

input:hover,
#quantity:hover,
input#expirationDate:hover {
  border-color: #b8b8b8;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #18daff;
  box-shadow: 0 0 0 3px rgba(76, 199, 144, 0.2);
}

.select-container {
  position: relative;
}

.selected-item {
  margin-top: 8px;
  padding: 8px;
  background-color: #f3faf4;
  border-radius: 6px;
  font-size: 14px;
  color: #308642;
}

.button-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 10px;
}

.search-results-dropdown ul {
  margin: 0;
  padding: 0;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #eee;
  color: black;
  border: none;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.quantity-control input {
  width: 60px;
  text-align: center;
  margin: 0 10px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.add-button {
  background-color: #5adf7b;
  border: none;
  color: #333;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    background-color 0.2s,
    opacity 0.2s;
}

.add-button:hover {
  background-color: limegreen;
}

.add-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background-color: #ffecec;
  color: #e74c3c;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.success-message {
  background-color: #e9f7ef;
  color: #5adf7b;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.helper-section {
  margin-top: -30px;
  margin-bottom: 30px;
}

.helper-text {
  font-weight: normal;
  margin-bottom: 8px;
  color: #333;
  font-size: 1rem;
  opacity: 0.9;
}

.add-item-button {
  background-color: #5adf7b;
  border: none;
  color: #333;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-item-button:hover {
  background-color: limegreen;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

.cancel-button {
  background-color: #e0e0e0;
  border: none;
  color: #333;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    background-color 0.2s,
    opacity 0.2s;
}

.cancel-button:hover {
  background-color: #d0d0d0;
}

.cancel-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.unit-display {
  margin-right: 10px;
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}
</style>
