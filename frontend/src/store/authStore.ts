/**
 * Store de autenticación.
 * Modo real: JWT + 2FA.
 * Modo demo: login directo con perfil de entidad.
 */

import { create } from 'zustand'
import { apiClient } from '@/api/client'
import type { User, AuthTokens, Asset, Vulnerability } from '@/types'
import type { DemoEntityId } from '@/api/mockData'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  pendingUserId: string | null
  activeEntityId: DemoEntityId | null

  setUser: (user: User) => void
  setPendingUserId: (userId: string) => void
  clearPending: () => void

  login: (email: string, password: string) => Promise<{ user_id: string }>
  verifyOtp: (userId: string, otp: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>

  useDemoLogin: (
    profile: User,
    assets: Asset[],
    vulns: Vulnerability[],
    metrics: unknown,
    entityId: DemoEntityId,
  ) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated:
    !!localStorage.getItem('access_token') ||
    !!localStorage.getItem('demo_user'),
  isLoading: false,
  pendingUserId: null,
  activeEntityId: (localStorage.getItem('demo_entity') as DemoEntityId) ?? null,

  setUser: (user) => set({ user }),
  setPendingUserId: (userId) => set({ pendingUserId: userId }),
  clearPending: () => set({ pendingUserId: null }),

  useDemoLogin: (profile, assets, vulns, metrics, entityId) => {
    localStorage.setItem('demo_user',    JSON.stringify(profile))
    localStorage.setItem('demo_assets',  JSON.stringify(assets))
    localStorage.setItem('demo_vulns',   JSON.stringify(vulns))
    localStorage.setItem('demo_metrics', JSON.stringify(metrics))
    localStorage.setItem('demo_entity',  entityId)
    localStorage.setItem('access_token', 'demo-token')
    // Resetear plan al básico al cambiar de entidad
    localStorage.setItem('demo_plan', 'basic')   // siempre inicia en Básico
    set({ user: profile, isAuthenticated: true, pendingUserId: null, activeEntityId: entityId })
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const r = await apiClient.post('/auth/login', { email, password })
      set({ pendingUserId: r.data.user_id })
      return { user_id: r.data.user_id }
    } finally {
      set({ isLoading: false })
    }
  },

  verifyOtp: async (userId, otp) => {
    set({ isLoading: true })
    try {
      const r = await apiClient.post('/auth/verify-otp', { user_id: userId, otp_code: otp })
      const tokens: AuthTokens = r.data
      localStorage.setItem('access_token',  tokens.access_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
      const me = await apiClient.get('/auth/me')
      set({ user: me.data, isAuthenticated: true, pendingUserId: null })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    const isDemo = !!localStorage.getItem('demo_user')
    if (!isDemo && refreshToken) {
      try { await apiClient.post('/auth/logout', { refresh_token: refreshToken }) } catch { /* continúa */ }
    }
    ;['access_token','refresh_token','demo_user','demo_assets','demo_vulns',
      'demo_metrics','demo_entity','demo_plan'].forEach((k) => localStorage.removeItem(k))
    set({ user: null, isAuthenticated: false, pendingUserId: null, activeEntityId: null })
  },

  refreshUser: async () => {
    const raw = localStorage.getItem('demo_user')
    if (raw) {
      try {
        const profile = JSON.parse(raw) as User
        const entityId = localStorage.getItem('demo_entity') as DemoEntityId | null
        set({ user: profile, isAuthenticated: true, activeEntityId: entityId })
        return
      } catch { /* continúa */ }
    }
    try {
      const r = await apiClient.get('/auth/me')
      set({ user: r.data, isAuthenticated: true })
    } catch {
      set({ user: null, isAuthenticated: false })
    }
  },
}))
