<script setup lang="ts">
import { ref, onMounted } from 'vue'
import mapService from '@/services/mapService'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const affectedAreaId = ref('')
const loadedAreas = ref([])

const affectedArea = ref({
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

const highDangerRadiusKm = ref('')
const mediumDangerRadiusKm = ref('')
const lowDangerRadiusKm = ref('')
const severityLevel = ref('')

onMounted(async () => {
  try {
    console.log('Fetching all affected areas...')
    const allAffectedAreas = await mapService.getAffectedAreas()
    loadedAreas.value = allAffectedAreas.map((area) => ({
      label: `${area.id}: ${area.description || 'Area ' + area.id}`,
      value: area.id,
    }))
  } catch (error) {
    console.error('Error fetching affected areas:', error)
    alert('Failed to load affected areas. Please refresh the page.')
  }
})

const loadArea = async () => {
  if (!affectedAreaId.value) {
    alert('Please select an affected area!')
    return
  }

  try {
    console.log('Fetching all affected areas...')
    const allAffectedAreas = await mapService.getAffectedAreas()
    const foundArea = allAffectedAreas.find((area) => area.id === Number(affectedAreaId.value))

    if (foundArea) {
      affectedArea.value = foundArea

      highDangerRadiusKm.value = foundArea.highDangerRadiusKm.toString()
      mediumDangerRadiusKm.value = foundArea.mediumDangerRadiusKm.toString()
      lowDangerRadiusKm.value = foundArea.lowDangerRadiusKm.toString()
      severityLevel.value = foundArea.severityLevel.toString()
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
    console.error('Error fetching affected areas:', error)
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

    // Reset form instead of redirecting
    affectedAreaId.value = ''
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
    <Dropdown
      v-model="affectedAreaId"
      :options="loadedAreas"
      optionLabel="label"
      optionValue="value"
      placeholder="Select Affected Area to Update"
    />
    <Button label="Load Affected Area" @click="loadArea" />

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
