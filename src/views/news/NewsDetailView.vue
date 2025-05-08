<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

interface NewsArticle {
  id: number
  title: string
  content: string
  publishedAt: string
}

const route = useRoute()
const article = ref<NewsArticle | null>(null)
const error = ref<string | null>(null)
const loading = ref(true)

onMounted(async () => {
  const id = route.params.id
  try {
    const response = await axios.get(`/api/news/${id}`)
    article.value = response.data
  } catch (err) {
    error.value = 'Could not load news article.'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="main-content">
    <div class="news-detail">
      <div v-if="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="article">
        <h1>{{ article.title }}</h1>
        <p class="meta">
          Published: {{ new Date(article.publishedAt).toLocaleString() }}
        </p>
        <div class="content" v-html="article.content"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  background-color: #e6f7ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 67vh;
}
.news-detail {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 0.8rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: auto;
  width: 100%;
  max-width: 700px; /* Made it narrower */
}

.meta {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.content {
  font-size: 1.1rem;
  line-height: 1.6;
}

.error {
  color: red;
}

@media (max-width: 768px) {
  .news-detail {
    max-width: 95%;
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>
