<!-- AddItemView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useItemStore } from '@/stores/itemStore'

const router = useRouter()
const itemStore = useItemStore()

const name = ref('')
const unit = ref('')
const calories = ref<number | ''>('')
const type = ref('')

const isSubmitting = ref(false)
const formError = ref('')
const formSuccess = ref(false)

const itemTypes = ['DRINK', 'FOOD', 'ACCESSORIES']

const navigateToAddStorageItem = () => {
  router.push('/storage/add-storage-item')
}

// Validate form before submission
const validateForm = () => {
  // Name validation
  if (!name.value || name.value.trim() === '') {
    formError.value = 'Please enter a name for the item'
    return false
  }

  // Unit validation
  if (!unit.value || unit.value.trim() === '') {
    formError.value = 'Please enter a unit for the item'
    return false
  }

  // Calories validation
  if (calories.value === '' || isNaN(Number(calories.value)) || Number(calories.value) < 0) {
    formError.value = 'Please enter a valid number of calories (0 or greater)'
    return false
  }

  // Type validation
  if (!type.value) {
    formError.value = 'Please select a type for the item'
    return false
  }

  formError.value = ''
  return true
}

// Handle form submission
const submitForm = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  formError.value = ''
  formSuccess.value = false

  try {
    await itemStore.addItem({
      name: name.value,
      unit: unit.value,
      calories: Number(calories.value),
      type: type.value,
    })

    formSuccess.value = true

    // Reset form
    name.value = ''
    unit.value = ''
    calories.value = ''
    type.value = ''

    // Redirect after short delay
    setTimeout(() => {
      navigateToAddStorageItem()
    }, 1500)
  } catch (error) {
    formError.value = 'Failed to add item. Please try again.'
    console.error('Error adding item:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Handle calorie input change to ensure only numbers
const handleCaloriesChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  // Allow empty string or positive numbers
  if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
    calories.value = value === '' ? '' : Number(value)
  } else {
    // Reset to previous valid value if invalid input
    target.value = calories.value === '' ? '' : calories.value.toString()
  }
}
</script>

<template>
  <div class="add-item-container">
    <div class="add-item-card">
      <h1 class="title">Add New Item To Product List</h1>

      <div v-if="formSuccess" class="success-message">Item added successfully! Redirecting...</div>

      <div v-if="formError" class="error-message">
        {{ formError }}
      </div>

      <div class="form-group">
        <label for="name">Item Name</label>
        <input
          type="text"
          id="name"
          v-model="name"
          placeholder="Enter item name"
          :disabled="isSubmitting"
        />
      </div>

      <div class="form-group">
        <label for="unit">Unit</label>
        <input
          type="text"
          id="unit"
          v-model="unit"
          placeholder="Enter unit (e.g., piece, box, liter, kg)"
          :disabled="isSubmitting"
        />
      </div>

      <div class="form-group">
        <label for="calories">Calories per unit</label>
        <input
          type="number"
          id="calories"
          :value="calories"
          @input="handleCaloriesChange"
          placeholder="Enter number of calories per unit"
          min="0"
          :disabled="isSubmitting"
        />
      </div>

      <div class="form-group">
        <label for="type">Type</label>
        <select id="type" v-model="type" :disabled="isSubmitting">
          <option value="" disabled>Select a type</option>
          <option v-for="itemType in itemTypes" :key="itemType" :value="itemType">
            {{ itemType.charAt(0) + itemType.slice(1).toLowerCase() }}
          </option>
        </select>
      </div>

      <div class="form-actions">
        <button class="add-button" @click="submitForm" :disabled="isSubmitting">
          <span v-if="isSubmitting">Adding...</span>
          <span v-else>Add Item</span>
        </button>
        <button class="cancel-button" @click="navigateToAddStorageItem" :disabled="isSubmitting">
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

input,
select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

select {
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}

input:hover,
select:hover {
  border-color: #b8b8b8;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: #5adf7b;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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
</style>
