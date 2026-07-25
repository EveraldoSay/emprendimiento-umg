/**
 * Store de Feature Flags y Planes.
 * Planes acumulativos: Básico ⊂ Profesional ⊂ Enterprise.
 * Persiste en localStorage para sobrevivir recargas en modo demo.
 */

import { create } from 'zustand'
import { apiClient } from '@/api/client'
import type { FeatureFlags, FeatureName } from '@/types'

export type PlanTier = 'basic' | 'professional' | 'enterprise'

// Qué incluye cada plan (acumulativo hacia arriba)
export const PLAN_FEATURES: Record<PlanTier, FeatureName[]> = {
  basic: [
    'scanning',
    'dashboard',
    'basic_reports',
  ],
  professional: [
    'scanning', 'dashboard', 'basic_reports',
    'risk_assessment',
    'iso27001_compliance',
    'asset_management',
    'monitoring',
  ],
  enterprise: [
    'scanning', 'dashboard', 'basic_reports',
    'risk_assessment', 'iso27001_compliance', 'asset_management', 'monitoring',
    'ai_remediation',
    'xdr',
    'auto_remediation',
    'dedicated_infra',
    'advanced_compliance',
  ],
}

export const PLAN_LABELS: Record<PlanTier, { name: string; color: string; description: string }> = {
  basic: {
    name: 'Plan Básico',
    color: 'gray',
    description: 'Escaneo de vulnerabilidades · Dashboard · Reportes mensuales',
  },
  professional: {
    name: 'Plan Profesional',
    color: 'blue',
    description: 'Evaluación de riesgos · ISO 27001 · Gestión de activos · Monitoreo',
  },
  enterprise: {
    name: 'Plan Enterprise',
    color: 'purple',
    description: 'IA Predictiva · SOC Virtual · SIEM Integrado · Respuesta automatizada',
  },
}

function flagsForPlan(plan: PlanTier): FeatureFlags {
  const active = PLAN_FEATURES[plan]
  return {
    scanning:            active.includes('scanning'),
    dashboard:           active.includes('dashboard'),
    basic_reports:       active.includes('basic_reports'),
    risk_assessment:     active.includes('risk_assessment'),
    iso27001_compliance: active.includes('iso27001_compliance'),
    asset_management:    active.includes('asset_management'),
    monitoring:          active.includes('monitoring'),
    ai_remediation:      active.includes('ai_remediation'),
    xdr:                 active.includes('xdr'),
    auto_remediation:    active.includes('auto_remediation'),
    dedicated_infra:     active.includes('dedicated_infra'),
    advanced_compliance: active.includes('advanced_compliance'),
  }
}

const LS_PLAN_KEY = 'demo_plan'

function getSavedPlan(): PlanTier {
  const saved = localStorage.getItem(LS_PLAN_KEY)
  if (saved === 'professional' || saved === 'enterprise') return saved
  return 'basic'
}

interface FeatureState {
  flags: FeatureFlags
  activePlan: PlanTier
  isLoaded: boolean
  fetchFlags: (orgId: string) => Promise<void>
  setPlan: (plan: PlanTier) => void
  hasFeature: (feature: FeatureName) => boolean
}

export const useFeatureStore = create<FeatureState>((set, get) => {
  const savedPlan = getSavedPlan()
  return {
    flags: flagsForPlan(savedPlan),
    activePlan: savedPlan,
    isLoaded: true,

    fetchFlags: async (orgId: string) => {
      try {
        const response = await apiClient.get(`/admin/feature-flags/${orgId}`)
        const serverFlags = response.data.flags as Record<string, boolean>
        set({ flags: { ...flagsForPlan('basic'), ...serverFlags } as FeatureFlags, isLoaded: true })
      } catch {
        set({ isLoaded: true })
      }
    },

    setPlan: (plan: PlanTier) => {
      localStorage.setItem(LS_PLAN_KEY, plan)
      set({ activePlan: plan, flags: flagsForPlan(plan) })
    },

    hasFeature: (feature: FeatureName) => get().flags[feature] ?? false,
  }
})
