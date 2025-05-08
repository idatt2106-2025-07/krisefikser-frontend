<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3 class="footer-header">Navigation</h3>
        <ul class="footer-links">
          <li><router-link to="/" class="footer-link">Home</router-link></li>
          <li><router-link to="/map" class="footer-link">Map</router-link></li>
          <li><router-link to="/register" class="footer-link">Register</router-link></li>
          <li><router-link to="/login" class="footer-link">Login</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3 class="footer-header">About Us</h3>
        <ul class="footer-links">
          <li>
            <router-link to="/privacy-policy" class="footer-link">Privacy Policy</router-link>
          </li>
          <li><router-link to="/general-info" class="footer-link">General Info</router-link></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} All rights reserved KriseFikser</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background-color: #f8f9fa;
  color: #495057;
  padding: 1rem 0.75rem;
  margin-top: auto;
  border-top: 1px solid #e9ecef;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-section {
  margin: 0.5rem;
  min-width: 120px;
}

.footer-header {
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: #495057;
  font-weight: 600;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid #dee2e6;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
}

.footer-link {
  color: #6c757d;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #343a40;
}

.footer-bottom {
  text-align: center;
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e9ecef;
  color: #adb5bd;
  font-size: 0.2rem;
}

@media (max-width: 600px) {
  .footer {
    padding: 0.75rem 0.5rem;
  }

  .footer-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .footer-section {
    margin-bottom: 0.75rem;
  }

  .footer-links li {
    margin-bottom: 0.2rem;
  }
}
</style>
