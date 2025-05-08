<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import householdService from '@/services/HouseholdService'

const route = useRoute()
const router = useRouter()
const token = ref(route.query.token as string || '')
const invitation = ref<any>(null)
const error = ref('')
const isLoading = ref(true)
const isAccepting = ref(false)
const acceptError = ref('')
const acceptSuccess = ref('')

onMounted(async () => {
  if (!token.value) {
    error.value = 'No invitation token provided.'
    isLoading.value = false
    return
  }
  try {
    invitation.value = await householdService.verifyInvitation(token.value)
  } catch (e: any) {
    error.value = e?.response?.data || 'Invalid or expired invitation.'
  } finally {
    isLoading.value = false
  }
})

const acceptInvitation = async () => {
  acceptError.value = ''
  acceptSuccess.value = ''
  isAccepting.value = true
  try {
    await householdService.acceptInvitation(token.value)
    acceptSuccess.value = 'Invitation accepted! You are now a member of the household.'
    setTimeout(() => router.push('/household'), 1500)
  } catch (e: any) {
    acceptError.value = e?.response?.data || 'Failed to accept invitation.'
  } finally {
    isAccepting.value = false
  }
}
</script>

<template>
  <div class="verify-container">
    <h2>Household Invitation</h2>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <p>
        You have been invited to join the household:
        <b>{{ invitation.householdName || invitation.household?.name }}</b>
      </p>
      <div v-if="acceptError" class="error">{{ acceptError }}</div>
      <div v-if="acceptSuccess" class="success">{{ acceptSuccess }}</div>
      <button @click="acceptInvitation" :disabled="isAccepting">
        {{ isAccepting ? 'Accepting...' : 'Accept Invitation' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.verify-container {
  max-width: 400px;
  margin: 60px auto;
  padding: 32px 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  text-align: center;
}
.error {
  color: #b91c1c;
  margin-bottom: 12px;
}
.success {
  color: #15803d;
  margin-bottom: 12px;
}
button {
  background: #0ea5e9;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 18px;
  transition: background 0.2s;
}
button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
</style>
