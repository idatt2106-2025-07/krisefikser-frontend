// services/groupStorageItemService.ts
import axios from 'axios'
import type {
  AggregatedStorageItem,
  StorageItem,
  GroupStorageItemRequest,
  StorageItemGroupResponse
} from '@/types/storageItem'

export default {
  // Fetch all shared storage items in an emergency group
  async fetchGroupItems(
    types?: string[],
    sortBy?: string,
    sortDirection: string = 'asc'
  ): Promise<AggregatedStorageItem[]> {
    let url = '/api/storage-items/emergency-group'
    const params = new URLSearchParams()

    // Add types if provided
    if (types && types.length > 0) {
      types.forEach(type => params.append('types', type))
    }

    // Add sort parameters if provided
    if (sortBy) {
      params.append('sortBy', sortBy)
      params.append('sortDirection', sortDirection)
    }

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    try {
      console.log('Fetching group items from:', url)
      const response = await axios.get<AggregatedStorageItem[]>(url, {
        withCredentials: true,
      })
      console.log('Group items response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching group items:', error)
      return []
    }
  },

  // Fetch storage items in a group by item ID
  async fetchGroupItemsByItemId(itemId: number): Promise<StorageItemGroupResponse[]> {
    const url = `/api/storage-items/emergency-group/by-item/${itemId}`
    console.log(`Fetching group items for itemId ${itemId} from: ${url}`)

    try {
      const response = await axios.get<StorageItemGroupResponse[]>(url, {
        withCredentials: true,
      })

      console.log(`API response for item ID ${itemId}:`, response.data)

      if (!response.data || response.data.length === 0) {
        console.warn(`No group items found for item ID ${itemId}`)
      }

      return response.data || []
    } catch (error: any) {
      console.error(`Error fetching group items by ID ${itemId}:`, error)

      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)

        if (error.response.status === 404) {
          throw new Error('This item is not shared in your emergency group')
        }
      }

      throw new Error('Failed to load shared item details: ' + (error.message || 'Unknown error'))
    }
  },

  // Update a shared storage item in the group
  async updateGroupStorageItem(id: number, updatedItem: GroupStorageItemRequest): Promise<any> {
    try {
      console.log(`Updating group storage item with ID ${id}:`, updatedItem)

      const request = {
        itemId: updatedItem.itemId,
        quantity: updatedItem.quantity,
        expirationDate: updatedItem.expirationDate,
      }

      const response = await axios.put(`/api/storage-items/emergency-group/${id}`, request, {
        withCredentials: true,
      })

      console.log(`Successfully updated group storage item with ID ${id}:`, response.data)
      return response.data
    } catch (error: any) {
      console.error(`Error updating group storage item with ID ${id}:`, error)

      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)

        if (error.response.status === 400) {
          throw new Error(error.response.data?.message || 'Invalid update request')
        } else if (error.response.status === 404) {
          throw new Error('Item not found or is not shared with your emergency group')
        }
      }

      throw new Error('Failed to update group storage item: ' + (error.message || 'Unknown error'))
    }
  },

  // Filter group items by item type
  async filterByItemType(types: string[]): Promise<AggregatedStorageItem[]> {
    if (!types || types.length === 0) {
      return this.fetchGroupItems()
    }

    return this.fetchGroupItems(types)
  },

  // Sort group items by a specific field
  async sortGroupItems(
    sortBy: string,
    sortDirection: string = 'asc'
  ): Promise<AggregatedStorageItem[]> {
    if (!sortBy) {
      return this.fetchGroupItems()
    }

    return this.fetchGroupItems(undefined, sortBy, sortDirection)
  },

  // Filter and sort group items
  async filterAndSortGroupItems(
    types: string[],
    sortBy: string,
    sortDirection: string = 'asc'
  ): Promise<AggregatedStorageItem[]> {
    if (!types?.length && !sortBy) {
      return this.fetchGroupItems()
    }

    return this.fetchGroupItems(types, sortBy, sortDirection)
  }
}
