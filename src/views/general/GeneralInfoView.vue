<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="general-info">
    <h2 class="page-title">General Information</h2>

    <div class="nav-buttons">
      <button class="nav-button before" @click="navigateTo('/general-info/before-crisis')">
        Before Crisis
      </button>

      <button class="nav-button during" @click="navigateTo('/general-info/during-crisis')">
        During
      </button>

      <button class="nav-button after" @click="navigateTo('/general-info/after-crisis')">
        After
      </button>
    </div>
  </div>
</template>

<style scoped>
.general-info {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.nav-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.nav-button {
  width: 160px;
  height: 160px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.nav-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.nav-button.before {
  background-color: #d0e8ff;
  color: #1a365d;
}

.nav-button.during {
  background-color: #fff4d6;
  color: #744210;
}

.nav-button.after {
  background-color: #e6ffe6;
  color: #22543d;
}
</style>
