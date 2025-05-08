// stores/auth.ts
import { defineStore } from 'pinia'
import axios from 'axios'

type UserInfo = {
  email: string
  name: string | null
  role: 'ROLE_NORMAL' | 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN' | 'ROLE_UNKNOWN'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | UserInfo,
  }),
  actions: {
    async fetchUser() {
      try {
        const resp = await axios.get<UserInfo>('/api/auth/me', {
          withCredentials: true,
          validateStatus: (status) => status === 200 || status === 204,
        })
        this.user = resp.status === 200 ? resp.data : null
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
    email: (state) => state.user?.email ?? null,
    name: (state) => state.user?.name ?? null,
    isAdmin: (state) => state.user?.role === 'ROLE_ADMIN',
    isSuperAdmin: (state) => state.user?.role === 'ROLE_SUPER_ADMIN',
  },
})
