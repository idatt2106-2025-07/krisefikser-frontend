<script setup lang="ts">
import { ref } from 'vue'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import UserSettings from '@/components/UserSettings.vue'

// The currently selected tab value – default "0" opens the Name tab
const value = ref('0')

const tabs = [
  { label: 'Name', type: 'Name' },
  { label: 'Email', type: 'Email' },
  { label: 'Password', type: 'Password' },
  { label: 'Birthday', type: 'Birthday' }
] as const
</script>

<template>
  <div class="settings-view">
    <Tabs v-model:value="value" class="w-full">
      <TabList class ="tab-list">
        <Tab
          v-for="(tab, index) in tabs"
          :key="index"
          :value="index.toString()"
        >
          {{ tab.label }}
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel
          v-for="(tab, index) in tabs"
          :key="index"
          :value="index.toString()"
        >
          <UserSettings :type="tab.type" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<style scoped>
.settings-view {
  max-width: 500px;
  margin: 2rem auto;
}

.tab-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
