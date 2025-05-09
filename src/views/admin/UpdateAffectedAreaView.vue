<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import mapService from '@/services/mapService'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

interface AffectedArea {
  id: number
  longitude: number
  latitude: number
  highDangerRadiusKm: number
  mediumDangerRadiusKm: number
  lowDangerRadiusKm: number
  severityLevel: number
  description: string
  startDate: string
}

const props = defineProps({
  affectedAreaId: {
    type: Number,
    required: true,
  },
})

const loadedAreas = ref([])

const affectedArea = ref<AffectedArea>({
  id: 0,
  longitude: 0,
  latitude: 0,
  highDangerRadiusKm: 0,
  mediumDangerRadiusKm: 0,
  lowDangerRadiusKm: 0,
  severityLevel: 0,
  description: '',
  startDate: '',
})

const selectedAreaId = ref<number | null>(props.affectedAreaId)

const highDangerRadiusKm = ref('')
const mediumDangerRadiusKm = ref('')
const lowDangerRadiusKm = ref('')
const severityLevel = ref('')

onMounted(async () => {
  try {
    console.log('Fetching all affected areas...')
    const allAffectedAreas = await mapService.getAffectedAreas()
    loadedAreas.value = allAffectedAreas.map((area: AffectedArea) => ({
      label: `${area.id}: ${area.description || 'Area ' + area.id}`,
      value: area.id,
    }))
  } catch (error) {
    console.error('Error fetching affected areas:', error)
    alert('Failed to load affected areas. Please refresh the page.')
  }
})

watch(
  () => props.affectedAreaId,
  async (newAreaId) => {
    console.log('New affected area ID received:', newAreaId)
    selectedAreaId.value = newAreaId

    if (newAreaId !== null) {
      await loadAffectedArea(newAreaId)
    }
  },
)

async function loadAffectedArea(areaId: number) {
  try {
    console.log('Fetching affected area data for ID:', areaId)
    const allAffectedAreas = await mapService.getAffectedAreas()
    const foundArea = allAffectedAreas.find((area: AffectedArea) => area.id === areaId)

    if (foundArea) {
      console.log('Affected Area found:', foundArea)
      affectedArea.value = foundArea
    } else {
      alert('Affected Area not found!')
      affectedArea.value = {
        id: 0,
        longitude: 0,
        latitude: 0,
        highDangerRadiusKm: 0,
        mediumDangerRadiusKm: 0,
        lowDangerRadiusKm: 0,
        severityLevel: 0,
        description: '',
        startDate: '',
      }
    }
  } catch (error) {
    console.error('Error fetching affected area:', error)
    alert('Failed to load affected area. Please try again.')
  }
}

const saveChanges = async () => {
  try {
    affectedArea.value.highDangerRadiusKm = Number(highDangerRadiusKm.value)
    affectedArea.value.mediumDangerRadiusKm = Number(mediumDangerRadiusKm.value)
    affectedArea.value.lowDangerRadiusKm = Number(lowDangerRadiusKm.value)
    affectedArea.value.severityLevel = Number(severityLevel.value)

    await mapService.updateAffectedArea(affectedArea.value.id, affectedArea.value)
    alert('Affected Area updated successfully!')

    resetForm()
  } catch (error) {
    console.error('Error updating affected area:', error)
    alert('Failed to update affected area. Please try again.')
  }
}

function resetForm() {
  affectedArea.value = {
    id: 0,
    longitude: 0,
    latitude: 0,
    highDangerRadiusKm: 0,
    mediumDangerRadiusKm: 0,
    lowDangerRadiusKm: 0,
    severityLevel: 0,
    description: '',
    startDate: '',
  }
  highDangerRadiusKm.value = ''
  mediumDangerRadiusKm.value = ''
  lowDangerRadiusKm.value = ''
  severityLevel.value = ''
}
</script>

<template>
  <div class="form-container">
    <div v-if="affectedArea.id" class="area-edit-form">
      <h3>Edit Affected Area #{{ affectedArea.id }}</h3>
      <InputText v-model="affectedArea.description" placeholder="Description" />
      <InputText v-model="highDangerRadiusKm" placeholder="High Danger Radius (km)" />
      <InputText v-model="mediumDangerRadiusKm" placeholder="Medium Danger Radius (km)" />
      <InputText v-model="lowDangerRadiusKm" placeholder="Low Danger Radius (km)" />
      <InputText v-model="severityLevel" placeholder="Severity Level (1-3)" />
      <InputText v-model="affectedArea.startDate" type="datetime-local" placeholder="Start Date" />
      <Button label="Save Changes" @click="saveChanges" />
    </div>
  </div>
</template>

<style scoped>
.area-edit-form {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}
</style>
