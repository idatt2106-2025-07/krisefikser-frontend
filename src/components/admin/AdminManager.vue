<template>
  <div class="admin-management">
    <h2>Super Admin Dashboard</h2>

    <div class="invite-section">
      <h3>Invite New Admin</h3>
      <form @submit.prevent="invite">
        <input v-model="inviteEmail" type="email" placeholder="Admin email" required />
        <button type="submit">Send Invite</button>
      </form>
    </div>

    <div class="admins-list">
      <h3>Existing Admins</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="admin in admins" :key="admin.id">
            <td>{{ admin.id }}</td>
            <td>{{ admin.email }}</td>
            <td class="actions">
              <button @click="deleteAdmin(admin.id)" class="delete-btn">Delete</button>
              <button @click="sendResetLink(admin.email)" class="reset-btn">Reset Password</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="listError" class="error-message">{{ listError }}</p>
    </div>

    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" :class="['toast', t.type]">
        {{ t.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Admin {
  id: number
  email: string
}
interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

const inviteEmail = ref('')
const admins = ref<Admin[]>([])
const listError = ref<string | null>(null)
const toasts = ref<Toast[]>([])

const fetchAdmins = async () => {
  listError.value = null
  try {
    const { data } = await axios.get<Admin[]>('/api/super-admin/admins')
    admins.value = data
  } catch (err: any) {
    listError.value = err.response?.data || err.message
  }
}

function addToast(message: string, type: 'success' | 'error' = 'success') {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, 3000)
}

const invite = async () => {
  try {
    await axios.post('/api/super-admin/invite', {
      email: inviteEmail.value,
    })
    addToast('Invite sent successfully', 'success')
    inviteEmail.value = ''
    fetchAdmins()
  } catch (err: any) {
    addToast(err.response?.data || err.message, 'error')
  }
}

const deleteAdmin = async (id: number) => {
  try {
    await axios.delete(`/api/super-admin/delete/${id}`)
    addToast('Admin removed', 'success')
    fetchAdmins()
  } catch (err: any) {
    addToast('Error removing admin: ' + (err.response?.data || err.message), 'error')
  }
}

const sendResetLink = async (email: string) => {
  try {
    await axios.post('/api/super-admin/admins/new-password-link', email, {
      headers: { 'Content-Type': 'text/plain' },
    })
    addToast('Reset link sent to ' + email, 'success')
  } catch (err: any) {
    addToast('Error: ' + (err.response?.data || err.message), 'error')
  }
}

onMounted(fetchAdmins)
</script>

<style scoped>
.admin-management {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a365d;
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

h3 {
  font-size: 1.25rem;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 1.5rem;
  text-align: center;
}

.invite-section {
  margin-bottom: 3rem;
  width: 100%;
}

.invite-section form {
  display: flex;
  gap: 0.75rem;
  max-width: 600px;
  margin: 0 auto;
}

.invite-section input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.invite-section input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.invite-section button {
  padding: 0.75rem 1.5rem;
  background-color: #38a169;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.invite-section button:hover {
  background-color: #2f855a;
  transform: translateY(-1px);
}

.admins-list {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

th {
  background-color: #f7fafc;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

tr:hover {
  background-color: #f8fafc;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.delete-btn,
.reset-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn {
  background-color: #e53e3e;
  color: white;
}

.delete-btn:hover {
  background-color: #c53030;
  transform: translateY(-1px);
}

.reset-btn {
  background-color: #dd6b20;
  color: white;
}

.reset-btn:hover {
  background-color: #c05621;
  transform: translateY(-1px);
}

.error-message {
  color: #e53e3e;
  margin-top: 1rem;
  text-align: center;
}

.toast-container {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 50;
}

.toast {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
}

.toast.success {
  background-color: #38a169;
}

.toast.error {
  background-color: #e53e3e;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .admin-management {
    padding: 1rem;
    margin: 1rem;
  }

  .invite-section form {
    flex-direction: column;
  }

  .actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  th,
  td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
