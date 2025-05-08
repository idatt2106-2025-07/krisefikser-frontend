<script setup lang="ts">
import LoggedOutNavBar from './components/navigation/LoggedOutNavBar.vue'
import NavBar from './components/navigation/NavBar.vue'
import FooterComponent from './components/footer/FooterComponent.vue'
</script>

<template>
  <div id="app">
    <NavBar />
    <router-view />
    <footer-component />
  </div>
</template>

<style scoped>
/* Add any global styles here */
</style>
