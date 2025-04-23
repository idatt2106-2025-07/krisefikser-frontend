<script setup lang="ts">
import LoggedOutNavBar from './components/LoggedOutNavBar.vue';
</script>

<template>
  <div id="app">
    <LoggedOutNavBar />
    <router-view />
  </div>
</template>

<style scoped>
/* Add any global styles here */
</style>
