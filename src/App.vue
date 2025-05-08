<script setup lang="ts">
import LoggedOutNavBar from './components/navigation/LoggedOutNavBar.vue'
import NavBar from './components/navigation/NavBar.vue'
import FooterComponent from './components/footer/FooterComponent.vue'
</script>

<template>
  <div class="app-layout">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
    <footer-component />
  </div>
</template>

<style>
html,
body {
  height: 100%;
  margin: 0;
}

.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}
</style>
