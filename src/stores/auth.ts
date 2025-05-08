// stores/auth.ts
import { defineStore } from 'pinia'
import axios from 'axios'

type UserInfo = {
  email: string
  name: string | null
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
    email: (state) => state.user?.email ?? null,
    name: (state) => state.user?.name ?? null,
  },
})
