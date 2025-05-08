<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const types = [
  { label: 'Defibrillator', value: 'defibrillator' },
  { label: 'Emergency Shelter', value: 'shelter' },
  { label: 'Food Central', value: 'food_central' },
  { label: 'Water Station', value: 'water_station' },
  { label: 'Hospital', value: 'hospital' },
  { label: 'Meeting Place', value: 'meeting_place' },
]

const type = ref('')
const description = ref('')
const openingHours = ref('')
const closingHours = ref('')
const contactInfo = ref('')
const lng = route.query.lng
const lat = route.query.lat

async function savePOI() {
  if (!type.value) {
    alert('Please fill in required fields')
    return
  }

  const poiRequest = {
    latitude: Number(lat),
    longitude: Number(lng),
    type: type.value,
    opensAt: openingHours.value || null,
    closesAt: closingHours.value || null,
    contactNumber: contactInfo.value || null,
    description: description.value || null,
  }

  try {
    await axios.post('http://localhost:8080/api/point-of-interest', poiRequest, {
      withCredentials: true,
    })
    alert('Point of Interest saved successfully!')
    router.push('/admin')
  } catch (error) {
    console.error('Failed to save POI:', error)
    alert('Failed to save Point of Interest. Please try again.')
  }
}
</script>

<template>
  <div class="form-container">
    <h2>Add Point of Interest</h2>
    <p>Longitude: {{ lng }}</p>
    <p>Latitude: {{ lat }}</p>
    <Dropdown
      v-model="type"
      :options="types"
      optionLabel="label"
      optionValue="value"
      placeholder="Select Type (required)"
    />
    <InputText v-model="description" placeholder="Description" />
    <InputText v-model="openingHours" placeholder="Opening Time" />
    <InputText v-model="closingHours" placeholder="Closing Time" />
    <InputText v-model="contactInfo" placeholder="Contact Info" />
    <Button label="Save" @click="savePOI" />
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
