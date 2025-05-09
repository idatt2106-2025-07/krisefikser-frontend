<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import type { PointOfInterest } from '@/types/mapTypes'
import mapService from '@/services/mapService'

const props = defineProps({
  poiId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['update:poiId'])

const router = useRouter()

const poi = ref<PointOfInterest | null>(null)
const isLoading = ref(false)

watch(
  () => props.poiId,
  async (newPoiId) => {
    console.log('POI ID recieved:', newPoiId)
    if (newPoiId !== null) {
      await loadPOI(newPoiId)
    }
  },
)

async function loadPOI(poiId: number) {
  try {
    isLoading.value = true
    const response = await mapService.getAllPointsOfInterest()
    const foundPoi = response.find((p: PointOfInterest) => p.id === poiId)

    if (foundPoi) {
      console.log('POI found:', foundPoi)
      poi.value = foundPoi
    } else {
      alert('POI not found!')
      poi.value = null
    }
  } catch (error) {
    console.error('Failed to load POI:', error)
    alert('Failed to load POI data. Please try again.')
  } finally {
    isLoading.value = false
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
    emit('update:poiId', id)
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
    <div v-if="poi" class="poi-edit-form">
      <h3>Edit POI #{{ poi.id }}</h3>
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
