<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import axios from 'axios'

interface Props {
  type: 'Name' | 'Email' | 'Password' | 'Birthday'
}

const props = defineProps<Props>()

// form state
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const birthday = ref<Date | null>(null)

// regex for basic e‑mail validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emailError = computed(
  () => props.type === 'Email' && !!email.value && !emailRegex.test(email.value),
)

const formValid = computed(() => {
  switch (props.type) {
    case 'Name':
      return !!firstName.value && !!lastName.value
    case 'Email':
      return !!email.value && !emailError.value
    case 'Password':
      return !!password.value
    case 'Birthday':
      return !!birthday.value
    default:
      return false
  }
})

// reset fields whenever the tab (props.type) changes
watch(
  () => props.type,
  () => {
    firstName.value = ''
    lastName.value = ''
    email.value = ''
    password.value = ''
    birthday.value = null
  },
  { immediate: true }, // Ensure fields are reset when the component is initialized
)

function save() {
  alert(`${props.type} settings saved!`)
}

// For email change functionality
const newEmail = ref('')
const isLoading = ref(false)

async function handleEmailChange() {
  if (!newEmail.value) {
    return alert('Please enter a new email address.')
  }

  try {
    isLoading.value = true

    // Calling the change-email endpoint
    const response = await axios.post(
      'http://localhost:8080/api/user/change-email',
      {
        newEmail: newEmail.value,
      },
      {
        withCredentials: true,
      },
    )

    alert(response.data.message)
  } catch (error) {
    console.error('Error updating email:', error)
    alert('Error updating email. Please try again.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="settings-box p-fluid">
    <!-- Name -->
    <template v-if="props.type === 'Name'">
      <div class="field">
        <label for="fn">First Name</label>
        <InputText id="fn" v-model="firstName" placeholder="Enter first name" />
      </div>
      <div class="field">
        <label for="ln">Last Name</label>
        <InputText id="ln" v-model="lastName" placeholder="Enter last name" />
      </div>
    </template>

    <!-- Email -->
    <template v-else-if="props.type === 'Email'">
      <div class="field">
        <label for="email">Email</label>
        <InputText
          id="email"
          v-model="email"
          placeholder="Enter email"
          :class="{ 'p-invalid': emailError }"
        />
        <small v-if="emailError" class="p-error">Email invalid</small>
      </div>
      <h3>Change Email</h3>
      <div class="field">
        <label for="new-email">New Email</label>
        <input
          id="new-email"
          type="email"
          v-model="newEmail"
          placeholder="Enter new email"
          :disabled="isLoading"
        />
      </div>
      <button @click="handleEmailChange" :disabled="isLoading">
        {{ isLoading ? 'Updating...' : 'Update Email' }}
      </button>
    </template>

    <!-- Password -->
    <template v-else-if="props.type === 'Password'">
      <div class="field password-field">
        <label for="password">Password</label>
        <Password id="password" v-model="password" toggleMask placeholder="Password" />
      </div>
    </template>

    <!-- Birthday -->
    <template v-else>
      <div class="field">
        <label for="bd">Birthday</label>
        <DatePicker id="bd" v-model="birthday" placeholder="Pick a date" dateFormat="yy-mm-dd" />
      </div>
    </template>

    <Button label="Save Changes" @click="save" :disabled="!formValid" class="mt-2" />
  </div>
</template>

<style scoped>
.settings-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  width: 100%;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.p-invalid {
  border-color: red;
}

.field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

/* make PrimeVue inputs 100% wide */
.field :deep(.p-inputtext),
.field :deep(.p-password-input) {
  width: 100%;
}

button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
