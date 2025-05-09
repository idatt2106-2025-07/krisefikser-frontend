// stores/storageItemStore.ts
import { defineStore } from 'pinia'
import storageItemService from '@/services/storageItemService'
import type { AggregatedStorageItem, StorageItem, AddStorageItemRequest } from '@/types/storageItem'

export const useStorageItemStore = defineStore('storageItem', {
  state: () => ({
    aggregatedItems: [] as AggregatedStorageItem[],
    individualItems: [] as StorageItem[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    // Method to fetch all aggregated storage items
    async fetchAggregatedItems() {
      this.loading = true
      this.error = null

      try {
        this.aggregatedItems = await storageItemService.fetchAggregatedItems()
      } catch (err) {
        this.error = 'Failed to fetch storage items'
        console.error('Error fetching aggregated storage items:', err)
      } finally {
        this.loading = false
      }
    },

    // Method to fetch individual storage items by item ID
    async fetchStorageItemsByItemId(itemId: number) {
      this.loading = true
      this.error = null

      try {
        this.individualItems = await storageItemService.fetchStorageItemsByItemId(itemId)
        console.log('Raw API response:', this.individualItems)
        return this.individualItems
      } catch (err) {
        this.error = 'Failed to fetch storage items by item ID'
        console.error(`Error fetching storage items for item ID ${itemId}:`, err)
      } finally {
        this.loading = false
      }
    },

    // Method to add a storage item
    async addStorageItem(request: AddStorageItemRequest) {
      this.loading = true
      this.error = null

      try {
        const result = await storageItemService.addStorageItem(request)
        await this.fetchAggregatedItems()
        return result
      } catch (err) {
        this.error = 'Failed to add storage item'
        console.error('Error adding storage item:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // Method to delete a storage item
    async deleteStorageItem(id: number) {
      this.loading = true
      this.error = null

      try {
        await storageItemService.deleteStorageItem(id)
        this.individualItems = this.individualItems.filter((item) => item.id !== id)

        if (this.individualItems.length === 0) {
          await this.fetchAggregatedItems()
        }
      } catch (err) {
        this.error = 'Failed to delete storage item'
        console.error(`Error deleting storage item with ID ${id}:`, err)
      } finally {
        this.loading = false
      }
    },

    // Method to filter aggregated items by item type
    async filterByItemType(types: string[]) {
      this.loading = true
      this.error = null

      try {
        this.aggregatedItems = await storageItemService.filterByItemType(types)
      } catch (err) {
        this.error = 'Failed to filter storage items'
        console.error('Error filtering aggregated storage items:', err)
      } finally {
        this.loading = false
      }
    },

    // Method to sort aggregated items by a specific field
    async sortAggregatedItems(sortBy: string, sortDirection: string = 'asc') {
      if (!sortBy) {
        return this.fetchAggregatedItems()
      }

      this.loading = true
      this.error = null

      try {
        this.aggregatedItems = await storageItemService.sortAggregatedItems(sortBy, sortDirection)
      } catch (err) {
        this.error = 'Failed to sort storage items'
        console.error('Error sorting aggregated storage items:', err)
      } finally {
        this.loading = false
      }
    },

    // Method to search for aggregated items based on a search term
    async searchAggregatedItems(
      searchTerm: string,
      types?: string[],
      sortBy?: string,
      sortDirection: string = 'asc',
    ) {
      this.loading = true
      this.error = null

      try {
        this.aggregatedItems = await storageItemService.searchAggregatedItems(
          searchTerm,
          types,
          sortBy,
          sortDirection,
        )
      } catch (err) {
        this.error = 'Failed to search storage items'
        console.error('Error searching storage items:', err)
      } finally {
        this.loading = false
      }
    },

    // Method to filter and sort aggregated items based on types and sort criteria
    async filterAndSortAggregatedItems(
      types: string[],
      sortBy: string,
      sortDirection: string = 'asc',
    ) {
      if (!types?.length && !sortBy) {
        return this.fetchAggregatedItems()
      }

      if (types?.length && !sortBy) {
        return this.filterByItemType(types)
      }

      if (!types?.length && sortBy) {
        return this.sortAggregatedItems(sortBy, sortDirection)
      }

      this.loading = true
      this.error = null

      try {
        this.aggregatedItems = await storageItemService.filterAndSortAggregatedItems(
          types,
          sortBy,
          sortDirection,
        )
      } catch (err) {
        this.error = 'Failed to filter and sort storage items'
        console.error('Error filtering and sorting aggregated storage items:', err)
      } finally {
        this.loading = false
      }
    },

    // Method to update a storage item
    async updateStorageItem(id: number, updatedItem: Partial<StorageItem>) {
      this.loading = true
      this.error = null

      try {
        const response = await storageItemService.updateStorageItem(id, updatedItem)

        const index = this.individualItems.findIndex((item) => item.id === id)
        if (index !== -1) {
          this.individualItems[index] = {
            ...this.individualItems[index],
            ...response,
          }
        }

        return response
      } catch (err) {
        this.error = 'Failed to update storage item'
        console.error(`Error updating storage item with ID ${id}:`, err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // Method to update storage item shared status
    async updateStorageItemSharedStatus(id: number, isShared: boolean, quantity: number) {
      this.loading = true
      this.error = null

      try {
        const response = await storageItemService.updateStorageItemSharedStatus(
          id,
          isShared,
          quantity,
        )

        if (response && Array.isArray(response)) {
          const updatedIds = response.map((item) => item.id)

          this.individualItems = this.individualItems.filter(
            (item) => item.id !== id || updatedIds.includes(item.id),
          )

          for (const updatedItem of response) {
            const existingIndex = this.individualItems.findIndex(
              (item) => item.id === updatedItem.id,
            )

            if (existingIndex !== -1) {
              this.individualItems[existingIndex] = updatedItem
            } else {
              this.individualItems.push(updatedItem)
            }
          }
        }

        return response
      } catch (err) {
        const errorObj = err as Error
        this.error = 'Failed to update item sharing status'
        console.error(`Error updating shared status for item ID ${id}:`, errorObj.message)
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
