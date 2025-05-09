// services/itemService.ts
import axios from 'axios'
import type { Item, ItemRequest } from '@/types/item'

export default {
  // Search items by term
  async searchItems(searchTerm: string): Promise<Item[]> {
    const url = searchTerm
      ? `/api/items/search?searchTerm=${encodeURIComponent(searchTerm)}`
      : '/api/items'

    const response = await axios.get<Item[]>(url, {
      withCredentials: true,
    })
    return response.data
  },

  // Fetch sorted items
  async fetchSortedItems(): Promise<Item[]> {
    const response = await axios.get<Item[]>('/api/items/sort?sortBy=name&sortDirection=asc', {
      withCredentials: true,
    })
    return response.data
  },

  // Add a new item
  async addItem(request: ItemRequest): Promise<Item> {
    const response = await axios.post('/api/items', request, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  },

  async getReadinessLevel(): Promise<any> {
    const response = await axios.get('/api/households/readiness', {
      withCredentials: true,
    })
    if (response.status === 200) {
      return response.data
    }
    console.error(response.data.message)
  },
}
