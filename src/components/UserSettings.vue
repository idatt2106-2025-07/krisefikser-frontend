<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  type: string
}>()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const birthday = ref('')

function saveChanges() {
  alert(`Changes saved for ${type}`)
}
</script>

<template>
  <div class="settings-box">
    <h2>{{ type }} Settings</h2>
    <div v-if="type === 'Name'">
      <label for="firstName">First Name</label>
      <input id="firstName" v-model="firstName" type="text" placeholder="Enter your first name" />
      <label for="lastName">Last Name</label>
      <input id="lastName" v-model="lastName" type="text" placeholder="Enter your last name" />
    </div>
    <div v-if="type === 'Mail'">
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" placeholder="Enter your email" />
    </div>
    <div v-if="type === 'Password'">
      <label for="password">New Password</label>
      <input id="password" v-model="password" type="password" placeholder="Enter a new password" />
    </div>
    <div v-if="type === 'Birthday'">
      <label for="birthday">Birthday</label>
      <input id="birthday" v-model="birthday" type="date" />
    </div>
    <button class="save-btn" @click="saveChanges">Save Changes</button>
  </div>
</template>

<style scoped>
.settings-box {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

label {
  font-weight: 500;
  margin-top: 1rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.save-btn {
  background-color: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:hover {
  background-color: #0056b3;
}
</style>
