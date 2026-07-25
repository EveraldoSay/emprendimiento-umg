/**
 * Store de Feature Flags por organización.
 */

import { create } from 'zustand'
import { apiClient } from '@/api/client'
import type { FeatureFlags, FeatureName } from '@/types'

interface FeatureState {
  flags: FeatureFlags
  isLoaded: boolean
  fetchFlags: (orgId: string) => Promise<void>
  hasFeature: (feature: FeatureName) => boolean
}

const DEFAULT_FLAGS: FeatureFlags = {
  ai_remediation: false,
  xdr: false,
  auto_remediation: false,
  dedicated_infra: false,
  advanced_compliance: false,
}

export const useFeatureStore = create<FeatureState>((set, get) => ({
  flags: DEFAULT_FLAGS,
  isLoaded: false,

  fetchFlags: async (orgId) => {
    try {
      const response = await apiClient.get(`/admin/feature-flags/${orgId}`)
      const serverFlags = response.data.flags as Record<string, boolean>
      const flags: FeatureFlags = { ...DEFAULT_FLAGS, ...serverFlags } as FeatureFlags
      set({ flags, isLoaded: true })
    } catch {
      // Mantener flags por defecto si falla
      set({ isLoaded: true })
    }
  },

  hasFeature: (feature) => get().flags[feature] ?? false,
}))
