// stores/storageItemStore.ts
import { defineStore } from 'pinia'
import storageItemService from '@/services/storageItemService'
import type {
  AggregatedStorageItem,
  StorageItem,
  AddStorageItemRequest
} from '@/types/storageItem'

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
        this.individualItems = this.individualItems.filter(item => item.id !== id)

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
        await this.fetchAggregatedItems()

        if (sortBy === 'name') {
          // Sort by name
          this.aggregatedItems = [...this.aggregatedItems].sort((a, b) => {
            const nameA = a.item?.name?.toLowerCase() || ''
            const nameB = b.item?.name?.toLowerCase() || ''
            return sortDirection === 'asc'
              ? nameA.localeCompare(nameB)
              : nameB.localeCompare(nameA)
          })
        } else if (sortBy === 'quantity') {
          // Sort by quantity
          this.aggregatedItems = [...this.aggregatedItems].sort((a, b) => {
            return sortDirection === 'asc'
              ? a.totalQuantity - b.totalQuantity
              : b.totalQuantity - a.totalQuantity
          })
        } else if (sortBy === 'expirationDate') {
          // Sort by expiration date
          this.aggregatedItems = [...this.aggregatedItems].sort((a, b) => {
            const dateA = new Date(a.earliestExpirationDate).getTime()
            const dateB = new Date(b.earliestExpirationDate).getTime()
            return sortDirection === 'asc'
              ? dateA - dateB
              : dateB - dateA
          })
        }
      } catch (err) {
        this.error = 'Failed to sort storage items'
        console.error('Error sorting aggregated storage items:', err)
      } finally {
        this.loading = false
      }
    },

    // Method to search for aggregated items based on a search term
    async searchAggregatedItems(searchTerm: string, types?: string[], sortBy?: string, sortDirection: string = 'asc') {
      this.loading = true
      this.error = null

      try {
        this.aggregatedItems = await storageItemService.searchAggregatedItems(
          searchTerm,
          types,
          sortBy,
          sortDirection
        )
      } catch (err) {
        this.error = 'Failed to search storage items'
        console.error('Error searching storage items:', err)
      } finally {
        this.loading = false
      }
    },

    // Method to filter and sort aggregated items based on types and sort criteria
    async filterAndSortAggregatedItems(types: string[], sortBy: string, sortDirection: string = 'asc') {
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
        // First filter by item type
        await this.filterByItemType(types)

        // Then sort the filtered results client-side
        if (sortBy === 'name') {
          // Sort by name
          this.aggregatedItems = [...this.aggregatedItems].sort((a, b) => {
            const nameA = a.item?.name?.toLowerCase() || ''
            const nameB = b.item?.name?.toLowerCase() || ''
            return sortDirection === 'asc'
              ? nameA.localeCompare(nameB)
              : nameB.localeCompare(nameA)
          })
        } else if (sortBy === 'quantity') {
          // Sort by quantity
          this.aggregatedItems = [...this.aggregatedItems].sort((a, b) => {
            return sortDirection === 'asc'
              ? a.totalQuantity - b.totalQuantity
              : b.totalQuantity - a.totalQuantity
          })
        } else if (sortBy === 'expirationDate') {
          // Sort by expiration date
          this.aggregatedItems = [...this.aggregatedItems].sort((a, b) => {
            const dateA = new Date(a.earliestExpirationDate).getTime()
            const dateB = new Date(b.earliestExpirationDate).getTime()
            return sortDirection === 'asc'
              ? dateA - dateB
              : dateB - dateA
          })
        }
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

        const index = this.individualItems.findIndex(item => item.id === id)
        if (index !== -1) {
          this.individualItems[index] = {
            ...this.individualItems[index],
            ...response
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
    }
  }
})
