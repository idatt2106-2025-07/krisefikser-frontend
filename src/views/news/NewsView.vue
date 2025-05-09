<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

interface NewsArticle {
  id: number
  title: string
  publishedAt: string
}

const articles = ref<NewsArticle[]>([])
const error = ref<string | null>(null)
const router = useRouter()

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
}

function navigateToArticle(id: number) {
  router.push(`/news/${id}`)
}

onMounted(async () => {
  try {
    const response = await axios.get('/api/news')
    articles.value = response.data
  } catch (err) {
    error.value = 'Failed to load news articles.'
    console.error(err)
  }
})
</script>

<template>
  <div class="main-content">
    <div class="news-page">
      <h1>News</h1>

      <div v-if="error" class="error">{{ error }}</div>

      <div class="articles-list">
        <div
          v-for="article in articles"
          :key="article.id"
          class="article-card"
          @click="navigateToArticle(article.id)"
        >
          <div class="article-header">
            <span class="red-dot"></span>
            <h2>{{ article.title }}</h2>
          </div>
          <p class="date">{{ formatDate(article.publishedAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  background-color: var(--background-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 67vh;
}
body {
  background-color: #12adf5;
  margin: 0;
  padding: 0;
}

.news-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.article-card {
  background-color: #fff;
  padding: 0.8rem;
  border-radius: 10px;
  margin-bottom: 0.8rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  height: auto;
  min-height: 60px;
  width: auto;
  min-width: 500px;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.article-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.article-header h2 {
  margin: 0;
  font-size: 1.1rem;
}

.red-dot {
  width: 10px;
  height: 10px;
  background-color: red;
  border-radius: 50%;
  flex-shrink: 0;
}

.date {
  font-size: 0.8rem;
  color: #888;
  margin: 0.3rem 0 0 0;
}

.error {
  color: red;
  margin-bottom: 1rem;
  text-align: center;
}
</style>
