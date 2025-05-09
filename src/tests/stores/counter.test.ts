// tests/unit/stores/counter.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '@/stores/counter'

describe('Counter Store', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia())
  })

  it('initializes with count 0', () => {
    const store = useCounterStore()
    expect(store.count).toBe(0)
  })

  it('computes doubleCount correctly', () => {
    const store = useCounterStore()
    expect(store.doubleCount).toBe(0)

    store.count = 5
    expect(store.doubleCount).toBe(10)
  })

  it('increments the count', () => {
    const store = useCounterStore()
    expect(store.count).toBe(0)

    store.increment()
    expect(store.count).toBe(1)

    store.increment()
    expect(store.count).toBe(2)
  })

  it('maintains reactivity between components', () => {
    const store1 = useCounterStore()
    const store2 = useCounterStore()

    expect(store1.count).toBe(0)
    expect(store2.count).toBe(0)

    store1.increment()

    expect(store1.count).toBe(1)
    expect(store2.count).toBe(1)
  })
})
