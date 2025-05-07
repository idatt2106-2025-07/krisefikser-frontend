// stores/auth.ts
import { defineStore } from 'pinia'
import axios from 'axios'

export interface AuthUser {
  email: string
  role: 'ROLE_NORMAL' | 'ROLE_ADMIN' | 'ROLE_SUPER'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null
  }),
  actions: {
    async fetchUser() {
      try {
        const resp = await axios.get<AuthUser>('/api/auth/me', { withCredentials: true })
        this.user = resp.data
      } catch {
        this.user = null
      }
    },
    clearToken() {
      this.user = null
    }
  },
  getters: {
    isLoggedIn:   state => !!state.user,
    isAdmin:      state => state.user?.role === 'ROLE_ADMIN',
    isSuperAdmin: state => state.user?.role === 'ROLE_SUPER'
  }
})
