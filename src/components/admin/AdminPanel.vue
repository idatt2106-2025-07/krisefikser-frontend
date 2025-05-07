<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import TheMap from '@/components/map/TheMap.vue'
import GameificationSettings from '@/components/admin/CRUDActivities.vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  isAdminPage: {
    type: Boolean,
    default: false,
  },
})

const showAddIconForm = ref(false)
const iconType = ref('')
const iconTypes = [
  'Shelter',
  'Affected Area',
  'Defibrillator',
  'Water Station',
  'Food Central',
  'Hospital',
]

const router = useRouter()

function handleAddIcon() {
  if (!iconType.value) {
    alert('Please select an icon type.')
    return
  }
  alert(`Icon added: Type – ${iconType.value}`)
  showAddIconForm.value = false
}

function save() {
  alert(`${props.type} settings saved!`)
}

function handleMapClick({ lng, lat }: { lng: number; lat: number }) {
  console.log('Map clicked at:', lng, lat)
  router.push({ name: 'AddPOI', query: { lng, lat } })
}
</script>

<template>
  <div class="admin-panel">
    <div v-if="props.type === 'Map'" class="map-panel">
      <TheMap :isAdminPage="props.isAdminPage" @map-click="handleMapClick" />
      <div class="buttons">
        <Button label="Add Icon" @click="showAddIconForm = true" />
        <Button label="Save Changes" @click="save" class="mt-2" />
      </div>
      <div v-if="showAddIconForm" class="add-icon-form">
        <h3>Add Icon</h3>
        <Dropdown v-model="iconType" :options="iconTypes" placeholder="Select Icon Type" />
        <Button label="Add" @click="handleAddIcon" class="mt-2" />
      </div>
    </div>

    <div v-else-if="props.type === 'Gameification'" class="gameification-panel">
      <GameificationSettings />
      <Button label="Save Changes" @click="save" class="mt-2" />
    </div>

    <div v-else-if="props.type === 'User'" class="user-panel">
      <h2>Manage Users</h2>
      <p>Manage user accounts and permissions here.</p>
      <Button label="Save Changes" @click="save" class="mt-2" />
    </div>
  </div>
</template>

<style scoped>
.admin-panel {
  padding: 2rem;
}

.map-panel,
.gameification-panel,
.user-panel {
  text-align: center;
  height: 600px;
  position: relative;
}

.buttons {
  margin-top: 1rem;
}

.add-icon-form {
  margin-top: 1rem;
}

.add-icon-form h3 {
  margin-bottom: 1rem;
}

.admin-container {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  border: 2px solid #000;
  border-radius: 12px;
  background: #fff;
}

:deep(.sidebar) {
  width: 200px;
  display: flex;
  flex-direction: column;
  border-right: 2px solid #000;
}

:deep(.sidebar-item) {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 1px solid #000;
  transition:
    background-color 0.3s,
    color 0.3s;
}

:deep(.sidebar-item[aria-selected='true']) {
  background: #18daff80;
  color: #fff;
}

:deep(.content-wrapper) {
  flex: 1;
}

:deep(.p-tabpanel) {
  padding: 2rem;
}
</style>
