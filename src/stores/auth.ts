// stores/auth.ts
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // now just store the email string or null
    user: null as null | string,
  }),
  actions: {
    async fetchUser() {
      try {
        const resp = await axios.get<string>('/api/auth/me', {
          withCredentials: true,
          validateStatus: (status) => status === 200 || status === 204,
        })
        if (resp.status === 200) {
          this.user = resp.data
        } else {
          this.user = null
        }
      } catch {
        this.user = null
      }
    },
    clearToken() {
      this.user = null
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.user,
    // you can now expose the email directly
    email: (state) => state.user,
  },
})
