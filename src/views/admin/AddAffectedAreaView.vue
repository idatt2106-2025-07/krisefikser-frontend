<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const lng = Number(route.query.lng)
const lat = Number(route.query.lat)

const name = ref('')
const highDangerRadius = ref('')
const mediumDangerRadius = ref('')
const lowDangerRadius = ref('')
const threatLevel = ref('')
const description = ref('')
const timeStarted = ref('')

async function saveIncident() {
  if (
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
    longitude: lng,
    latitude: lat,
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
    router.push('/admin')
  } catch (error) {
    alert('Error saving incident. Please try again.')
    console.error(error)
  }
}
</script>

<template>
  <div class="form-container">
    <h2>Add Affected Area / Incident</h2>
    <p>Longitude: {{ lng }}</p>
    <p>Latitude: {{ lat }}</p>
    <InputText v-model="name" placeholder="Name" />
    <InputText v-model="highDangerRadius" placeholder="High Danger Radius (km)" />
    <InputText v-model="mediumDangerRadius" placeholder="Medium Danger Radius (km)" />
    <InputText v-model="lowDangerRadius" placeholder="Low Danger Radius (km)" />
    <InputText v-model="threatLevel" placeholder="Severity Level (1-3)" />
    <InputText v-model="description" placeholder="Description" />
    <InputText v-model="timeStarted" type="datetime-local" placeholder="Start Date" />
    <Button label="Save" @click="saveIncident" />
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
