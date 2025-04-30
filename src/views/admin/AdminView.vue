<!-- AdminView.vue -->
<template>
  <h1 class="title">Admin Panel</h1>
  <div class="admin-page">
    <Tabs v-model:value="value" class="w-full">
      <TabList>
        <Tab v-for="(tab, index) in tabs" :key="index" :value="index.toString()">
          {{ tab.label }}
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel v-for="(tab, index) in tabs" :key="index" :value="index.toString()">
<<<<<<< HEAD
          <AdminPanel v-if="tab.type !== 'InviteAdmin'" :type="tab.type === 'Users' ? 'User' : tab.type" />
          <div v-else>
            <h2>Invite Admin</h2>
            <form @submit.prevent="handleInviteAdmin">
              <div class="field">
                <label for="email">Admin Email</label>
                <input
                  id="email"
                  type="email"
                  v-model="email"
                  placeholder="Enter admin email"
                  required
                />
              </div>
              <button type="submit" :disabled="loading">
                {{ loading ? 'Sending...' : 'Send Invite' }}
              </button>
              <p v-if="message" :class="{ success: success, error: !success }">{{ message }}</p>
            </form>
          </div>
=======
          <AdminPanel :type="tab.type === 'Users' ? 'User' : tab.type" />
>>>>>>> 80cb168 (organized the codebase)
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
<<<<<<< HEAD
<<<<<<< HEAD
import axios from 'axios'
import AdminPanel from '@/components/admin/AdminPanel.vue' // Adjust the path as needed
=======
import AdminPanel from '@/components/AdminPanel.vue' // Adjust the path as needed
>>>>>>> 80cb168 (organized the codebase)
=======
import AdminPanel from '@/components/admin/AdminPanel.vue' // Adjust the path as needed
>>>>>>> 0b5c3e9 (fixed imports in files)

/* PrimeVue v4 components */
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'

const tabs = [
  { label: 'Manage Map', type: 'Map' },
  { label: 'Gameification', type: 'Gameification' },
  { label: 'Manage Users', type: 'Users' },
<<<<<<< HEAD
  { label: 'Invite Admin', type: 'InviteAdmin' },
=======
>>>>>>> 80cb168 (organized the codebase)
] as const

const value = ref('0') // Default to the first tab

<<<<<<< HEAD
// Invite Admin state
const email = ref('')
const loading = ref(false)
const message = ref('')
const success = ref(false)

async function handleInviteAdmin() {
  loading.value = true
  message.value = ''
  success.value = false

  try {
    // Use the full backend endpoint
    const response = await axios.post('/api/admin/invite', { email: email.value })
    message.value = response.data
    success.value = true
  } catch (error) {
    console.error(error)
    if (axios.isAxiosError(error) && error.response) {
      message.value = error.response.data || 'Failed to send invite'
    } else {
      message.value = 'Failed to send invite'
    }
    success.value = false
  } finally {
    loading.value = false
  }
=======
const showAddIconForm = ref(false)
const iconType = ref('')
const iconTypes = [
  'Shelter',
  'Affected Area',
  'Defibrillator',
  'Water Station',
  'Food central',
  'Hospital',
]

function handleAddIcon() {
  if (!iconType.value) {
    alert('Please select an icon type.')
    return
  }
  alert(`Icon added: Type – ${iconType.value}`)
  showAddIconForm.value = false
>>>>>>> 80cb168 (organized the codebase)
}
</script>

<style scoped>
/* ----- layout & content ----- */
.admin-container {
  display: flex;
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.content {
  flex: 1;
  padding: 2rem;
  text-align: center;
}

.admin-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

<<<<<<< HEAD
.field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

button {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.success {
  color: green;
  margin-top: 1rem;
}

.error {
  color: red;
  margin-top: 1rem;
}
=======
/* keep your existing .button-group, .add-icon-form, etc. */
>>>>>>> 80cb168 (organized the codebase)
</style>
