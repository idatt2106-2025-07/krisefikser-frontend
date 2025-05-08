import { defineStore } from 'pinia'
import itemService from '@/services/itemService'

export const useReadinessStore = defineStore('item', {
  state: () => ({
    timeLeft: {
      days: 0,
      hours: 0,
    },
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async getReadinessLevel() {
      this.loading = false
      this.error = null

      try {
        return await itemService.getReadinessLevel()
      } catch (err) {
        this.error = 'Failed to get readiness level'
        console.error('Error getting readiness level:', err)
      } finally {
        this.loading = false
      }
    },
  },
})
