<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isMenuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const hamburgerRef = ref<HTMLElement | null>(null)

const navigateToProfile = () => {
  router.push('/profile')
}

const logout = async () => {
  try {
    await axios.post('/api/auth/logout', {}, { withCredentials: true })
  } catch (err) {
    console.warn('Logout error:', err)
  }
  authStore.clearToken()
  router.push('/login')
}

const navigateToHome = () => {
  router.push('/')
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const navigateTo = (path: string) => {
  router.push(path)
  isMenuOpen.value = false
}

// Close menu when clicking outside
function handleClickOutside(event: MouseEvent) {
  if (
    isMenuOpen.value &&
    menuRef.value &&
    hamburgerRef.value &&
    !menuRef.value.contains(event.target as Node) &&
    !hamburgerRef.value.contains(event.target as Node)
  ) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="navbar">
    <!-- Left side: Logo + Hamburger Menu -->
    <div class="left-section p-d-flex p-ai-center gap-4 relative">
      <img
        src="@/assets/logo.svg"
        alt="Logo"
        class="h-10 w-auto"
        @click="navigateToHome"
        style="cursor: pointer"
      />

      <!-- Custom Hamburger Icon and Menu Text -->
      <button
        ref="hamburgerRef"
        class="custom-button hamburger-menu p-d-flex p-ai-center gap-2"
        @click.stop="toggleMenu"
      >
        <div class="hamburger-icon">
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
        </div>
        <span class="menu-text">Menu</span>
      </button>

      <ul v-if="isMenuOpen" ref="menuRef" class="dropdown-menu">
        <button class="dropdown-item" @click="navigateTo('/')">Home</button>
        <button class="dropdown-item" @click="navigateTo('/storage')">Emergency storage</button>
        <button class="dropdown-item" @click="navigateTo('/map')">Map</button>
        <button class="dropdown-item" @click="navigateTo('/news')">News</button>
        <button class="dropdown-item" @click="navigateTo('/general-info')">General info</button>
        <button class="dropdown-item" @click="navigateTo('/household')">Profile</button>
        <button v-if="authStore.isAdmin" class="dropdown-item" @click="navigateTo('/admin')">
          Admin Dashboard
        </button>
        <button v-if="authStore.isSuperAdmin" class="dropdown-item" @click="navigateTo('/super-admin')">
          SuperAdmin Dashboard
        </button>
      </ul>

    </div>

    <!-- Rest of component remains unchanged -->
    <div class="right-section p-d-flex p-ai-center gap-4">
      <Button class="custom-button profile-button p-button-sm" @click="navigateToProfile">
        <img src="@/assets/icons/profile_icon.svg" alt="Profile Icon" class="p-button-icon" />
        <span id="p-text">Profile</span>
      </Button>

      <Button severity="danger" class="custom-button p-button-sm" @click="logout">
        <img src="@/assets/icons/logout_icon.svg" alt="Logout Icon" class="p-button-icon" />
        <span>Logout</span>
      </Button>
    </div>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 2px solid #333;
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: white;
}

.left-section,
.right-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dropdown-menu {
  position: absolute;
  top: 45px;
  left: 30px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  z-index: 100;
  padding: 8px;
  overflow: hidden;
  animation: menu-fade 0.2s ease;
  list-style: none;
  margin: 0;
}

.dropdown-item {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  margin: 4px 0;
}

.dropdown-item:hover {
  background-color: #e6f0ff;
  transform: translateX(3px);
}

.dropdown-item:active {
  background-color: #dbeafe;
  transform: translateX(3px) scale(0.98);
}

.dropdown-item:focus {
  outline: none;
  background-color: #eef6ff;
  color: #1a56db;
  box-shadow: 0 0 0 2px #3182ce;
  position: relative;
  transform: translateX(5px);
}

.dropdown-item:focus::before {
  color: #1a56db;
}

.dropdown-item:focus-visible {
  outline: none;
  background-color: #eef6ff;
  color: #1a56db;
  box-shadow: 0 0 0 3px #3182ce;
  transform: translateX(5px);
}

.dropdown-item::before {
  margin-right: 8px;
  font-size: 18px;
  color: #a0aec0;
  transition: color 0.15s ease;
}

.dropdown-item:hover::before {
  color: #2d3748;
}

/* Animation and other styles */
@keyframes menu-fade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.relative {
  position: relative;
}

img {
  max-height: 40px;
  width: auto;
}

/* Menu and button styles */
.p-d-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.p-ai-center {
  align-items: center;
}

.hamburger-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.hamburger-icon {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 18px;
  width: 24px;
}

.line {
  height: 3px;
  background-color: #333;
  width: 100%;
  border-radius: 2px;
}

.menu-text {
  font-size: 14px;
  color: #333;
}

.p-button-icon {
  height: 20px;
  width: 20px;
  margin-right: 8px;
}

.p-button {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-button {
  background-color: white;
  border: 1px solid white;
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: none;
}

.custom-button:hover {
  background-color: #bbb;
  border-color: white;
}

.profile-button {
  background-color: white;
  border: 1px solid white;
  color: #333;
}

.profile-button.p-button:hover {
  background-color: #bbb !important;
  border-color: white !important;
  color: #333 !important;
}

@media (max-width: 430px) {
  .menu-text {
    display: none;
  }
  #p-text {
    display: none;
  }
}
</style>
