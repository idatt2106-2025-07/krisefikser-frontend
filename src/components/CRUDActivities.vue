<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'

interface Activity {
  id: number
  name: string
  group: string
}

// Fixed activity types
const activityTypes = ['information', 'quiz']

const router = useRouter() // Import router to allow navigation

const activities = ref<Activity[]>([]) // List of activities
const newActivity = ref<Activity>({ id: 0, name: '', group: '' }) // For creating/updating
const isEditing = ref(false) // Track if editing an activity
const selectedActivityId = ref<number | null>(null) // Track selected activity for editing

// Add a new activity
function addActivity() {
  if (!newActivity.value.name || !newActivity.value.group) {
    alert('Please fill in all fields.')
    return
  }
  // If "quiz" is selected, push to "quiz-creator" view
  if (newActivity.value.group === 'quiz') {
    router.push('/quiz-creator')
    return
  }
  newActivity.value.id = Date.now() // Generate a unique ID
  activities.value.push({ ...newActivity.value })
  resetForm()
}

// Update an existing activity
function updateActivity() {
  if (!selectedActivityId.value) return
  const index = activities.value.findIndex((activity) => activity.id === selectedActivityId.value)
  if (index !== -1) {
    activities.value[index] = { ...newActivity.value }
    resetForm()
    isEditing.value = false
    selectedActivityId.value = null
  }
}

// Delete an activity
function deleteActivity(id: number) {
  activities.value = activities.value.filter((activity) => activity.id !== id)
}

// Edit an activity
function editActivity(activity: Activity) {
  isEditing.value = true
  selectedActivityId.value = activity.id
  newActivity.value = { ...activity }
}

// Reset the form
function resetForm() {
  newActivity.value = { id: 0, name: '', group: '' }
}
</script>

<template>
  <div class="crud-activities">
    <h2>Manage Gamification Activities</h2>

    <!-- Form for creating/updating activities -->
    <form @submit.prevent="isEditing ? updateActivity() : addActivity()">
      <div class="field">
        <label for="name">Activity Name</label>
        <InputText id="name" v-model="newActivity.name" placeholder="Enter activity name" />
      </div>
      <div class="field">
        <label for="group">Activity Type</label>
        <Dropdown
          id="group"
          v-model="newActivity.group"
          :options="activityTypes"
          placeholder="Select activity type"
        />
      </div>
      <div class="button-group">
        <Button
          type="submit"
          :label="isEditing ? 'Update Activity' : 'Add Activity'"
          class="p-mr-2"
        />
        <Button
          v-if="isEditing"
          type="button"
          label="Cancel"
          class="p-button-secondary"
          @click="resetForm"
        />
      </div>
    </form>

    <!-- List of activities -->
    <div v-if="activities.length" class="activities-list">
      <h3>Existing Activities</h3>
      <div class="p-grid">
        <Card v-for="activity in activities" :key="activity.id" class="p-col-12 p-md-6 p-lg-4">
          <h4>{{ activity.name }}</h4>
          <p>Type: {{ activity.group }}</p>
          <div class="card-buttons">
            <Button
              label="Edit"
              icon="pi pi-pencil"
              class="p-button-sm p-button-text"
              @click="editActivity(activity)"
            />
            <Button
              label="Delete"
              icon="pi pi-trash"
              class="p-button-sm p-button-text p-button-danger"
              @click="deleteActivity(activity.id)"
            />
          </div>
        </Card>
      </div>
    </div>
    <p v-else>No activities available.</p>
  </div>
</template>

<style scoped>
.crud-activities {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}
.field {
  margin-bottom: 1rem;
}
.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}
.button-group {
  margin-top: 1rem;
}
.activities-list {
  margin-top: 2rem;
}
.card-buttons {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
