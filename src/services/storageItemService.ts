// services/storageItemService.ts
import axios from 'axios'
import type { AggregatedStorageItem, StorageItem, AddStorageItemRequest } from '@/types/storageItem'

export default {
  // Fetch all aggregated storage items
  async fetchAggregatedItems(): Promise<AggregatedStorageItem[]> {
    try {
      const response = await axios.get<AggregatedStorageItem[]>(
        '/api/storage-items/household/aggregated',
        {
          withCredentials: true,
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching aggregated items:', error)
      return []
    }
  },

  // Fetch individual storage items by item ID
  async fetchStorageItemsByItemId(itemId: number): Promise<StorageItem[]> {
    try {
      const response = await axios.get<any[]>(
        `/api/storage-items/household/by-item/${itemId}`,
        {
          withCredentials: true,
        }
      )

      return response.data.map(item => ({
        id: item.id,
        itemId: item.itemId,
        quantity: item.quantity,
        expirationDate: item.expirationDate,
        householdId: item.householdId,
        item: item.item,
        shared: item.shared,
        isShared: item.shared
      }))
    } catch (error) {
      console.error(`Error fetching storage items for item ID ${itemId}:`, error)
      return []
    }
  },

  // Add a new storage item
  async addStorageItem(request: AddStorageItemRequest): Promise<any> {
    const formattedRequest = {
      ...request,
      expirationDate: request.expirationDate + 'T00:00:00',
    }

    const response = await axios.post('/api/storage-items', formattedRequest, {
      withCredentials: true,
    })
    return response.data
  },

  // Delete a storage item
  async deleteStorageItem(id: number): Promise<void> {
    await axios.delete(`/api/storage-items/${id}`, {
      withCredentials: true,
    })
  },

  // Filter aggregated items by item type
  async filterByItemType(types: string[]): Promise<AggregatedStorageItem[]> {
    if (!types || types.length === 0) {
      return this.fetchAggregatedItems()
    }

    try {
      let url = '/api/storage-items/household/aggregated/filter-by-type'

      if (types.length > 0) {
        url += '?' + types.map((type) => 'types=' + encodeURIComponent(type)).join('&')
      }

      const response = await axios.get<AggregatedStorageItem[]>(url, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      console.error('Error filtering by item type:', error)
      return []
    }
  },

  // Search for aggregated items
  async searchAggregatedItems(
    searchTerm: string,
    types?: string[],
    sortBy?: string,
    sortDirection: string = 'asc'
  ): Promise<AggregatedStorageItem[]> {
    try {
      const params = new URLSearchParams()

      if (searchTerm) {
        params.append('searchTerm', searchTerm)
      }

      // Add types if provided
      if (types && types.length > 0) {
        types.forEach((type) => params.append('types', type))
      }

      // Add sort parameters if provided
      if (sortBy) {
        params.append('sortBy', sortBy)
        params.append('sortDirection', sortDirection)
      }

      const url = `/api/storage-items/household/aggregated/search?${params.toString()}`

      const response = await axios.get<AggregatedStorageItem[]>(url, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      console.error('Error searching aggregated items:', error)
      return []
    }
  },

  // Sort aggregated items
  async sortAggregatedItems(
    sortBy: string,
    sortDirection: string = 'asc'
  ): Promise<AggregatedStorageItem[]> {
    try {
      const params = new URLSearchParams()
      params.append('sortBy', sortBy)
      params.append('sortDirection', sortDirection)

      const url = `/api/storage-items/household/aggregated/sort?${params.toString()}`

      const response = await axios.get<AggregatedStorageItem[]>(url, {
        withCredentials: true,
      })

      return response.data
    } catch (error) {
      console.error('Error sorting aggregated items:', error)
      return []
    }
  },

  // Filter and sort aggregated items
  async filterAndSortAggregatedItems(
    types: string[],
    sortBy: string,
    sortDirection: string = 'asc'
  ): Promise<AggregatedStorageItem[]> {
    try {
      const params = new URLSearchParams()

      // Add types if provided
      if (types && types.length > 0) {
        types.forEach((type) => params.append('types', type))
      }

      // Add sort parameters
      params.append('sortBy', sortBy)
      params.append('sortDirection', sortDirection)

      const url = `/api/storage-items/household/aggregated/filter-and-sort?${params.toString()}`

      const response = await axios.get<AggregatedStorageItem[]>(url, {
        withCredentials: true,
      })

      return response.data
    } catch (error) {
      console.error('Error filtering and sorting aggregated items:', error)
      return []
    }
  },

  // Update a storage item
  async updateStorageItem(id: number, updatedItem: Partial<StorageItem>): Promise<any> {
    const request = {
      itemId: updatedItem.itemId,
      quantity: updatedItem.quantity,
      expirationDate: updatedItem.expirationDate,
    }

    const response = await axios.put(`/api/storage-items/${id}`, request, {
      withCredentials: true,
    })
    return response.data
  },

  // Update shared status of a storage item
  async updateStorageItemSharedStatus(id: number, isShared: boolean, quantity: number): Promise<any> {
    const request = {
      isShared: isShared,
      quantity: quantity
    }

    try {
      const response = await axios.patch(
        `/api/storage-items/household/${id}/shared-status`,
        request,
        {
          withCredentials: true,
        }
      )
      return response.data
    } catch (error) {
      console.error(`Error updating shared status for item ID ${id}:`, error)
      throw error
    }
  },
}
