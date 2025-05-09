<!-- UpdateItemView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStorageItemStore } from '@/stores/storageItemStore'

const route = useRoute()
const router = useRouter()
const storageItemStore = useStorageItemStore()

const navigateToStorage = () => {
  router.push('/storage')
}

const itemId = parseInt(route.params.itemId as string)

const loading = ref(true)
const error = ref<string | null>(null)
const savingChanges = ref(false)

const showConfirmation = ref(false)
const deleteAllMode = ref(false)
const itemToDelete = ref<number | null>(null)
const deleteInProgress = ref(false)

const showSharingDialog = ref(false)
const itemToShare = ref<number | null>(null)
const sharingQuantity = ref<number>(0)
const maxSharingQuantity = ref<number>(0)
const processingSharing = ref(false)

interface ModifiedItem {
  id: number
  quantity: number
  expirationDate: string
  is_shared: boolean
  originalData: {
    quantity: number
    expirationDate: string
    is_shared: boolean
  }
  changed: boolean
}

const modifiedItems = reactive<Record<number, ModifiedItem>>({})

// Format a date to YYYY-MM-DD format ensuring correct timezone handling
const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Format a date for the backend with timezone adjustment
const formatDateForBackend = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number)

  // Create a date at noon to avoid timezone issues (noon UTC will be the same day in all timezones)
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T12:00:00`
}

// Initialize modified items tracker
const initializeModifiedItems = () => {
  storageItemStore.individualItems.forEach((item) => {
    console.log('Processing item:', item)
    console.log('Item shared value:', item.shared)

    const expirationDate = formatDateForInput(item.expirationDate)

    const isShared = item.shared === true

    modifiedItems[item.id] = {
      id: item.id,
      quantity: item.quantity,
      expirationDate: expirationDate,
      is_shared: isShared,
      originalData: {
        quantity: item.quantity,
        expirationDate: expirationDate,
        is_shared: isShared,
      },
      changed: false,
    }
  })
}

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
    checkIfItemChanged(id)
  }
}

// Update expiration date when date input changes
const updateExpirationDate = (id: number, value: string) => {
  modifiedItems[id].expirationDate = value
  checkIfItemChanged(id)
}

const toggleShared = async (id: number) => {
  const item = storageItemStore.individualItems.find((item) => item.id === id)

  if (!item) return

  // If the item is already shared, make it private immediately
  if (modifiedItems[id].is_shared) {
    await updateSharedStatus(id, false, modifiedItems[id].quantity)
  } else {
    // If the item is private, show the dialog to ask for quantity
    itemToShare.value = id
    maxSharingQuantity.value = modifiedItems[id].quantity
    sharingQuantity.value = modifiedItems[id].quantity
    showSharingDialog.value = true
  }
}

const confirmSharing = async () => {
  if (
    !itemToShare.value ||
    sharingQuantity.value <= 0 ||
    sharingQuantity.value > maxSharingQuantity.value
  ) {
    return
  }

  processingSharing.value = true

  try {
    await updateSharedStatus(itemToShare.value, true, sharingQuantity.value)
    showSharingDialog.value = false
    itemToShare.value = null
  } catch (err) {
    console.error('Error sharing item:', err)
  } finally {
    processingSharing.value = false
  }
}

const cancelSharing = () => {
  showSharingDialog.value = false
  itemToShare.value = null
}

const updateSharedStatus = async (id: number, isShared: boolean, quantity: number) => {
  try {
    const item = storageItemStore.individualItems.find((item) => item.id === id)

    if (!item) return

    console.log(`Updating shared status for item ${id} to ${isShared} with quantity ${quantity}`)

    modifiedItems[id].is_shared = isShared

    const response = await storageItemStore.updateStorageItemSharedStatus(id, isShared, quantity)

    console.log('Update response:', response)

    modifiedItems[id].originalData.is_shared = isShared

    item.shared = isShared

    if (Array.isArray(response) && response.length > 1) {
      await storageItemStore.fetchStorageItemsByItemId(itemId)
      initializeModifiedItems()
    }

    error.value = null
  } catch (err: any) {
    modifiedItems[id].is_shared = !isShared
    error.value = `Failed to update shared status: ${err.response?.data?.message || err.message}`
    console.error('Error updating shared status:', err)
    throw err
  }
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

// Calculate days until expiration for a given date
const calculateDaysUntilExpiration = (dateString: string): number => {
  const [year, month, day] = dateString.split('-').map(Number)
  const expirationDate = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffTime = expirationDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
}

// Compute the aggregated information
const aggregatedItem = computed(() => {
  const items = storageItemStore.individualItems

  if (!items || items.length === 0) return null

  const firstItem = items[0]

  // Calculate total quantity using the potentially modified values
  const totalQuantity = Object.values(modifiedItems).reduce((sum, item) => sum + item.quantity, 0)

  // Find the earliest expiration date from modified values
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
    const changedItems = Object.values(modifiedItems).filter(
      (item) =>
        item.quantity !== item.originalData.quantity ||
        item.expirationDate !== item.originalData.expirationDate,
    )

    if (changedItems.length === 0) {
      navigateToStorage()
      return
    }

    // Update each changed item
    for (const item of changedItems) {
      const originalItem = storageItemStore.individualItems.find((i) => i.id === item.id)

      if (originalItem) {
        // Format the date for the backend with timezone adjustment
        const expirationDate = formatDateForBackend(item.expirationDate)

        await storageItemStore.updateStorageItem(item.id, {
          itemId: originalItem.itemId,
          quantity: item.quantity,
          expirationDate: expirationDate,
          householdId: originalItem.householdId,
        })
      }
    }
    navigateToStorage()
  } catch (err) {
    error.value = 'Failed to save changes'
    console.error('Error saving changes:', err)
  } finally {
    savingChanges.value = false
  }
}

const cancel = () => {
  navigateToStorage()
}
</script>

<template>
  <div class="update-item-container">
    <h1 class="update-item-title">Update Item</h1>

    <div v-if="loading" class="loading-indicator">Loading item details...</div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="!aggregatedItem" class="error-message">Item not found.</div>

    <div v-else class="content-wrapper">
      <!-- Column headers -->
      <div class="item-header">
        <div class="col item-name">Aggregated Item</div>
        <div class="col">&nbsp;</div>
        <!-- Empty second column -->
        <div class="col item-quantity">Total quantity</div>
        <div class="col item-expiration">Earliest expiration</div>
        <div class="col">&nbsp;</div>
        <div class="col">&nbsp;</div>
      </div>

      <!-- Aggregated item summary -->
      <div class="aggregated-item">
        <div class="item-summary-row">
          <div class="col item-name-value">{{ aggregatedItem.name }}</div>
          <div class="col">&nbsp;</div>
          <div class="col item-quantity-value">
            <div class="quantity-pill">
              {{ aggregatedItem.totalQuantity.toFixed(1) }} {{ aggregatedItem.unit }}
            </div>
          </div>
          <div class="col item-expiration-value">
            <div class="expiration-pill">{{ aggregatedItem.expirationDays }} days</div>
          </div>
          <div class="col">&nbsp;</div>
          <div class="col item-actions">
            <button class="delete-all-button" @click="confirmDeleteAll">Delete all</button>
          </div>
        </div>
      </div>

      <!-- Individual items header -->
      <div class="item-header">
        <div class="col item-name">Single item</div>
        <div class="col">&nbsp;</div>
        <div class="col item-quantity">Quantity</div>
        <div class="col item-expiration">Expiration Date</div>
        <div class="col item-shared-status">Group Storage</div>
        <div class="col">&nbsp;</div>
      </div>

      <!-- Individual items list -->
      <div class="individual-items-container">
        <div class="individual-items-list">
          <div v-for="item in storageItemStore.individualItems" :key="item.id" class="item-row">
            <div class="col item-name">
              {{ item.item.name }}
            </div>
            <div class="col">&nbsp;</div>
            <div class="col item-quantity">
              <input
                :value="modifiedItems[item.id]?.quantity.toFixed(1)"
                type="number"
                step="0.1"
                class="quantity-input"
                @input="(e) => updateQuantity(item.id, (e.target as HTMLInputElement).value)"
                :class="{
                  modified:
                    modifiedItems[item.id]?.quantity !==
                    modifiedItems[item.id]?.originalData.quantity,
                }"
              />
              <span class="unit-label">{{ item.item.unit }}</span>
            </div>
            <div class="col item-expiration">
              <input
                :value="modifiedItems[item.id]?.expirationDate"
                type="date"
                class="date-input"
                lang="en"
                @input="(e) => updateExpirationDate(item.id, (e.target as HTMLInputElement).value)"
                :class="{
                  modified:
                    modifiedItems[item.id]?.expirationDate !==
                    modifiedItems[item.id]?.originalData.expirationDate,
                }"
              />
            </div>
            <div class="col item-shared-status">
              <button
                :class="['share-button', modifiedItems[item.id]?.is_shared ? 'unshare-button' : '']"
                @click="toggleShared(item.id)"
                :title="modifiedItems[item.id]?.is_shared ? 'Make private' : 'Make shared'"
              >
                {{ modifiedItems[item.id]?.is_shared ? 'Shared' : 'Private' }}
              </button>
            </div>
            <div class="col item-actions">
              <button class="delete-button" @click="confirmDeleteItem(item.id)">Delete</button>
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
          <p class="confirmation-message">
            {{
              deleteAllMode
                ? 'Are you sure you want to delete all items?'
                : 'Are you sure you want to delete this item?'
            }}
          </p>
          <div class="confirmation-buttons">
            <button
              class="confirm-delete-button"
              @click="deleteAllMode ? deleteAll() : deleteItem()"
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

      <div class="confirmation-overlay" v-if="showSharingDialog">
        <div class="confirmation-popup">
          <h3 class="confirmation-title">Share Item</h3>
          <p class="confirmation-message">
            How much of this item would you like to share with your emergency group?
          </p>
          <div class="quantity-input-container">
            <input
              v-model="sharingQuantity"
              type="number"
              step="0.1"
              min="0.1"
              :max="maxSharingQuantity"
              class="quantity-input"
            />
            <span class="unit-label">{{
              storageItemStore.individualItems.find((item) => item.id === itemToShare)?.item.unit
            }}</span>
          </div>
          <p class="quantity-hint">
            Maximum available: {{ maxSharingQuantity.toFixed(1) }}
            {{
              storageItemStore.individualItems.find((item) => item.id === itemToShare)?.item.unit
            }}
          </p>
          <div class="confirmation-buttons">
            <button
              class="confirm-share-button"
              @click="confirmSharing"
              :disabled="
                processingSharing || sharingQuantity <= 0 || sharingQuantity > maxSharingQuantity
              "
            >
              {{ processingSharing ? 'Processing...' : 'Share' }}
            </button>
            <button
              class="cancel-share-button"
              @click="cancelSharing"
              :disabled="processingSharing"
            >
              Cancel
            </button>
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
  max-width: 1000px;
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

.item-header,
.item-row,
.item-summary-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-items: center;
  width: 100%;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
}

.item-header {
  margin-bottom: 0.5rem;
  color: #666;
  font-weight: 500;
}

.item-row {
  border-bottom: 1px solid #eee;
}

.item-row:last-child {
  border-bottom: none;
}

.col {
  padding: 0 0.5rem;
  text-align: center;
}

.item-name,
.item-name-value {
  text-align: left;
  font-weight: 500;
}

.item-quantity,
.item-expiration,
.item-shared-status,
.item-actions,
.item-quantity-value,
.item-expiration-value {
  display: flex;
  align-items: center;
  justify-content: center;
}

.aggregated-item {
  background-color: white;
  font-size: 1.1rem;
  border-radius: 10px;
  padding: 1rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
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

.quantity-input,
.date-input {
  text-align: center;
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

.unit-label,
.days-label {
  margin-left: 0.5rem;
  font-size: 1.2rem;
  font-weight: 500;
}

.share-button,
.delete-button,
.delete-all-button {
  width: 100px;
  margin: 0 0.25rem;
}

.share-button {
  background-color: #d6d6d6;
  color: black;
  border-radius: 9999px;

  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
}

.share-button.unshare-button {
  background-color: white;
  color: black;
  border: black solid 1px;
}

.delete-button,
.delete-all-button {
  background-color: #ff5c5f;
  color: black;
  border: none;
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
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

.save-button:disabled,
.cancel-button:disabled,
.add-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.quantity-input-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem 0;
}

.quantity-hint {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.confirm-share-button {
  background-color: #5adf7b;
  color: black;
  border: none;
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  flex: 1;
  max-width: 130px;
}

.confirm-share-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-share-button {
  background-color: #e0e0e0;
  color: black;
  border: none;
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  flex: 1;
  max-width: 130px;
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

@media (max-width: 992px) {
  .update-item-title {
    font-size: 2.25rem;
    margin-bottom: 1.5rem;
  }
  .content-wrapper {
    max-width: 95%;
  }
  .item-header {
    background: #f5f5f5;
    border-radius: 8px 8px 0 0;
    font-weight: 500;
  }
  .aggregated-item,
  .individual-items-container {
    border-radius: 0 0 8px 8px;
  }

  @media (min-width: 577px) and (max-width: 768px) {
    .item-header,
    .item-row,
    .item-summary-row {
      display: grid;
      grid-template-columns: 3fr 1.5fr 1.5fr;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
    }

    .col.item-name,
    .col.item-name-value {
      grid-column: 1;
      text-align: left;
    }
    .col.item-name-header::after {
      content: '';
      display: block;
      height: 2px;
      background: #ddd;
      margin-top: 0.4rem;
    }

    .col.item-quantity,
    .col.item-quantity-value,
    .col.item-expiration,
    .col.item-expiration-value {
      grid-column: 2;
      display: flex;
      flex-direction: column;
    }

    .col.item-shared-status,
    .col.item-actions {
      grid-column: 3;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .col:empty {
      display: none;
    }
    .col:nth-child(2) {
      display: none;
    }
    .col:nth-child(5):not(.item-shared-status) {
      display: none;
    }
    .col:nth-child(6):not(.item-actions) {
      display: none;
    }

    .quantity-input,
    .date-input,
    .share-button,
    .delete-button,
    .delete-all-button {
      width: 100%;
    }
    .action-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
  }

  @media (max-width: 576px) {
    .update-item-title {
      font-size: 1.75rem;
      margin-bottom: 1rem;
    }

    .item-header {
      display: flex;
      padding: 0.75rem 1rem;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }
    .item-header:first-of-type {
      margin-top: 1rem;
    }
    .item-header .col {
      display: none;
    }
    .item-header .item-name {
      display: block;
      width: auto;
    }

    .item-header:first-of-type::after,
    .item-header:nth-of-type(3)::after {
      content: 'Summary';
      font-size: 0.95rem;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.4);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .item-header:nth-of-type(3)::after {
      content: 'Details';
    }

    .item-row,
    .item-summary-row {
      display: block;
      border-bottom: 1px solid #eee;
      padding: 1rem;
    }

    .col {
      display: flex;
      width: 100%;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f0f0f0;
      align-items: center;
    }
    .col:last-child {
      border-bottom: none;
    }
    .col:first-child {
      padding-top: 0;
    }

    .col.item-name::before,
    .col.item-quantity::before,
    .col.item-expiration::before,
    .col.item-shared-status::before,
    .col.item-actions::before {
      width: 80px;
      font-weight: 500;
      color: #666;
    }
    .col.item-name::before {
      content: 'Item:';
    }
    .col.item-quantity::before {
      content: 'Quantity:';
    }
    .col.item-expiration::before {
      content: 'Expires:';
    }
    .col.item-shared-status::before {
      content: 'Sharing:';
    }
    .col.item-actions::before {
      content: 'Action:';
    }

    .col:empty {
      display: none;
    }
    .col:nth-child(2) {
      display: none;
    }
    .col:nth-child(5):not(.item-shared-status) {
      display: none;
    }
    .col:nth-child(6):not(.item-actions) {
      display: none;
    }

    .quantity-input,
    .date-input {
      flex-grow: 1;
      width: 100%;
    }
    .share-button,
    .delete-button,
    .delete-all-button {
      width: 100%;
    }
    .action-buttons {
      flex-direction: column-reverse;
      gap: 1rem;
    }
  }
}

@media (max-width: 400px) {
  .update-item-title {
    font-size: 1.5rem;
  }
  .col::before {
    width: 70px;
    font-size: 0.9rem;
  }
}

@media (max-height: 600px) and (orientation: landscape) {
  .individual-items-container {
    max-height: 200px;
    overflow-y: auto;
  }
}
</style>
