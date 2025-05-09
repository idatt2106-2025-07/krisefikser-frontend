<script setup lang="ts">
import { ref, watch } from 'vue'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import axios from 'axios'

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

const emit = defineEmits(['poi-added'])

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
const lng = ref(props.longitude)
const lat = ref(props.latitude)

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

async function savePOI() {
  if (!type.value || !lng.value || !lat.value) {
    alert('Please fill in all required fields')
    return
  }

  const poiRequest = {
    latitude: Number(lat.value),
    longitude: Number(lng.value),
    type: type.value,
    opensAt: openingHours.value || null,
    closesAt: closingHours.value || null,
    contactNumber: contactInfo.value || null,
    description: description.value || null,
  }

  try {
    await axios.post('http://dev.krisefikser.localhost:8080/api/point-of-interest', poiRequest, {
      withCredentials: true,
    })
    alert('Point of Interest saved successfully!')
    emit('poi-added')
    clearForm()
  } catch (error) {
    console.error('Failed to save POI:', error)
    alert('Failed to save Point of Interest. Please try again.')
  }
}

function clearForm() {
  type.value = ''
  description.value = ''
  openingHours.value = ''
  closingHours.value = ''
  contactInfo.value = ''
  lng.value = ''
  lat.value = ''
}
</script>

<template>
  <div class="form-container">
    <InputText v-model="lng" placeholder="Longitude (required)" />
    <InputText v-model="lat" placeholder="Latitude (required)" />
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
    <Button label="Save Point of Interest" @click="savePOI" />
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
