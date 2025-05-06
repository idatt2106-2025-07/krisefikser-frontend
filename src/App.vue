<script setup lang="ts">
import LoggedOutNavBar from './components/navigation/LoggedOutNavBar.vue'
import NavBar from './components/navigation/NavBar.vue'
</script>

<template>
  <div id="app">
    <NavBar />
    <router-view />
  </div>
</template>

<style scoped>
/* Add any global styles here */
</style>
