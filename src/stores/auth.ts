// stores/auth.ts
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | { email: string; role: string }
  }),
  actions: {
    async fetchUser() {
      try {
        const response = await axios.get('http://localhost:8080/api/auth/me', {
          withCredentials: true // 🔐 Required for cookie auth
        })
        this.user = response.data
      } catch {
        this.user = null
      }
    },
    clearToken() {
      this.user = null
    }
  },
  getters: {
    isLoggedIn: (state) => !!state.user
  }
})
