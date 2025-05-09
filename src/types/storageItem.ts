// types/storageItemStore.ts
export interface Item {
  id: number
  name: string
  unit: string
  calories: number
  type: string
}

export interface AggregatedStorageItem {
  itemId: number
  item: Item
  totalQuantity: number
  earliestExpirationDate: string
  householdId: number
}

export interface StorageItem {
  id: number
  itemId: number
  quantity: number
  expirationDate: string
  householdId: number
  item: Item
  shared: boolean
}

export interface AddStorageItemRequest {
  itemId: number
  quantity: number
  expirationDate: string
}

export interface GroupStorageItemRequest {
  itemId: number
  quantity: number
  expirationDate: string
}

export interface StorageItemGroupResponse {
  storageItem: {
    id: number
    itemId: number
    quantity: number
    expirationDate: string
    householdId: number
    item: Item
    shared: boolean
  }
  householdName: string
}
