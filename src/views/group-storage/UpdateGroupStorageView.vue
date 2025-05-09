<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGroupStorageItemStore } from '@/stores/groupStorageItemStore'
import { useStorageItemStore } from '@/stores/storageItemStore.ts'
import type { GroupStorageItemRequest, StorageItemGroupResponse } from '@/types/storageItem'

const route = useRoute()
const router = useRouter()
const groupStorageItemStore = useGroupStorageItemStore()
const storageItemStore = useStorageItemStore()

const navigateToGroupStorage = () => {
  router.push('/group-storage')
}

const itemId = parseInt(route.params.itemId as string)

const loading = ref(true)
const error = ref<string | null>(null)
const savingChanges = ref(false)
const showConfirmation = ref(false)
const itemToDelete = ref<number | null>(null)
const deleteInProgress = ref(false)

// Add state to store the group item details
const groupItemDetails = ref<StorageItemGroupResponse[]>([])

const formatDateForInput = (dateString: string): string => {
  if (!dateString) return ''

  const datePart = dateString.split('T')[0]
  if (!datePart) return ''

  const parts = datePart.split('-')
  if (parts.length !== 3) return ''

  return datePart
}

// Format a date for the backend with timezone adjustment
const formatDateForBackend = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number)

  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T12:00:00`
}

// Calculate days until expiration for a given date string
const calculateDaysUntilExpiration = (dateString: string): number => {
  const [year, month, day] = dateString.split('-').map(Number)
  const expirationDate = new Date(year, month - 1, day) // month is 0-indexed in JS Date
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Remove time part for accurate day calculation

  const diffTime = expirationDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
}

interface ModifiedItem {
  id: number
  quantity: number
  expirationDate: string
  originalData: {
    quantity: number
    expirationDate: string
  }
  changed: boolean
}

const modifiedItems = reactive<Record<number, ModifiedItem>>({})

// Initialize modified items tracker
const initializeModifiedItems = () => {
  groupItemDetails.value.forEach((item) => {
    const expirationDate = formatDateForInput(item.storageItem.expirationDate)

    modifiedItems[item.storageItem.id] = {
      id: item.storageItem.id,
      quantity: item.storageItem.quantity,
      expirationDate: expirationDate,
      originalData: {
        quantity: item.storageItem.quantity,
        expirationDate: expirationDate,
      },
      changed: false,
    }
  })
}

// Fetch data on component mount
onMounted(async () => {
  try {
    loading.value = true
    // Fetch the group storage items for this specific item ID
    const result = await groupStorageItemStore.fetchGroupItemsByItemId(itemId)

    // If the result is an empty array, set an appropriate error message
    if (result.length === 0) {
      error.value =
        'No shared items found for this item. The item might not be shared with your emergency group.'
    }

    groupItemDetails.value = result
    initializeModifiedItems()
    loading.value = false

    // Log for debugging purposes
    console.log('API Response:', result)
  } catch (err: any) {
    error.value = err.message || 'Failed to load group item details'
    loading.value = false
    console.error('Error loading group item details:', err)
  }
})

// Update quantity when input changes
const updateQuantity = (id: number, value: string) => {
  const quantity = parseFloat(value)
  if (!isNaN(quantity) && quantity >= 0) {
    modifiedItems[id].quantity = quantity
    checkIfItemChanged(id)
  }
}

// Update expiration date when date input changes
const updateExpirationDate = (id: number, value: string) => {
  modifiedItems[id].expirationDate = value
  checkIfItemChanged(id)
}

// Check if item has been modified from its original state
const checkIfItemChanged = (id: number) => {
  const item = modifiedItems[id]
  item.changed =
    item.quantity !== item.originalData.quantity ||
    item.expirationDate !== item.originalData.expirationDate
}

// Format a date for display
const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Compute the aggregated information
const aggregatedItem = computed(() => {
  if (!groupItemDetails.value || groupItemDetails.value.length === 0) return null

  const firstItem = groupItemDetails.value[0].storageItem

  const totalQuantity = Object.values(modifiedItems).reduce((sum, item) => sum + item.quantity, 0)

  let earliestDate: string | null = null

  for (const item of Object.values(modifiedItems)) {
    if (!earliestDate || item.expirationDate < earliestDate) {
      earliestDate = item.expirationDate
    }
  }

  // Calculate days until earliest expiration
  const expirationDays = earliestDate ? calculateDaysUntilExpiration(earliestDate) : 0

  // Format date for display
  const displayDate = earliestDate ? formatDateForDisplay(earliestDate) : 'Not set'

  return {
    id: itemId,
    name: firstItem.item.name,
    totalQuantity,
    unit: firstItem.item.unit,
    expirationDays,
    expirationDate: displayDate,
  }
})

// Show confirmation for delete
const confirmDeleteItem = (id: number) => {
  itemToDelete.value = id
  showConfirmation.value = true
}

// Close confirmation popup
const cancelDelete = () => {
  showConfirmation.value = false
  itemToDelete.value = null
}

// Handle delete item after confirmation
const deleteItem = async () => {
  if (!itemToDelete.value) return

  try {
    deleteInProgress.value = true
    await storageItemStore.deleteStorageItem(itemToDelete.value)

    delete modifiedItems[itemToDelete.value]

    groupItemDetails.value = groupItemDetails.value.filter(
      (item) => item.storageItem.id !== itemToDelete.value,
    )

    if (groupItemDetails.value.length === 0) {
      navigateToGroupStorage()
    }

    showConfirmation.value = false
    itemToDelete.value = null
  } catch (err) {
    error.value = 'Failed to delete item'
    console.error('Error deleting item:', err)
  } finally {
    deleteInProgress.value = false
  }
}

const saveChanges = async () => {
  try {
    savingChanges.value = true

    const changedItems = Object.values(modifiedItems).filter((item) => item.changed)

    if (changedItems.length === 0) {
      navigateToGroupStorage()
      return
    }

    // Update each changed item
    for (const item of changedItems) {
      const groupItem = groupItemDetails.value.find(
        (groupItem) => groupItem.storageItem.id === item.id,
      )

      if (groupItem) {
        const expirationDate = formatDateForBackend(item.expirationDate)

        const updateRequest: GroupStorageItemRequest = {
          itemId: groupItem.storageItem.itemId,
          quantity: item.quantity,
          expirationDate: expirationDate,
        }

        console.log(`Updating group item ${item.id} with request:`, updateRequest)
        await groupStorageItemStore.updateGroupStorageItem(item.id, updateRequest)
      }
    }

    navigateToGroupStorage()
  } catch (err) {
    error.value = 'Failed to save changes'
    console.error('Error saving changes:', err)
  } finally {
    savingChanges.value = false
  }
}

const cancel = () => {
  navigateToGroupStorage()
}
</script>

<template>
  <div class="group-storage-detail-container">
    <h1 class="group-storage-detail-title">Update Group Storage Item</h1>

    <div v-if="loading" class="loading-indicator">Loading group item details...</div>

    <div v-else-if="error" class="error-message">
      <div class="error-content">
        <h3>Unable to Display Item Details</h3>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button class="back-button" @click="navigateToGroupStorage">Back to Group Storage</button>
        </div>
      </div>
    </div>

    <div v-else-if="!aggregatedItem" class="error-message">Item not found.</div>

    <div v-else class="content-wrapper">
      <!-- Column headers for aggregated item -->
      <div class="item-header">
        <div class="col item-name">Aggregated Item</div>
        <div class="col item-household">&nbsp;</div>
        <div class="col">&nbsp;</div>
        <div class="col item-quantity">Total quantity</div>
        <div class="col item-expiration">Earliest expiration</div>
        <div class="col item-actions">&nbsp;</div>
      </div>

      <!-- Aggregated item summary -->
      <div class="aggregated-item">
        <div class="item-summary-row">
          <div class="col item-name-value">{{ aggregatedItem.name }}</div>
          <div class="col">&nbsp;</div>
          <div class="col">&nbsp;</div>
          <div class="col item-quantity">
            <div class="quantity-pill">
              {{ aggregatedItem.totalQuantity.toFixed(1) }} {{ aggregatedItem.unit }}
            </div>
          </div>
          <div class="col item-expiration-value">
            <div class="expiration-pill">{{ aggregatedItem.expirationDays }} days</div>
          </div>
          <div class="col item-actions">&nbsp;</div>
        </div>
      </div>

      <!-- Individual items header -->
      <div class="item-header">
        <div class="col item-name">Item</div>
        <div class="col item-household">Household</div>
        <div class="col">&nbsp;</div>
        <!-- Empty third column -->
        <div class="col item-quantity">Quantity</div>
        <div class="col item-expiration">Expiration Date</div>
        <div class="col">&nbsp;</div>
      </div>

      <!-- Individual items for editing -->
      <div class="individual-items-container">
        <div class="individual-items-list">
          <div v-for="item in groupItemDetails" :key="item.storageItem.id" class="item-row">
            <div class="col item-name">
              {{ item.storageItem.item.name }}
            </div>
            <div class="col item-household">
              {{ item.householdName }}
            </div>
            <div class="col">&nbsp;</div>
            <div class="col item-quantity">
              <input
                :value="modifiedItems[item.storageItem.id]?.quantity.toFixed(1)"
                type="number"
                step="0.1"
                class="quantity-input"
                @input="
                  (e) => updateQuantity(item.storageItem.id, (e.target as HTMLInputElement).value)
                "
                :class="{
                  modified:
                    modifiedItems[item.storageItem.id]?.quantity !==
                    modifiedItems[item.storageItem.id]?.originalData.quantity,
                }"
              />
              <span class="unit-label">{{ item.storageItem.item.unit }}</span>
            </div>
            <div class="col item-expiration">
              <input
                :value="modifiedItems[item.storageItem.id]?.expirationDate"
                type="date"
                class="date-input"
                lang="en"
                @input="
                  (e) =>
                    updateExpirationDate(item.storageItem.id, (e.target as HTMLInputElement).value)
                "
                :class="{
                  modified:
                    modifiedItems[item.storageItem.id]?.expirationDate !==
                    modifiedItems[item.storageItem.id]?.originalData.expirationDate,
                }"
              />
            </div>
            <div class="col item-actions">
              <button class="delete-button" @click="confirmDeleteItem(item.storageItem.id)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="action-buttons">
        <button class="cancel-button" @click="cancel" :disabled="savingChanges">Cancel</button>
        <button class="save-button" @click="saveChanges" :disabled="savingChanges">
          {{ savingChanges ? 'Saving...' : 'Save changes' }}
        </button>
      </div>

      <!-- Delete confirmation popup -->
      <div class="confirmation-overlay" v-if="showConfirmation">
        <div class="confirmation-popup">
          <h3 class="confirmation-title">Confirm Delete</h3>
          <p class="confirmation-message">Are you sure you want to delete this item?</p>
          <div class="confirmation-buttons">
            <button
              class="confirm-delete-button"
              @click="deleteItem()"
              :disabled="deleteInProgress"
            >
              {{ deleteInProgress ? 'Deleting...' : 'Yes, delete' }}
            </button>
            <button class="cancel-delete-button" @click="cancelDelete" :disabled="deleteInProgress">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.group-storage-detail-container {
  min-height: 100vh;
  background-color: #dbf5fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  font-family: 'Roboto', sans-serif;
}

.group-storage-detail-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 3rem;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1000px;
  gap: 1rem;
  position: relative;
}

.loading-indicator,
.error-message {
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
  background-color: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-content h3 {
  color: #ff5c5f;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.error-content p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  justify-content: center;
}

.back-button {
  background-color: #5adf7b;
  color: black;
  border: none;
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
}

/* Grid layout styling */
.item-header,
.item-row,
.item-summary-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-items: center;
  width: 100%;
  gap: 0.5rem;
}

.item-name,
.item-name-value,
.item-household,
.item-quantity,
.item-expiration,
.item-actions {
  padding: 0.5rem;
  margin: 0;
}

.item-header {
  padding: 0 1rem;
  margin-bottom: 0.5rem;
  color: #666;
  font-weight: 500;
}

.item-row {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
}

.item-row:last-child {
  border-bottom: none;
}

.item-summary-row {
  padding: 0.5rem 1rem;
}

.col {
  padding: 0 0.5rem;
}

.aggregated-item {
  background-color: white;
  font-size: 1.1rem;
  border-radius: 10px;
  padding: 1rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

/* Column-specific styling */
.item-name,
.item-name-value {
  font-weight: 500;
  text-align: left;
}

.item-household {
  font-weight: 450;
  font-size: 1.1rem;
  color: #666;
  text-align: left;
}

.item-quantity,
.item-expiration,
.item-actions,
.item-quantity-value,
.item-expiration-value {
  display: flex;
  align-items: center;
  justify-content: center;
}

.individual-items-container {
  background-color: white;
  border-radius: 10px;
  padding: 1rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
}

.individual-items-list {
  display: flex;
  flex-direction: column;
  width: 100%;
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

.quantity-input,
.date-input {
  text-align: right;
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition:
    border-color 0.2s,
    background-color 0.2s;
  font-size: 1rem;
  font-weight: 500;
}

.quantity-input {
  width: 70px;
}

.date-input {
  width: 140px;
}

.quantity-input.modified,
.date-input.modified {
  border-color: #5adf7b;
  background-color: rgba(90, 223, 123, 0.1);
}

.unit-label {
  margin-left: 0.5rem;
  font-size: 1.2rem;
  font-weight: 500;
}

.delete-button {
  background-color: #ff5c5f;
  color: black;
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

.save-button:disabled,
.cancel-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
</style>
