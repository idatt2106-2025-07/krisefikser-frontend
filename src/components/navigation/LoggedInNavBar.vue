<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()

const isMenuOpen = ref(false)

const navigateToProfile = () => {
  router.push('/settings')
}

const logout = () => {
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
      <div class="custom-button hamburger-menu p-d-flex p-ai-center gap-2" @click="toggleMenu">
        <div class="hamburger-icon">
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
        </div>
        <span class="menu-text">Menu</span>
      </div>

      <ul v-if="isMenuOpen" class="dropdown-menu">
        <li class="dropdown-item" @click="navigateTo('/')">Home</li>
        <li class="dropdown-item" @click="navigateTo('/storage')">Emergency storage</li>
        <li class="dropdown-item" @click="navigateTo('/info')">General info</li>
        <li class="dropdown-item" @click="navigateTo('/quiz')">Quiz</li>
      </ul>
    </div>

    <!-- Right side: Profile and Logout -->
    <div class="right-section p-d-flex p-ai-center gap-4">
      <Button class="custom-button profile-button p-button-sm" @click="navigateToProfile">
        <img src="@/assets/icons/profile_icon.svg" alt="Profile Icon" class="p-button-icon" />
        <span>Profile</span>
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
}

.left-section,
.right-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.relative {
  position: relative;
}

img {
  max-height: 40px;
  width: auto;
}

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

.dropdown-menu {
  position: absolute;
  top: 35px;
  left: 30px;
  cursor: pointer;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 100;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #eee;
  border-radius: 8px;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.relative {
  position: relative;
}

.dropdown-item:hover {
  background-color: #b4b4b4;
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
</style>
