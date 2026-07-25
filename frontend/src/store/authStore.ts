/**
 * Store de autenticación con Zustand.
 * Soporta modo real (JWT + 2FA) y modo demo offline.
 */

import { create } from 'zustand'
import { apiClient } from '@/api/client'
import type { User, AuthTokens, Asset } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  pendingUserId: string | null

  setUser: (user: User) => void
  setPendingUserId: (userId: string) => void
  clearPending: () => void

  // Modo real
  login: (email: string, password: string) => Promise<{ user_id: string }>
  verifyOtp: (userId: string, otp: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>

  // Modo demo
  useDemoLogin: (profile: User, assets: Asset[]) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token') || !!localStorage.getItem('demo_user'),
  isLoading: false,
  pendingUserId: null,

  setUser: (user) => set({ user }),
  setPendingUserId: (userId) => set({ pendingUserId: userId }),
  clearPending: () => set({ pendingUserId: null }),

  // ── Modo demo ─────────────────────────────────────────────────────────────
  useDemoLogin: (profile, assets) => {
    localStorage.setItem('demo_user', JSON.stringify(profile))
    localStorage.setItem('demo_assets', JSON.stringify(assets))
    // Token falso para que los interceptores no redirigian a /login
    localStorage.setItem('access_token', 'demo-token')
    set({ user: profile, isAuthenticated: true, pendingUserId: null })
  },

  // ── Modo real ─────────────────────────────────────────────────────────────
  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const { user_id } = response.data
      set({ pendingUserId: user_id })
      return { user_id }
    } finally {
      set({ isLoading: false })
    }
  },

  verifyOtp: async (userId, otp) => {
    set({ isLoading: true })
    try {
      const response = await apiClient.post('/auth/verify-otp', {
        user_id: userId,
        otp_code: otp,
      })
      const tokens: AuthTokens = response.data
      localStorage.setItem('access_token', tokens.access_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)

      const meResponse = await apiClient.get('/auth/me')
      set({ user: meResponse.data, isAuthenticated: true, pendingUserId: null })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    const isDemo = !!localStorage.getItem('demo_user')

    if (!isDemo && refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken })
      } catch {
        // continúa logout aunque falle el servidor
      }
    }

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('demo_user')
    localStorage.removeItem('demo_assets')
    set({ user: null, isAuthenticated: false, pendingUserId: null })
  },

  refreshUser: async () => {
    // Modo demo: cargar desde localStorage
    const demoRaw = localStorage.getItem('demo_user')
    if (demoRaw) {
      try {
        const profile = JSON.parse(demoRaw) as User
        set({ user: profile, isAuthenticated: true })
        return
      } catch {
        // si falla el parse, continúa
      }
    }

    // Modo real
    try {
      const response = await apiClient.get('/auth/me')
      set({ user: response.data, isAuthenticated: true })
    } catch {
      set({ user: null, isAuthenticated: false })
    }
  },
}))
