// types/itemStore.ts
export interface Item {
  id: number
  name: string
  unit: string
  calories: number
  type: string
}

export interface ItemRequest {
  name: string
  unit: string
  calories: number
  type: string
}
