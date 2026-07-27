/**
 * Store de Feature Flags y Planes.
 * Planes acumulativos según el documento del proyecto:
 *
 * Básico:       Escaneo de vulnerabilidades · Dashboard · Reportes mensuales
 * Profesional:  + Evaluación de riesgos · ISO 27001 · Gestión de activos · Monitoreo
 * Enterprise:   + IA Predictiva · SOC Virtual · SIEM · Gestión Incidentes · Respuesta auto
 */

import { create } from 'zustand'
import type { FeatureName } from '@/types'

export type PlanTier = 'basic' | 'professional' | 'enterprise'

// Features activas por plan (acumulativo)
export const PLAN_FEATURES: Record<PlanTier, FeatureName[]> = {
  basic: [
    'scanning',      // Escaneo de vulnerabilidades
    'dashboard',     // Dashboard
    'basic_reports', // Reportes mensuales
  ],
  professional: [
    'scanning', 'dashboard', 'basic_reports',
    'risk_assessment',     // Evaluación de riesgos
    'iso27001_compliance', // Cumplimiento ISO 27001
    'asset_management',    // Gestión de activos
    'monitoring',          // Monitoreo
  ],
  enterprise: [
    'scanning', 'dashboard', 'basic_reports',
    'risk_assessment', 'iso27001_compliance', 'asset_management', 'monitoring',
    'ai_remediation',    // IA Predictiva
    'xdr',               // SOC Virtual
    'auto_remediation',  // SIEM Integrado + Respuesta automatizada
    'dedicated_infra',   // Gestión de Incidentes
    'advanced_compliance',
  ],
}

export const PLAN_META: Record<PlanTier, {
  name: string
  shortName: string
  color: string
  badgeCls: string
  dotCls: string
  description: string
  features: string[]
}> = {
  basic: {
    name: 'Plan Básico',
    shortName: 'Básico',
    color: 'gray',
    badgeCls: 'bg-gray-700/80 text-gray-300 border border-gray-600',
    dotCls: 'bg-gray-400',
    description: 'Funcionalidades esenciales de ciberseguridad',
    features: ['Escaneo de vulnerabilidades', 'Dashboard interactivo', 'Reportes mensuales'],
  },
  professional: {
    name: 'Plan Profesional',
    shortName: 'Profesional',
    color: 'blue',
    badgeCls: 'bg-blue-900/60 text-blue-300 border border-blue-600',
    dotCls: 'bg-blue-400',
    description: 'Gestión avanzada de riesgos y cumplimiento',
    features: ['Evaluación de riesgos', 'Cumplimiento ISO 27001', 'Gestión de activos', 'Monitoreo continuo'],
  },
  enterprise: {
    name: 'Plan Enterprise',
    shortName: 'Enterprise',
    color: 'purple',
    badgeCls: 'bg-purple-900/60 text-purple-300 border border-purple-600',
    dotCls: 'bg-purple-400',
    description: 'Inteligencia artificial y respuesta automatizada',
    features: ['IA Predictiva (Ollama)', 'SOC Virtual', 'SIEM Integrado', 'Gestión de Incidentes', 'Respuesta automatizada'],
  },
}

export type FeatureFlags = Record<FeatureName, boolean>

function flagsForPlan(plan: PlanTier): FeatureFlags {
  const active = new Set(PLAN_FEATURES[plan])
  return {
    scanning:            active.has('scanning'),
    dashboard:           active.has('dashboard'),
    basic_reports:       active.has('basic_reports'),
    risk_assessment:     active.has('risk_assessment'),
    iso27001_compliance: active.has('iso27001_compliance'),
    asset_management:    active.has('asset_management'),
    monitoring:          active.has('monitoring'),
    ai_remediation:      active.has('ai_remediation'),
    xdr:                 active.has('xdr'),
    auto_remediation:    active.has('auto_remediation'),
    dedicated_infra:     active.has('dedicated_infra'),
    advanced_compliance: active.has('advanced_compliance'),
  }
}

const LS_KEY = 'demo_plan'

function loadPlan(): PlanTier {
  const v = localStorage.getItem(LS_KEY)
  if (v === 'professional' || v === 'enterprise') return v
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
  const initial = loadPlan()
  return {
    flags: flagsForPlan(initial),
    activePlan: initial,
    isLoaded: true,

    fetchFlags: async (_orgId: string) => {
      // En modo demo siempre usamos el plan local
      set({ isLoaded: true })
    },

    setPlan: (plan: PlanTier) => {
      localStorage.setItem(LS_KEY, plan)
      set({ activePlan: plan, flags: flagsForPlan(plan) })
    },

    hasFeature: (feature: FeatureName) => get().flags[feature] ?? false,
  }
})
