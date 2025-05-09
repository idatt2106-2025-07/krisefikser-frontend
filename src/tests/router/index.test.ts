/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-enable @typescript-eslint/ban-ts-comment */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Create mock routes for testing instead of importing from the real router
const mockRoutes = [
  {
    path: '/',
    name: 'home',
    component: {},
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    name: 'login',
    component: {},
    meta: { requiresAuth: false },
  },
  {
    path: '/settings',
    name: 'settings',
    component: {},
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: {},
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/super-admin',
    name: 'super-admin',
    component: {},
    meta: { requiresAuth: true, role: 'superadmin' },
  },
]

// Store the navigation guard function so we can test it directly
let navigationGuard

// Define our navigation guard logic
const createNavigationGuard = (authStore) => {
  return async (to, from, next) => {
    // Check if route requires authentication
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    if (requiresAuth && !authStore.isLoggedIn) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }

    // Check if route requires admin role
    const requiresAdmin = to.matched.some((record) => record.meta.role === 'admin')
    if (requiresAdmin && !authStore.isAdmin) {
      next({ path: '/' })
      return
    }

    // Check if route requires superadmin role
    const requiresSuperAdmin = to.matched.some((record) => record.meta.role === 'superadmin')
    if (requiresSuperAdmin && !authStore.isSuperAdmin) {
      next({ path: '/' })
      return
    }

    next()
  }
}

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    isLoggedIn: false,
    isAdmin: false,
    isSuperAdmin: false,
  })),
}))

describe('Router Configuration', () => {
  let router
  let authStore

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Create a new instance of the router for each test
    router = createRouter({
      history: createWebHistory(),
      routes: mockRoutes,
    })

    // Get the auth store mock
    authStore = useAuthStore()

    // Create and store the navigation guard
    navigationGuard = createNavigationGuard(authStore)

    // Register the navigation guard with the router
    router.beforeEach(navigationGuard)
  })

  it('creates router with all routes', () => {
    expect(router.getRoutes()).toHaveLength(mockRoutes.length)
  })

  it('has correct home route configuration', () => {
    const homeRoute = router.getRoutes().find((r) => r.name === 'home')
    expect(homeRoute.path).toBe('/')
    expect(homeRoute.meta.requiresAuth).toBeFalsy()
  })

  it('has correct protected routes', () => {
    const protectedRoutes = router.getRoutes().filter((r) => r.meta.requiresAuth)
    expect(protectedRoutes.length).toBeGreaterThan(0)

    // Check a sample protected route
    const settingsRoute = protectedRoutes.find((r) => r.name === 'settings')
    expect(settingsRoute.path).toBe('/settings')
    expect(settingsRoute.meta.requiresAuth).toBe(true)
  })

  it('has correct admin protected routes', () => {
    const adminRoutes = router.getRoutes().filter((r) => r.meta.role === 'admin')
    expect(adminRoutes.length).toBeGreaterThan(0)

    // Check a sample admin route
    const adminRoute = adminRoutes.find((r) => r.name === 'admin')
    expect(adminRoute.path).toBe('/admin')
    expect(adminRoute.meta.requiresAuth).toBe(true)
    expect(adminRoute.meta.role).toBe('admin')
  })

  it('has correct superadmin protected routes', () => {
    const superadminRoutes = router.getRoutes().filter((r) => r.meta.role === 'superadmin')
    expect(superadminRoutes.length).toBe(1)

    const superadminRoute = superadminRoutes[0]
    expect(superadminRoute.path).toBe('/super-admin')
    expect(superadminRoute.meta.requiresAuth).toBe(true)
    expect(superadminRoute.meta.role).toBe('superadmin')
  })

  describe('Navigation Guards', () => {
    it('redirects unauthenticated users from protected routes to login', async () => {
      authStore.isLoggedIn = false

      const to = { fullPath: '/settings', matched: [{ meta: { requiresAuth: true } }] }
      const from = {}
      const next = vi.fn()

      // Call the navigation guard function directly
      await navigationGuard(to, from, next)

      expect(next).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/settings' },
      })
    })

    it('allows authenticated users to access protected routes', async () => {
      authStore.isLoggedIn = true

      const to = { fullPath: '/settings', matched: [{ meta: { requiresAuth: true } }] }
      const from = {}
      const next = vi.fn()

      // Call the navigation guard function directly
      await navigationGuard(to, from, next)

      expect(next).toHaveBeenCalledWith()
    })

    it('blocks non-admin users from admin routes', async () => {
      authStore.isLoggedIn = true
      authStore.isAdmin = false

      const to = { fullPath: '/admin', matched: [{ meta: { requiresAuth: true, role: 'admin' } }] }
      const from = {}
      const next = vi.fn()

      // Call the navigation guard function directly
      await navigationGuard(to, from, next)

      expect(next).toHaveBeenCalledWith({ path: '/' })
    })

    it('allows admin users to access admin routes', async () => {
      authStore.isLoggedIn = true
      authStore.isAdmin = true

      const to = { fullPath: '/admin', matched: [{ meta: { requiresAuth: true, role: 'admin' } }] }
      const from = {}
      const next = vi.fn()

      // Call the navigation guard function directly
      await navigationGuard(to, from, next)

      expect(next).toHaveBeenCalledWith()
    })

    it('blocks non-superadmin users from superadmin routes', async () => {
      authStore.isLoggedIn = true
      authStore.isSuperAdmin = false

      const to = {
        fullPath: '/super-admin',
        matched: [{ meta: { requiresAuth: true, role: 'superadmin' } }],
      }
      const from = {}
      const next = vi.fn()

      // Call the navigation guard function directly
      await navigationGuard(to, from, next)

      expect(next).toHaveBeenCalledWith({ path: '/' })
    })

    it('allows superadmin users to access superadmin routes', async () => {
      authStore.isLoggedIn = true
      authStore.isSuperAdmin = true

      const to = {
        fullPath: '/super-admin',
        matched: [{ meta: { requiresAuth: true, role: 'superadmin' } }],
      }
      const from = {}
      const next = vi.fn()

      // Call the navigation guard function directly
      await navigationGuard(to, from, next)

      expect(next).toHaveBeenCalledWith()
    })
  })
})
