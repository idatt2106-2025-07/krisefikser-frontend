// stores/auth.ts
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // initialize from localStorage so it survives page reloads
    user: ((): string | null => {
      const stored = localStorage.getItem('auth.user')
      return stored ? JSON.parse(stored) : null
    })(),
  }),
  actions: {
    async fetchUser() {
      try {
        const resp = await axios.get<string>('/api/auth/me', {
          withCredentials: true,
          validateStatus: (status) => status === 200 || status === 204,
        })
        if (resp.status === 200 && resp.data) {
          this.user = resp.data
          localStorage.setItem('auth.user', JSON.stringify(this.user))
        } else {
          this.user = null
          localStorage.removeItem('auth.user')
        }
      } catch {
        this.user = null
        localStorage.removeItem('auth.user')
      }
    },
    clearToken() {
      this.user = null
      localStorage.removeItem('auth.user')
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.user,
    // you can now expose the email directly
    email: (state) => state.user,
  },
})
