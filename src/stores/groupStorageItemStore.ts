// stores/groupStorageItemStore.ts
import { defineStore } from 'pinia'
import groupStorageItemService from '@/services/groupStorageItemService'
import type {
  AggregatedStorageItem,
  StorageItem,
  GroupStorageItemRequest,
  StorageItemGroupResponse,
} from '@/types/storageItem'

export const useGroupStorageItemStore = defineStore('groupStorageItem', {
  state: () => ({
    groupItems: [] as AggregatedStorageItem[],
    groupItemDetails: [] as StorageItemGroupResponse[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    // Method to fetch all shared items in the emergency group
    async fetchGroupItems() {
      this.loading = true
      this.error = null

      try {
        this.groupItems = await groupStorageItemService.fetchGroupItems()
        if (this.groupItems.length === 0) {
          this.error = 'No group items found'
        }
      } catch (err) {
        const errorObj = err as Error
        this.error = 'Failed to fetch group storage items'
        console.error('Error fetching group storage items:', errorObj.message)
      } finally {
        this.loading = false
      }
    },

    // Method to fetch details of a specific item in the group
    async fetchGroupItemsByItemId(itemId: number) {
      this.loading = true
      this.error = null

      try {
        this.groupItemDetails = await groupStorageItemService.fetchGroupItemsByItemId(itemId)

        if (this.groupItemDetails.length === 0) {
          this.error = 'No shared items found for this item ID'
        }

        return this.groupItemDetails
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch group item details'
        this.error = errorMessage
        console.error(`Error fetching group item details for item ID ${itemId}:`, err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // Method to filter group items by item type
    async filterByItemType(types: string[]) {
      this.loading = true
      this.error = null

      try {
        this.groupItems = await groupStorageItemService.filterByItemType(types)
        if (this.groupItems.length === 0) {
          this.error = 'No items found with selected categories'
        }
      } catch (err) {
        const errorObj = err as Error
        this.error = 'Failed to filter group storage items'
        console.error('Error filtering group storage items:', errorObj.message)
      } finally {
        this.loading = false
      }
    },

    // Method to sort group items
    async sortGroupItems(sortBy: string, sortDirection: string = 'asc') {
      if (!sortBy) {
        return this.fetchGroupItems()
      }

      this.loading = true
      this.error = null

      try {
        this.groupItems = await groupStorageItemService.sortGroupItems(sortBy, sortDirection)
      } catch (err) {
        const errorObj = err as Error
        this.error = 'Failed to sort group storage items'
        console.error('Error sorting group storage items:', errorObj.message)
      } finally {
        this.loading = false
      }
    },

    // Method to filter and sort group items
    async filterAndSortGroupItems(types: string[], sortBy: string, sortDirection: string = 'asc') {
      if (!types?.length && !sortBy) {
        return this.fetchGroupItems()
      }

      if (types?.length && !sortBy) {
        return this.filterByItemType(types)
      }

      if (!types?.length && sortBy) {
        return this.sortGroupItems(sortBy, sortDirection)
      }

      this.loading = true
      this.error = null

      try {
        this.groupItems = await groupStorageItemService.filterAndSortGroupItems(
          types,
          sortBy,
          sortDirection,
        )
        if (this.groupItems.length === 0) {
          this.error = 'No items found with selected filters'
        }
      } catch (err) {
        const errorObj = err as Error
        this.error = 'Failed to filter and sort group storage items'
        console.error('Error filtering and sorting group storage items:', errorObj.message)
      } finally {
        this.loading = false
      }
    },

    // Method to update a group storage item
    async updateGroupStorageItem(id: number, updatedItem: GroupStorageItemRequest) {
      this.loading = true
      this.error = null

      try {
        const response = await groupStorageItemService.updateGroupStorageItem(id, updatedItem)

        await this.fetchGroupItems()

        return response
      } catch (err) {
        const errorObj = err as Error
        this.error = 'Failed to update group storage item'
        console.error(`Error updating group storage item with ID ${id}:`, errorObj.message)
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
