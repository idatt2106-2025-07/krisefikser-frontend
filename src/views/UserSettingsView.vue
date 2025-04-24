<script setup lang="ts">
import { ref } from 'vue';

const selectedItem = ref('Name');

const menuItems = [
  { label: 'Name' },
  { label: 'Mail' },
  { label: 'Password' },
  { label: 'Birthday' }
];
</script>

<template>
  <div class="settings-page">
    <h1 class="title">Profile Settings</h1>
    <div class="settings-container">
      <div class="sidebar">
        <div
          v-for="item in menuItems"
          :key="item.label"
          class="sidebar-item"
          :class="{ active: selectedItem === item.label }"
          @click="selectedItem = item.label"
        >
          {{ item.label }}
        </div>
      </div>
      <div class="content">
        <UserSettings/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  background-color: #fcd88f;
  min-height: 100vh;
  padding: 2rem;
}

.title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
}

.settings-container {
  display: flex;
  max-width: 900px;
  margin: 0 auto;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.sidebar {
  width: 200px;
  display: flex;
  flex-direction: column;
  border-right: 2px solid black;
}

.sidebar-item {
  padding: 1rem;
  border-bottom: 1px solid black;
  cursor: pointer;
  font-weight: bold;
}

.sidebar-item.active {
  background-color: gold;
}

.content {
  flex: 1;
  padding: 2rem;
}
</style>
