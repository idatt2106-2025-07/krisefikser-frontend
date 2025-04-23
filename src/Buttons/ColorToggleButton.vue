<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import { useStorage } from '@/composables/useStorage';

function toggleDarkMode() {
    document.documentElement.classList.toggle('my-app-dark');
}

</script>

<template>
  <Button label="Toggle Dark Mode" @click="toggleDarkMode()" />
</template>
