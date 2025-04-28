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
          <AdminPanel :type="tab.type" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminPanel from '@/components/AdminPanel.vue' // Adjust the path as needed

/* PrimeVue v4 components */
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'

import Map from '@/components/TheMap.vue'

const tabs = [
  { label: 'Manage Map', type: 'Map' },
  { label: 'Gameification', type: 'Gameification' },
  { label: 'Manage Users', type: 'Users' },
] as const

const value = ref('0') // Default to the first tab

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

/* keep your existing .button-group, .add-icon-form, etc. */
</style>
