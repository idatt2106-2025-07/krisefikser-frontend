import { defineStore } from 'pinia'
import userService from '@/services/userService'
import type { UserInfo } from '@/types/userTypes'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    getUserInfo: (state) => state.userInfo,

    getUserName: (state) => state.userInfo?.name,

    getUserEmail: (state) => state.userInfo?.email,

    getUserRole: (state) => state.userInfo?.role,

    getHouseholdLocation: (state) => {
      if (!state.userInfo) return null
      return {
        latitude: state.userInfo.householdLatitude,
        longitude: state.userInfo.householdLongitude,
      }
    },
  },

  actions: {
    async fetchUserInfo() {
      this.isLoading = true
      this.error = null

      try {
        const response = await userService.getUserInfo()
        this.userInfo = response
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch user info'
      } finally {
        this.isLoading = false
      }
    },

    clearUserInfo() {
      this.userInfo = null
      this.error = null
    },
  },
})
