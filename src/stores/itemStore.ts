// stores/itemStore.ts
import { defineStore } from 'pinia'
import itemService from '@/services/itemService'
import type { Item, ItemRequest } from '@/types/item'

export const useItemStore = defineStore('item', {
  state: () => ({
    items: [] as Item[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    // Fetch the items searched by the user
    async searchItems(searchTerm: string) {
      this.loading = true
      this.error = null

      try {
        return await itemService.searchItems(searchTerm)
      } catch (err) {
        this.error = 'Failed to search items'
        console.error('Error searching items:', err)
        return []
      } finally {
        this.loading = false
      }
    },

    // Fetch sorted items
    async fetchSortedItems() {
      this.loading = true
      this.error = null

      try {
        return await itemService.fetchSortedItems()
      } catch (err) {
        this.error = 'Failed to fetch sorted items'
        console.error('Error fetching sorted items:', err)
        return []
      } finally {
        this.loading = false
      }
    },

    // Add a new item
    async addItem(request: ItemRequest) {
      this.loading = true
      this.error = null

      try {
        const newItem = await itemService.addItem(request)
        this.items.push(newItem)
        return newItem
      } catch (err) {
        this.error = 'Failed to add item'
        console.error('Error adding item:', err)
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
