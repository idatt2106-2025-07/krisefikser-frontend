<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import type { PointOfInterest, LocationData } from '@/types/mapTypes'
import mapService from '@/services/mapService'

const route = useRoute()
const router = useRouter()

const locationData = ref<LocationData>({
  pointsOfInterest: [],
  affectedAreas: [],
})

const poi = ref<PointOfInterest | null>(null)
const isLoading = ref(false)
const poiId = ref('')
const loadedPOIs = ref([])

const types = [
  { label: 'Hospital', value: 'HOSPITAL' },
  { label: 'Emergency Shelter', value: 'SHELTER' },
  { label: 'Defibrillator', value: 'DEFIBRILLATOR' },
  { label: 'Water Station', value: 'WATER_STATION' },
  { label: 'Food Central', value: 'FOOD_CENTRAL' },
  { label: 'Meeting Place', value: 'MEETING_PLACE' },
]

onMounted(async () => {
  try {
    console.log('Fetching POI data in UpdatePOIView...')
    const response = await mapService.getAllPointsOfInterest()
    locationData.value.pointsOfInterest = response
    loadedPOIs.value = response.map((poi) => ({
      label: `${poi.id}: ${poi.description || poi.type}`,
      value: poi.id,
    }))
  } catch (error) {
    console.error('Failed to fetch POIs:', error)
    alert('Failed to load POI data. Please refresh the page.')
  }
})

const loadPOI = () => {
  if (!poiId.value) {
    alert('Please select a POI ID!')
    return
  }

  const id = Number(poiId.value)
  const foundPoi = locationData.value.pointsOfInterest.find((p) => p.id === id)

  if (foundPoi) {
    poi.value = foundPoi
  } else {
    alert('POI not found!')
    poi.value = null
  }
}

const saveChanges = async () => {
  if (!poi.value) {
    alert('No POI data available!')
    return
  }

  try {
    isLoading.value = true

    const { id, ...updatedData } = poi.value

    await mapService.updatePointOfInterest(id, updatedData)
    alert('POI updated successfully!')
    poiId.value = ''
    poi.value = null
  } catch (error) {
    console.error('Error updating POI:', error)
    alert('Failed to update POI. Please try again.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="form-container">
    <Dropdown
      v-model="poiId"
      :options="loadedPOIs"
      optionLabel="label"
      optionValue="value"
      placeholder="Select POI to Update"
    />
    <Button label="Load POI" @click="loadPOI" />

    <div v-if="poi" class="poi-edit-form">
      <h3>Edit POI #{{ poi.id }}</h3>
      <Dropdown
        v-model="poi.type"
        :options="types"
        optionLabel="label"
        optionValue="value"
        placeholder="Select Type (required)"
      />
      <InputText v-model="poi.description" placeholder="Description" />
      <InputText v-model="poi.opensAt" placeholder="Opening Time" />
      <InputText v-model="poi.closesAt" placeholder="Closing Time" />
      <InputText v-model="poi.contactNumber" placeholder="Contact Info" />
      <Button label="Save Changes" :loading="isLoading" @click="saveChanges" />
    </div>
  </div>
</template>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

h2 {
  text-align: center;
}

p {
  margin: 0;
}

.poi-edit-form {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}
</style>
