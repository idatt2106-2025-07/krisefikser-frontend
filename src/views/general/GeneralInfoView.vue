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
      <button class="nav-button before" @click="navigateTo('/general-info/before_crisis')">
        <h3 class="card-header">Before Crisis</h3>
        <p class="sub-text">
          What should you as a citizen do to be prepared for an eventual crisis?
        </p>
        <a class="sub-text">Click here to discover -></a>
      </button>

      <button class="nav-button during" @click="navigateTo('/general-info/during_crisis')">
        <h3 class="card-header">During Crisis</h3>
        <p class="sub-text">
          What should you as a citizen do during a crisis to minimize panic, injuries and death?
        </p>
        <a class="sub-text">Click here to discover -></a>
      </button>

      <button class="nav-button after" @click="navigateTo('/general-info/after_crisis')">
        <h3 class="card-header">After Crisis</h3>
        <p class="sub-text">When an eventual crisis is over, what should a citizen do?</p>
        <a class="sub-text">Click here to discover -></a>
      </button>
    </div>
  </div>
</template>

<style scoped>
body {
  background-color: #dbf5fa;
  font-family: Arial, sans-serif;
}

.general-info {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  margin: 30px 0;
  color: #333;
  font-size: 3rem;
  padding: 0 20px;
}

.nav-buttons {
  padding: 50px 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 5%;
  margin-top: 30px;
  margin-left: 0;
  margin-right: 0;
}

.nav-button {
  width: 30%;
  aspect-ratio: 1 / 1;
  border: none;
  border-radius: 10%;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  color: black;
  background-color: white;
  padding: 35px;
}

.sub-text {
  font-size: 1rem;
  color: #555;
  text-align: center;
}

.card-header {
  font-size: 1.5rem;
  color: #333;
  padding: 0;
  margin: 0;
  text-align: center;
}

.nav-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

a {
  color: dodgerblue;
}

@media (max-width: 852px) {
  .nav-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    justify-items: center;
  }

  .nav-button {
    width: 90%;
    margin-bottom: 20px;
  }
}

@media (max-width: 600px) {
  .nav-buttons {
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    justify-items: center;
    margin-bottom: 50px;
  }
  .nav-button {
    width: 80%;
    max-width: 400px;
    margin-bottom: 20px;
  }
}
</style>
