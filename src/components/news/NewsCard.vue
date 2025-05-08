<script setup lang="ts">
defineProps<{
  title: string
  date: string
  content: string
}>()
</script>

<template>
  <div class="news-card">
    <h2>{{ title }}</h2>
    <p class="date">{{ date }}</p>
    <p>{{ content }}</p>
  </div>
</template>

<style scoped>
.news-card {
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.news-card h2 {
  margin: 0 0 0.5rem;
}

.news-card .date {
  font-size: 0.85rem;
  color: gray;
  margin-bottom: 0.75rem;
}
</style>
