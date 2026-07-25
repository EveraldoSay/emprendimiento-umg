/**
 * Panel de cambio de plan con interruptores de features.
 * Muestra los 3 planes con sus features y permite activar/desactivar en demo.
 */

import { Check, Lock } from 'lucide-react'
import {
  useFeatureStore,
  PLAN_LABELS,
  PLAN_FEATURES,
  type PlanTier,
} from '@/store/featureStore'
import type { FeatureName } from '@/types'

const ALL_FEATURES: { key: FeatureName; label: string; plan: PlanTier }[] = [
  // Básico
  { key: 'scanning',            label: 'Escaneo de vulnerabilidades',   plan: 'basic' },
  { key: 'dashboard',           label: 'Dashboard interactivo',          plan: 'basic' },
  { key: 'basic_reports',       label: 'Reportes mensuales básicos',     plan: 'basic' },
  // Profesional
  { key: 'risk_assessment',     label: 'Evaluación de riesgos',          plan: 'professional' },
  { key: 'iso27001_compliance', label: 'Cumplimiento ISO 27001',          plan: 'professional' },
  { key: 'asset_management',    label: 'Gestión de activos avanzada',     plan: 'professional' },
  { key: 'monitoring',          label: 'Monitoreo continuo',              plan: 'professional' },
  // Enterprise
  { key: 'ai_remediation',      label: 'IA Predictiva (Ollama local)',    plan: 'enterprise' },
  { key: 'xdr',                 label: 'SOC Virtual — XDR',              plan: 'enterprise' },
  { key: 'auto_remediation',    label: 'SIEM Integrado + Respuesta auto', plan: 'enterprise' },
  { key: 'dedicated_infra',     label: 'Gestión de Incidentes',           plan: 'enterprise' },
  { key: 'advanced_compliance', label: 'Compliance avanzado multi-norma', plan: 'enterprise' },
]

const PLAN_COLORS: Record<PlanTier, { ring: string; bg: string; badge: string; btn: string }> = {
  basic:        { ring: 'border-gray-600',   bg: 'bg-gray-800/30',    badge: 'bg-gray-700 text-gray-300',      btn: 'bg-gray-600 hover:bg-gray-500' },
  professional: { ring: 'border-blue-600',   bg: 'bg-blue-900/10',    badge: 'bg-blue-900/40 text-blue-300',   btn: 'bg-blue-600 hover:bg-blue-500' },
  enterprise:   { ring: 'border-purple-600', bg: 'bg-purple-900/10',  badge: 'bg-purple-900/40 text-purple-300', btn: 'bg-purple-700 hover:bg-purple-600' },
}

const TIERS: PlanTier[] = ['basic', 'professional', 'enterprise']

export function PlanSwitcher() {
  const { activePlan, setPlan, flags } = useFeatureStore()

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl">
      <div className="px-5 py-4 border-b border-gray-800">
        <h3 className="text-white font-semibold text-sm">Planes y Funcionalidades</h3>
        <p className="text-gray-500 text-xs mt-0.5">
          Activa un plan para habilitar sus funcionalidades. Cada nivel incluye todo lo del anterior.
        </p>
      </div>

      {/* Selector de planes */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TIERS.map((tier) => {
          const isActive = activePlan === tier
          const c = PLAN_COLORS[tier]
          const meta = PLAN_LABELS[tier]
          const featCount = PLAN_FEATURES[tier].length

          return (
            <div key={tier}
              className={`rounded-xl border-2 p-4 transition-all cursor-pointer ${
                isActive ? `${c.ring} ${c.bg}` : 'border-gray-800 hover:border-gray-600'
              }`}
              onClick={() => setPlan(tier)}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
                  {meta.name}
                </span>
                {isActive && (
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${c.btn}`}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">{meta.description}</p>
              <p className="text-gray-600 text-xs mt-2">{featCount} funcionalidades</p>
              {!isActive && (
                <button
                  onClick={(e) => { e.stopPropagation(); setPlan(tier) }}
                  className={`w-full mt-3 ${c.btn} text-white text-xs font-semibold py-1.5 rounded-lg transition-colors`}
                >
                  Activar
                </button>
              )}
              {isActive && (
                <div className="w-full mt-3 bg-gray-700/50 text-gray-400 text-xs font-semibold py-1.5 rounded-lg text-center">
                  ✓ Plan activo
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lista de features con estado */}
      <div className="border-t border-gray-800 divide-y divide-gray-800/50">
        {ALL_FEATURES.map((feat) => {
          const enabled = flags[feat.key] ?? false
          const planMeta = PLAN_LABELS[feat.plan]
          const c = PLAN_COLORS[feat.plan]

          return (
            <div key={feat.key} className={`px-5 py-3 flex items-center justify-between gap-3 ${enabled ? '' : 'opacity-50'}`}>
              <div className="flex items-center gap-3">
                {enabled
                  ? <div className="w-5 h-5 rounded-full bg-green-900/40 flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-green-400" /></div>
                  : <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0"><Lock className="w-3 h-3 text-gray-600" /></div>
                }
                <span className={`text-sm ${enabled ? 'text-white' : 'text-gray-500'}`}>{feat.label}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${c.badge}`}>
                {planMeta.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
