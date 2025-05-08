<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStorageItemStore } from '@/stores/storageItemStore.ts'

const route = useRoute()
const router = useRouter()
const storageItemStore = useStorageItemStore()

const navigateToStorage = () => {
  router.push('/storage')
}

const navigateToAddStorageItem = () => {
  router.push('/storage/add-storage-item')
}

const itemId = parseInt(route.params.itemId as string)

const loading = ref(true)
const error = ref<string | null>(null)
const savingChanges = ref(false)

const showConfirmation = ref(false)
const deleteAllMode = ref(false)
const itemToDelete = ref<number | null>(null)
const deleteInProgress = ref(false)

interface ModifiedItem {
  id: number;
  quantity: number;
  expirationDays: number;
  originalData: {
    quantity: number;
    expirationDays: number;
  };
  changed: boolean;
}

const modifiedItems = reactive<Record<number, ModifiedItem>>({})

// Initialize modified items tracker
const initializeModifiedItems = () => {
  storageItemStore.individualItems.forEach(item => {
    const expirationDate = new Date(item.expirationDate)
    const today = new Date()
    const diffTime = expirationDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    modifiedItems[item.id] = {
      id: item.id,
      quantity: item.quantity,
      expirationDays: diffDays > 0 ? diffDays : 0,
      originalData: {
        quantity: item.quantity,
        expirationDays: diffDays > 0 ? diffDays : 0
      },
      changed: false
    }
  })
}

// Fetch data on component mount
onMounted(async () => {
  try {
    loading.value = true
    await storageItemStore.fetchStorageItemsByItemId(itemId)
    initializeModifiedItems()
    loading.value = false
  } catch (err) {
    error.value = 'Failed to load item details'
    loading.value = false
    console.error('Error loading item details:', err)
  }
})

// Update quantity when input changes
const updateQuantity = (id: number, value: string) => {
  const quantity = parseFloat(value)
  if (!isNaN(quantity) && quantity >= 0) {
    modifiedItems[id].quantity = quantity
    modifiedItems[id].changed =
      quantity !== modifiedItems[id].originalData.quantity ||
      modifiedItems[id].expirationDays !== modifiedItems[id].originalData.expirationDays
  }
}

// Update expiration days when input changes
const updateExpirationDays = (id: number, value: string) => {
  const days = parseInt(value)
  if (!isNaN(days) && days >= 0) {
    modifiedItems[id].expirationDays = days
    modifiedItems[id].changed =
      days !== modifiedItems[id].originalData.expirationDays ||
      modifiedItems[id].quantity !== modifiedItems[id].originalData.quantity
  }
}

// Compute the aggregated information
const aggregatedItem = computed(() => {
  const items = storageItemStore.individualItems

  if (!items || items.length === 0) return null

  const firstItem = items[0]

  // Calculate total quantity using the potentially modified values
  const totalQuantity = Object.values(modifiedItems).reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  // Find the earliest expiration date from modified values
  const earliestExpirationDays = Object.values(modifiedItems).reduce(
    (earliest, item) => Math.min(earliest, item.expirationDays || Infinity),
    Infinity
  )

  return {
    id: itemId,
    name: firstItem.item.name,
    totalQuantity,
    unit: firstItem.item.unit,
    expirationDays: earliestExpirationDays === Infinity ? 0 : earliestExpirationDays
  }
})

// Calculate future date based on days
const calculateFutureDate = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

// Show confirmation for single item delete
const confirmDeleteItem = (id: number) => {
  itemToDelete.value = id
  deleteAllMode.value = false
  showConfirmation.value = true
}

// Show confirmation for delete all
const confirmDeleteAll = () => {
  deleteAllMode.value = true
  showConfirmation.value = true
}

// Close confirmation popup
const cancelDelete = () => {
  showConfirmation.value = false
  itemToDelete.value = null
  deleteAllMode.value = false
}

// Handle delete item after confirmation
const deleteItem = async () => {
  if (!itemToDelete.value) return

  try {
    deleteInProgress.value = true
    await storageItemStore.deleteStorageItem(itemToDelete.value)
    // Remove from modified items tracking
    delete modifiedItems[itemToDelete.value]
    // If all items are deleted, navigate back to storage page
    if (storageItemStore.individualItems.length === 0) {
      navigateToStorage()
    }
    // Close popup
    showConfirmation.value = false
    itemToDelete.value = null
  } catch (err) {
    error.value = 'Failed to delete item'
    console.error('Error deleting item:', err)
  } finally {
    deleteInProgress.value = false
  }
}

// Handle delete all after confirmation
const deleteAll = async () => {
  try {
    deleteInProgress.value = true
    // Implementation would depend on your delete all functionality
    // Could be a batch delete API call or multiple individual deletes
    for (const item of storageItemStore.individualItems) {
      await storageItemStore.deleteStorageItem(item.id)
    }
    showConfirmation.value = false
    navigateToStorage()
  } catch (err) {
    error.value = 'Failed to delete all items'
    console.error('Error deleting all items:', err)
  } finally {
    deleteInProgress.value = false
  }
}

// Handle save changes
const saveChanges = async () => {
  try {
    savingChanges.value = true

    // Get items that have been modified
    const changedItems = Object.values(modifiedItems).filter(item => item.changed)

    if (changedItems.length === 0) {
      // No changes to save
      navigateToStorage()
      return
    }

    // Update each changed item
    for (const item of changedItems) {
      const originalItem = storageItemStore.individualItems.find(i => i.id === item.id)

      if (originalItem) {
        // Convert expiration days to a date
        const expirationDate = calculateFutureDate(item.expirationDays)

        await storageItemStore.updateStorageItem(item.id, {
          itemId: originalItem.itemId,
          quantity: item.quantity,
          expirationDate: expirationDate,
          householdId: originalItem.householdId
        })
      }
    }

    // Navigate back to storage page after all updates are done
    navigateToStorage()
  } catch (err) {
    error.value = 'Failed to save changes'
    console.error('Error saving changes:', err)
  } finally {
    savingChanges.value = false
  }
}

// Handle cancel
const cancel = () => {
  navigateToStorage()
}
</script>

<template>
  <div class="update-item-container">
    <h1 class="update-item-title">Update Item</h1>

    <div v-if="loading" class="loading-indicator">
      Loading item details...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="!aggregatedItem" class="error-message">
      Item not found.
    </div>

    <div v-else class="content-wrapper">
      <!-- Column headers -->
      <div class="item-header">
        <div class="item-name">Aggregated Item</div>
        <div class="item-quantity">Total <br>quantity</div>
        <div class="item-expiration">Earliest expiration<br>date</div>
      </div>

      <!-- Aggregated item summary -->
      <div class="aggregated-item">
        <div class="item-summary-row">
          <div class="item-name-value">{{ aggregatedItem.name }}</div>
          <div class="item-quantity-value">
            <div class="quantity-pill">{{ aggregatedItem.totalQuantity.toFixed(1) }} {{ aggregatedItem.unit }}</div>
          </div>
          <div class="item-expiration-value">
            <div class="expiration-pill">{{ aggregatedItem.expirationDays }} days</div>
          </div>
          <div class="item-actions">
            <button class="delete-all-button" @click="confirmDeleteAll">Delete all</button>
          </div>
        </div>
      </div>

      <!-- Individual items header -->
      <div class="item-header">
        <div class="item-name">Single item</div>
        <div class="item-quantity">Quantity</div>
        <div class="item-expiration">Expiration date</div>
        <div></div>
      </div>

      <!-- Individual items list -->
      <div class="individual-items-container">
        <div class="individual-items-list">
          <div v-for="item in storageItemStore.individualItems" :key="item.id" class="item-row">
            <div class="item-type">
              {{ item.item.name }} ({{ modifiedItems[item.id]?.quantity.toFixed(1) || item.quantity.toFixed(1)}} {{ item.item.unit }})
            </div>
            <div class="item-inputs">
              <input
                :value="modifiedItems[item.id]?.quantity.toFixed(1)"
                type="number"
                step="0.1"
                class="quantity-input"
                @input="(e) => updateQuantity(item.id, (e.target as HTMLInputElement).value)"
                :class="{ 'modified': modifiedItems[item.id]?.quantity !== modifiedItems[item.id]?.originalData.quantity }"
              />
              <span class="unit-label">{{ item.item.unit }}</span>
            </div>
            <div class="expiration-inputs">
              <input
                :value="modifiedItems[item.id]?.expirationDays"
                type="number"
                class="expiration-input"
                @input="(e) => updateExpirationDays(item.id, (e.target as HTMLInputElement).value)"
                :class="{ 'modified': modifiedItems[item.id]?.expirationDays !== modifiedItems[item.id]?.originalData.expirationDays }"
              />
              <span class="days-label">days</span>
            </div>
            <div class="individual-item-actions">
              <button class="delete-button" @click="confirmDeleteItem(item.id)">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="action-buttons">
        <button class="save-button" @click="saveChanges" :disabled="savingChanges">
          {{ savingChanges ? 'Saving...' : 'Save changes' }}
        </button>
        <button class="cancel-button" @click="cancel" :disabled="savingChanges">Cancel</button>
        <button class="add-button" @click="navigateToAddStorageItem" :disabled="savingChanges">Add new item</button>
      </div>

      <!-- Delete confirmation popup -->
      <div class="confirmation-overlay" v-if="showConfirmation">
        <div class="confirmation-popup">
          <h3 class="confirmation-title">Confirm Delete</h3>
          <p class="confirmation-message">
            {{ deleteAllMode ? 'Are you sure you want to delete all items?' : 'Are you sure you want to delete this item?' }}
          </p>
          <div class="confirmation-buttons">
            <button
              class="confirm-delete-button"
              @click="deleteAllMode ? deleteAll() : deleteItem()"
              :disabled="deleteInProgress"
            >
              {{ deleteInProgress ? 'Deleting...' : 'Yes, delete' }}
            </button>
            <button class="cancel-delete-button" @click="cancelDelete" :disabled="deleteInProgress">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.update-item-container {
  min-height: 100vh;
  background-color: #dbf5fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  font-family: 'Roboto', sans-serif;
}

.update-item-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 3rem;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  gap: 1rem;
  position: relative;
}

.loading-indicator,
.error-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.error-message {
  color: #ff5c5f;
}

.item-header {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) 120px 180px 120px;
  align-items: center;
  padding: 0 2rem;
  margin-bottom: 0.5rem;
  color: #666;
  font-weight: 500;
}

.item-name {
  text-align: left;
}

.item-quantity {
  text-align: center;
  margin-left: 10px;
}

.item-expiration {
  text-align: center;
}

.aggregated-item {
  background-color: white;
  font-size: 1.1rem;
  border-radius: 10px;
  padding: 1rem 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.item-summary-row {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) 120px 180px 120px;
  align-items: center;
}

.item-name-value {
  font-weight: 500;
  text-align: left;
}

.item-quantity-value {
  display: flex;
  justify-content: center;
  margin-left: 10px;
}

.item-expiration-value {
  display: flex;
  justify-content: center;
}

.quantity-pill {
  border: black solid 1px;
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  text-align: center;
  font-weight: 500;
  display: inline-block;
  min-width: 80px;
}

.expiration-pill {
  background-color: #5adf7b;
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  text-align: center;
  font-weight: 500;
  display: inline-block;
  min-width: 80px;
}

.item-actions {
  display: flex;
  justify-content: flex-end;
}

.delete-all-button {
  background-color: #ff5c5f;
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
}

.individual-items-container {
  background-color: white;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
}

.individual-items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-row {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) 120px 180px 120px;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.item-row:last-child {
  border-bottom: none;
}

.item-type {
  font-weight: 450;
  font-size: 1.1rem;
}

.item-inputs {
  display: flex;
  justify-content: center;
  align-items: center;
}

.expiration-inputs {
  display: flex;
  justify-content: center;
  align-items: center;
}

.quantity-input,
.expiration-input {
  width: 70px;
  text-align: right;
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.2s, background-color 0.2s;
  font-size: 1.2rem;
  font-weight: 500;
}

.quantity-input.modified,
.expiration-input.modified {
  border-color: #5adf7b;
  background-color: rgba(90, 223, 123, 0.1);
}

.save-button:disabled,
.cancel-button:disabled,
.add-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.unit-label,
.days-label {
  margin-left: 0.5rem;
  font-size: 1.2rem;
  font-weight: 500;
}

.unit-toggle {
  cursor: pointer;
  margin-left: 0.5rem;
}

.individual-item-actions {
  display: flex;
  justify-content: flex-end;
}

.delete-button {
  background-color: #ff5c5f;
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.save-button {
  background-color: #5adf7b;
  color: black;
  border: none;
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
}

.cancel-button {
  background-color: #e0e0e0;
  color: black;
  border: none;
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
}

.add-button {
  background-color: #5adf7b;
  color: black;
  border: none;
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
}

.confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

input:focus {
  outline: none;
  border-color: #18daff;
  box-shadow: 0 0 0 3px rgba(76, 199, 144, 0.2);
}

input:hover {
  border-color: #b8b8b8;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.confirmation-popup {
  background-color: white;
  border-radius: 15px;
  padding: 2rem;
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.confirmation-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.confirmation-message {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: #555;
}

.confirmation-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  width: 100%;
}

.confirm-delete-button {
  background-color: #ff5c5f;
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  flex: 1;
  max-width: 160px;
}

.cancel-delete-button {
  background-color: #e0e0e0;
  color: black;
  border: none;
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  flex: 1;
  max-width: 160px;
}

.confirm-delete-button:disabled,
.cancel-delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
