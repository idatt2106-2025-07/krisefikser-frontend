// services/storageItemService.ts
import axios from 'axios'
import type {
  Item,
  AggregatedStorageItem,
  StorageItem,
  AddStorageItemRequest
} from '@/types/storageItem'

export default {
  // Fetch all aggregated storage items
  async fetchAggregatedItems(): Promise<AggregatedStorageItem[]> {
    const response = await axios.get<AggregatedStorageItem[]>('/api/storage-items/household/aggregated', {
      withCredentials: true
    })
    return response.data
  },

  // Fetch individual storage items by item ID
  async fetchStorageItemsByItemId(itemId: number): Promise<StorageItem[]> {
    const response = await axios.get<StorageItem[]>(`/api/storage-items/household/by-item/${itemId}`, {
      withCredentials: true
    })
    return response.data
  },

  // Add a new storage item
  async addStorageItem(request: AddStorageItemRequest): Promise<any> {
    const formattedRequest = {
      ...request,
      expirationDate: request.expirationDate + 'T00:00:00'
    }

    const response = await axios.post('/api/storage-items', formattedRequest, {
      withCredentials: true
    })
    return response.data
  },

  // Delete a storage item
  async deleteStorageItem(id: number): Promise<void> {
    await axios.delete(`/api/storage-items/${id}`, {
      withCredentials: true
    })
  },

  // Filter aggregated items by item type
  async filterByItemType(types: string[]): Promise<AggregatedStorageItem[]> {
    if (!types || types.length === 0) {
      return this.fetchAggregatedItems()
    }

    let url = '/api/storage-items/household/aggregated/filter-by-type'

    if (types.length > 0) {
      url += '?' + types.map(type => 'types=' + encodeURIComponent(type)).join('&')
    }

    const response = await axios.get<AggregatedStorageItem[]>(url, {
      withCredentials: true
    })
    return response.data
  },

  // Search for aggregated items
  async searchAggregatedItems(
    searchTerm: string,
    types?: string[],
    sortBy?: string,
    sortDirection: string = 'asc'
  ): Promise<AggregatedStorageItem[]> {
    const params = new URLSearchParams()

    if (searchTerm) {
      params.append('searchTerm', searchTerm)
    }

    // Add types if provided
    if (types && types.length > 0) {
      types.forEach(type => params.append('types', type))
    }

    // Add sort parameters if provided
    if (sortBy) {
      params.append('sortBy', sortBy)
      params.append('sortDirection', sortDirection)
    }

    const url = `/api/storage-items/household/aggregated/search?${params.toString()}`

    const response = await axios.get<AggregatedStorageItem[]>(url, {
      withCredentials: true
    })
    return response.data
  },

  // Update a storage item
  async updateStorageItem(id: number, updatedItem: Partial<StorageItem>): Promise<any> {
    const request = {
      itemId: updatedItem.itemId,
      quantity: updatedItem.quantity,
      expirationDate: updatedItem.expirationDate,
    }

    const response = await axios.put(`/api/storage-items/${id}`, request, {
      withCredentials: true
    })
    return response.data
  }
}
