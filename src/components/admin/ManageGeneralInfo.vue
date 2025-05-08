<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

// Types
interface GeneralInfoResponse {
  id: number
  title: string
  content: string
  theme: string
}

interface GeneralInfoRequest {
  title: string
  content: string
  theme: string
}

// Data
const generalInfoList = ref<GeneralInfoResponse[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

// Edit/Create form
const isEditing = ref(false)
const isCreating = ref(false)
const currentItem = ref<GeneralInfoRequest>({
  title: '',
  content: '',
  theme: 'BEFORE_CRISIS',
})
const editingId = ref<number | null>(null)

// Theme options
const themeOptions = [
  { value: 'BEFORE_CRISIS', label: 'Before Crisis' },
  { value: 'DURING_CRISIS', label: 'During Crisis' },
  { value: 'AFTER_CRISIS', label: 'After Crisis' },
]

// Filtered lists by theme
const beforeCrisisInfo = computed(() =>
  generalInfoList.value.filter((info) => info.theme === 'BEFORE_CRISIS'),
)

const duringCrisisInfo = computed(() =>
  generalInfoList.value.filter((info) => info.theme === 'DURING_CRISIS'),
)

const afterCrisisInfo = computed(() =>
  generalInfoList.value.filter((info) => info.theme === 'AFTER_CRISIS'),
)

// Fetch all general info items
async function fetchGeneralInfo() {
  loading.value = true
  error.value = null

  try {
    const response = await axios.get<GeneralInfoResponse[]>('/api/general-info/all', {
      withCredentials: true,
    })
    generalInfoList.value = response.data
  } catch (err: any) {
    error.value =
      'Failed to load general information. ' + (err.response?.data?.message || err.message)
  } finally {
    loading.value = false
  }
}

// Initialize form for creating new item
function initCreateForm() {
  isEditing.value = false
  isCreating.value = true
  editingId.value = null
  currentItem.value = {
    title: '',
    content: '',
    theme: 'BEFORE_CRISIS',
  }
}

// Initialize form for editing existing item
function initEditForm(item: GeneralInfoResponse) {
  isEditing.value = true
  isCreating.value = false
  editingId.value = item.id
  currentItem.value = {
    title: item.title,
    content: item.content,
    theme: item.theme,
  }
}

// Cancel form
function cancelForm() {
  isEditing.value = false
  isCreating.value = false
  editingId.value = null
}

// Create new general info
async function createGeneralInfo() {
  loading.value = true
  error.value = null
  success.value = null

  try {
    const response = await axios.post<GeneralInfoResponse>(
      '/api/general-info/admin/add',
      currentItem.value,
      { withCredentials: true },
    )

    generalInfoList.value.push(response.data)
    success.value = 'General information created successfully'
    isCreating.value = false

    // Reset form
    currentItem.value = {
      title: '',
      content: '',
      theme: 'BEFORE_CRISIS',
    }
  } catch (err: any) {
    error.value =
      'Failed to create general information. ' + (err.response?.data?.message || err.message)
  } finally {
    loading.value = false
  }
}

// Update existing general info
async function updateGeneralInfo() {
  if (editingId.value === null) return

  loading.value = true
  error.value = null
  success.value = null

  try {
    const response = await axios.put<GeneralInfoResponse>(
      `/api/general-info/admin/update/${editingId.value}`,
      currentItem.value,
      { withCredentials: true },
    )

    // Update in the list
    const index = generalInfoList.value.findIndex((item) => item.id === editingId.value)
    if (index !== -1) {
      generalInfoList.value[index] = response.data
    }

    success.value = 'General information updated successfully'
    isEditing.value = false
    editingId.value = null
  } catch (err: any) {
    error.value =
      'Failed to update general information. ' + (err.response?.data?.message || err.message)
  } finally {
    loading.value = false
  }
}

// Delete general info
async function deleteGeneralInfo(id: number) {
  if (!confirm('Are you sure you want to delete this information?')) return

  loading.value = true
  error.value = null
  success.value = null

  try {
    await axios.delete(`/api/general-info/admin/delete/${id}`, {
      withCredentials: true,
    })

    // Remove from the list
    generalInfoList.value = generalInfoList.value.filter((item) => item.id !== id)
    success.value = 'General information deleted successfully'
  } catch (err: any) {
    error.value =
      'Failed to delete general information. ' + (err.response?.data?.message || err.message)
  } finally {
    loading.value = false
  }
}

// Submit form handler
function submitForm() {
  if (isEditing.value) {
    updateGeneralInfo()
  } else if (isCreating.value) {
    createGeneralInfo()
  }
}

// Load initial data
onMounted(fetchGeneralInfo)
</script>

<template>
  <div class="manage-general-info">
    <h2 class="admin-page-title">Manage General Information</h2>

    <div v-if="error" class="alert error">
      {{ error }}
      <button @click="error = null" class="close-btn">&times;</button>
    </div>

    <div v-if="success" class="alert success">
      {{ success }}
      <button @click="success = null" class="close-btn">&times;</button>
    </div>

    <!-- Create new item button -->
    <div v-if="!isEditing && !isCreating" class="action-buttons">
      <button @click="initCreateForm" class="btn-primary">
        <span class="icon">+</span> Add New Information
      </button>
      <button @click="fetchGeneralInfo" class="btn-secondary" :disabled="loading">
        <span class="icon">↻</span> Refresh
      </button>
    </div>

    <!-- Create/Edit Form -->
    <form v-if="isCreating || isEditing" @submit.prevent="submitForm" class="info-form">
      <h3>{{ isEditing ? 'Edit Information' : 'Create New Information' }}</h3>

      <div class="form-group">
        <label for="title">Title</label>
        <input
          type="text"
          id="title"
          v-model="currentItem.title"
          required
          placeholder="Enter title"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="theme">Theme</label>
        <select id="theme" v-model="currentItem.theme" required class="form-control">
          <option v-for="option in themeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="content">Content</label>
        <textarea
          id="content"
          v-model="currentItem.content"
          required
          placeholder="Enter content"
          class="form-control"
          rows="6"
        ></textarea>
      </div>

      <div class="form-buttons">
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ isEditing ? 'Update' : 'Create' }}
        </button>
        <button type="button" @click="cancelForm" class="btn-secondary">Cancel</button>
      </div>
    </form>

    <!-- List of existing items -->
    <div v-if="loading" class="loading">Loading...</div>

    <div v-if="!loading && !isCreating && !isEditing" class="info-categories">
      <!-- Before Crisis -->
      <div class="info-category">
        <h3 class="category-title before-crisis">Before Crisis</h3>

        <div v-if="beforeCrisisInfo.length === 0" class="empty-list">
          No information available for this category
        </div>

        <div v-else class="info-list">
          <div v-for="item in beforeCrisisInfo" :key="item.id" class="info-card">
            <div class="info-header">
              <h4>{{ item.title }}</h4>
              <div class="card-actions">
                <button @click="initEditForm(item)" class="btn-icon edit">✏️</button>
                <button @click="deleteGeneralInfo(item.id)" class="btn-icon delete">🗑️</button>
              </div>
            </div>
            <p class="info-content">{{ item.content }}</p>
          </div>
        </div>
      </div>

      <!-- During Crisis -->
      <div class="info-category">
        <h3 class="category-title during-crisis">During Crisis</h3>

        <div v-if="duringCrisisInfo.length === 0" class="empty-list">
          No information available for this category
        </div>

        <div v-else class="info-list">
          <div v-for="item in duringCrisisInfo" :key="item.id" class="info-card">
            <div class="info-header">
              <h4>{{ item.title }}</h4>
              <div class="card-actions">
                <button @click="initEditForm(item)" class="btn-icon edit">✏️</button>
                <button @click="deleteGeneralInfo(item.id)" class="btn-icon delete">🗑️</button>
              </div>
            </div>
            <p class="info-content">{{ item.content }}</p>
          </div>
        </div>
      </div>

      <!-- After Crisis -->
      <div class="info-category">
        <h3 class="category-title after-crisis">After Crisis</h3>

        <div v-if="afterCrisisInfo.length === 0" class="empty-list">
          No information available for this category
        </div>

        <div v-else class="info-list">
          <div v-for="item in afterCrisisInfo" :key="item.id" class="info-card">
            <div class="info-header">
              <h4>{{ item.title }}</h4>
              <div class="card-actions">
                <button @click="initEditForm(item)" class="btn-icon edit">✏️</button>
                <button @click="deleteGeneralInfo(item.id)" class="btn-icon delete">🗑️</button>
              </div>
            </div>
            <p class="info-content">{{ item.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.manage-general-info {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.admin-page-title {
  font-size: 28px;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

.alert {
  padding: 10px 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  position: relative;
}

.alert.error {
  background-color: #ffebee;
  color: #b71c1c;
  border: 1px solid #ef5350;
}

.alert.success {
  background-color: #e8f5e9;
  color: #1b5e20;
  border: 1px solid #66bb6a;
}

.close-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: inherit;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 15px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-primary:hover {
  background-color: #1565c0;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #d5d5d5;
}

.icon {
  margin-right: 5px;
}

.info-form {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-form h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.form-buttons {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  margin-top: 20px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.info-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-category {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-title {
  padding: 10px;
  border-radius: 4px;
  margin-top: 0;
  text-align: center;
  font-size: 18px;
}

.before-crisis {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.during-crisis {
  background-color: #fff8e1;
  color: #ff6f00;
}

.after-crisis {
  background-color: #e8f5e9;
  color: #1b5e20;
}

.empty-list {
  padding: 15px;
  text-align: center;
  color: #777;
  font-style: italic;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}

.info-card {
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.info-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.card-actions {
  display: flex;
  gap: 5px;
}

.btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-icon.edit:hover {
  background-color: #e3f2fd;
}

.btn-icon.delete:hover {
  background-color: #ffebee;
}

.info-content {
  margin: 0;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
  white-space: pre-line;
}

@media (max-width: 600px) {
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .nav-button {
    width: 100%;
  }
}
</style>
