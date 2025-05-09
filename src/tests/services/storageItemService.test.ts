// tests/unit/services/storageItemService.test.ts
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-enable @typescript-eslint/ban-ts-comment */
// tests/unit/services/storageItemService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import storageItemService from '@/services/storageItemService'
import type { AggregatedStorageItem, StorageItem, AddStorageItemRequest } from '@/types/storageItem'

vi.mock('axios')

describe('storageItemService', () => {
  const mockAggregatedItems: AggregatedStorageItem[] = [
    { id: 1, name: 'Item 1', totalQuantity: 5, itemType: 'type1' },
    { id: 2, name: 'Item 2', totalQuantity: 3, itemType: 'type2' },
  ]

  const mockStorageItems: StorageItem[] = [
    { id: 1, itemId: 1, quantity: 2, expirationDate: '2023-12-31' },
    { id: 2, itemId: 1, quantity: 3, expirationDate: '2023-12-30' },
  ]

  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('fetchAggregatedItems', () => {
    it('should fetch aggregated items', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockAggregatedItems })

      const result = await storageItemService.fetchAggregatedItems()

      expect(axios.get).toHaveBeenCalledWith('/api/storage-items/household/aggregated', {
        withCredentials: true,
      })
      expect(result).toEqual(mockAggregatedItems)
    })
  })

  describe('fetchStorageItemsByItemId', () => {
    it('should fetch storage items by item ID', async () => {
      const itemId = 1
      vi.mocked(axios.get).mockResolvedValue({ data: mockStorageItems })

      const result = await storageItemService.fetchStorageItemsByItemId(itemId)

      expect(axios.get).toHaveBeenCalledWith(`/api/storage-items/household/by-item/${itemId}`, {
        withCredentials: true,
      })
      expect(result).toEqual(mockStorageItems)
    })
  })

  describe('addStorageItem', () => {
    it('should add a new storage item with formatted date', async () => {
      const request: AddStorageItemRequest = {
        itemId: 1,
        quantity: 5,
        expirationDate: '2023-12-31',
      }
      vi.mocked(axios.post).mockResolvedValue({ data: { id: 3 } })

      const result = await storageItemService.addStorageItem(request)

      expect(axios.post).toHaveBeenCalledWith(
        '/api/storage-items',
        {
          itemId: 1,
          quantity: 5,
          expirationDate: '2023-12-31T00:00:00',
        },
        { withCredentials: true },
      )
      expect(result).toEqual({ id: 3 })
    })
  })

  describe('deleteStorageItem', () => {
    it('should delete a storage item', async () => {
      const id = 1
      vi.mocked(axios.delete).mockResolvedValue({})

      await storageItemService.deleteStorageItem(id)

      expect(axios.delete).toHaveBeenCalledWith(`/api/storage-items/${id}`, {
        withCredentials: true,
      })
    })
  })

  describe('filterByItemType', () => {
    it('should filter by item types when types are provided', async () => {
      const types = ['type1', 'type2']
      vi.mocked(axios.get).mockResolvedValue({ data: [mockAggregatedItems[0]] })

      const result = await storageItemService.filterByItemType(types)

      expect(axios.get).toHaveBeenCalledWith(
        '/api/storage-items/household/aggregated/filter-by-type?types=type1&types=type2',
        { withCredentials: true },
      )
      expect(result).toEqual([mockAggregatedItems[0]])
    })

    it('should fetch all items when no types are provided', async () => {
      // Mock the fetchAggregatedItems call that happens internally
      vi.mocked(axios.get).mockImplementation((url) => {
        if (url === '/api/storage-items/household/aggregated') {
          return Promise.resolve({ data: mockAggregatedItems })
        }
        return Promise.reject(new Error('Unexpected URL'))
      })

      const result = await storageItemService.filterByItemType([])

      // Verify it called the unfiltered endpoint
      expect(axios.get).toHaveBeenCalledWith('/api/storage-items/household/aggregated', {
        withCredentials: true,
      })
      expect(result).toEqual(mockAggregatedItems)
    })
  })

  describe('searchAggregatedItems', () => {
    it('should search with all parameters', async () => {
      const searchTerm = 'test'
      const types = ['type1']
      const sortBy = 'name'
      const sortDirection = 'desc'

      vi.mocked(axios.get).mockResolvedValue({ data: mockAggregatedItems })

      const result = await storageItemService.searchAggregatedItems(
        searchTerm,
        types,
        sortBy,
        sortDirection,
      )

      const expectedUrl = `/api/storage-items/household/aggregated/search?searchTerm=test&types=type1&sortBy=name&sortDirection=desc`
      expect(axios.get).toHaveBeenCalledWith(expectedUrl, { withCredentials: true })
      expect(result).toEqual(mockAggregatedItems)
    })

    it('should search with minimal parameters', async () => {
      const searchTerm = 'test'
      vi.mocked(axios.get).mockResolvedValue({ data: mockAggregatedItems })

      const result = await storageItemService.searchAggregatedItems(searchTerm)

      const expectedUrl = `/api/storage-items/household/aggregated/search?searchTerm=test`
      expect(axios.get).toHaveBeenCalledWith(expectedUrl, { withCredentials: true })
      expect(result).toEqual(mockAggregatedItems)
    })
  })

  describe('updateStorageItem', () => {
    it('should update a storage item', async () => {
      const id = 1
      const updatedItem: Partial<StorageItem> = {
        itemId: 2,
        quantity: 10,
        expirationDate: '2024-01-01',
      }
      vi.mocked(axios.put).mockResolvedValue({ data: { ...updatedItem, id } })

      const result = await storageItemService.updateStorageItem(id, updatedItem)

      expect(axios.put).toHaveBeenCalledWith(
        `/api/storage-items/${id}`,
        {
          itemId: 2,
          quantity: 10,
          expirationDate: '2024-01-01',
        },
        { withCredentials: true },
      )
      expect(result).toEqual({ ...updatedItem, id })
    })
  })
})
