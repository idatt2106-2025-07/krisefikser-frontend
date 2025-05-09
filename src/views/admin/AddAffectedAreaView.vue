<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const props = defineProps({
  longitude: {
    type: String,
    default: '',
  },
  latitude: {
    type: String,
    default: '',
  },
})

const lng = ref(props.longitude)
const lat = ref(props.latitude)
const name = ref('')
const highDangerRadius = ref('')
const mediumDangerRadius = ref('')
const lowDangerRadius = ref('')
const threatLevel = ref('')
const description = ref('')
const timeStarted = ref('')

watch(
  () => props.longitude,
  (newLng) => {
    lng.value = newLng
  },
)
watch(
  () => props.latitude,
  (newLat) => {
    lat.value = newLat
  },
)

async function saveIncident() {
  if (
    !lng.value ||
    !lat.value ||
    !name.value ||
    !highDangerRadius.value ||
    !mediumDangerRadius.value ||
    !lowDangerRadius.value ||
    !threatLevel.value ||
    !description.value ||
    !timeStarted.value
  ) {
    alert('Please fill all required fields.')
    return
  }

  const payload = {
    longitude: Number(lng.value),
    latitude: Number(lat.value),
    name: name.value,
    highDangerRadiusKm: Number(highDangerRadius.value),
    mediumDangerRadiusKm: Number(mediumDangerRadius.value),
    lowDangerRadiusKm: Number(lowDangerRadius.value),
    severityLevel: Number(threatLevel.value),
    description: description.value,
    startDate: new Date(timeStarted.value).toISOString(),
  }

  try {
    await axios.post('http://localhost:8080/api/affected-area', payload)
    alert('Incident saved!')
    clearForm()
  } catch (error) {
    alert('Error saving incident. Please try again.')
    console.error(error)
  }
}

function clearForm() {
  lng.value = ''
  lat.value = ''
  name.value = ''
  highDangerRadius.value = ''
  mediumDangerRadius.value = ''
  lowDangerRadius.value = ''
  threatLevel.value = ''
  description.value = ''
  timeStarted.value = ''
}
</script>

<template>
  <div class="form-container">
    <InputText v-model="lng" placeholder="Longitude (required)" />
    <InputText v-model="lat" placeholder="Latitude (required)" />
    <InputText v-model="name" placeholder="Name" />
    <InputText v-model="highDangerRadius" placeholder="High Danger Radius (km)" />
    <InputText v-model="mediumDangerRadius" placeholder="Medium Danger Radius (km)" />
    <InputText v-model="lowDangerRadius" placeholder="Low Danger Radius (km)" />
    <InputText v-model="threatLevel" placeholder="Severity Level (1-3)" />
    <InputText v-model="description" placeholder="Description" />
    <InputText v-model="timeStarted" type="datetime-local" placeholder="Start Date" />
    <Button label="Save Affected Area" @click="saveIncident" />
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
</style>
