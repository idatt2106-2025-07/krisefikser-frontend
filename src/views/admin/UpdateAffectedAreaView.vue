<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import mapService from '@/services/mapService'

const route = useRoute()
const router = useRouter()

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
  const id = route.query.id
  if (!id) {
    alert('No Affected Area ID provided!')
    router.push('/admin')
    return
  }

  try {
    console.log('Fetching all affected areas...')
    const allAffectedAreas = await mapService.getAffectedAreas()
    const foundArea = allAffectedAreas.find((area: any) => area.id === Number(id))

    if (foundArea) {
      affectedArea.value = foundArea

      highDangerRadiusKm.value = foundArea.highDangerRadiusKm.toString()
      mediumDangerRadiusKm.value = foundArea.mediumDangerRadiusKm.toString()
      lowDangerRadiusKm.value = foundArea.lowDangerRadiusKm.toString()
      severityLevel.value = foundArea.severityLevel.toString()
    } else {
      alert('Affected Area not found!')
      router.push('/admin')
    }
  } catch (error) {
    console.error('Error fetching affected areas:', error)
    alert('Failed to load affected area. Please try again.')
    router.push('/admin')
  }
})

const saveChanges = async () => {
  try {
    affectedArea.value.highDangerRadiusKm = Number(highDangerRadiusKm.value)
    affectedArea.value.mediumDangerRadiusKm = Number(mediumDangerRadiusKm.value)
    affectedArea.value.lowDangerRadiusKm = Number(lowDangerRadiusKm.value)
    affectedArea.value.severityLevel = Number(severityLevel.value)

    await mapService.updateAffectedArea(affectedArea.value.id, affectedArea.value)
    alert('Affected Area updated successfully!')
    router.push('/admin')
  } catch (error) {
    console.error('Error updating affected area:', error)
    alert('Failed to update affected area. Please try again.')
  }
}
</script>

<template>
  <div class="form-container">
    <h2>Update Affected Area</h2>
    <InputText v-model="affectedArea.description" placeholder="Description" />
    <InputText v-model="highDangerRadiusKm" placeholder="High Danger Radius (km)" />
    <InputText v-model="mediumDangerRadiusKm" placeholder="Medium Danger Radius (km)" />
    <InputText v-model="lowDangerRadiusKm" placeholder="Low Danger Radius (km)" />
    <InputText v-model="severityLevel" placeholder="Severity Level (1-3)" />
    <InputText v-model="affectedArea.startDate" type="datetime-local" placeholder="Start Date" />
    <Button label="Save Changes" @click="saveChanges" />
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
</style>
