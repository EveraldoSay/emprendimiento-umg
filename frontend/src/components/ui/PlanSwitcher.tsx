/**
 * Panel de selección de plan con los módulos exactos del documento del proyecto.
 */

import { Check, Lock, Zap } from 'lucide-react'
import { useFeatureStore, PLAN_META, type PlanTier } from '@/store/featureStore'

const TIERS: PlanTier[] = ['basic', 'professional', 'enterprise']

const PLAN_MODULES: Record<PlanTier, string[]> = {
  basic: [
    'Escaneo de vulnerabilidades',
    'Dashboard interactivo',
    'Reportes mensuales',
    'Inventario de activos',
  ],
  professional: [
    'Evaluación de riesgos',
    'Cumplimiento ISO 27001',
    'Monitoreo continuo',
  ],
  enterprise: [
    'IA Predictiva (Ollama local)',
    'SOC Virtual',
    'SIEM Integrado',
    'Gestión de Incidentes',
    'Respuesta automatizada',
  ],
}

const BORDER: Record<PlanTier, string> = {
  basic:        'border-gray-600',
  professional: 'border-blue-600',
  enterprise:   'border-purple-600',
}

const BTN: Record<PlanTier, string> = {
  basic:        'bg-gray-600 hover:bg-gray-500',
  professional: 'bg-blue-600 hover:bg-blue-500',
  enterprise:   'bg-purple-700 hover:bg-purple-600',
}

export function PlanSwitcher() {
  const { activePlan, setPlan } = useFeatureStore()

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
        <Zap className="w-4 h-4 text-blue-400" />
        <div>
          <h3 className="text-white font-semibold text-sm">Planes y Módulos</h3>
          <p className="text-gray-500 text-xs">Cambia de plan para habilitar nuevos módulos en el menú lateral</p>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TIERS.map((tier) => {
          const isActive = activePlan === tier
          const meta = PLAN_META[tier]
          const isCurrent = isActive

          return (
            <div key={tier}
              onClick={() => setPlan(tier)}
              className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                isActive ? `${BORDER[tier]} bg-gray-800/40` : 'border-gray-800 hover:border-gray-600'
              }`}
            >
              {/* Header plan */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.badgeCls}`}>
                  {meta.name}
                </span>
                {isCurrent && (
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${BTN[tier]}`}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Módulos propios del plan */}
              <ul className="space-y-1.5 mb-4">
                {tier !== 'basic' && (
                  <li className="text-gray-600 text-xs italic mb-1">+ Todo el plan anterior</li>
                )}
                {PLAN_MODULES[tier].map((mod) => (
                  <li key={mod} className="flex items-start gap-1.5 text-xs text-gray-300">
                    <Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                    {mod}
                  </li>
                ))}
              </ul>

              {/* Botón */}
              {!isCurrent ? (
                <button
                  onClick={(e) => { e.stopPropagation(); setPlan(tier) }}
                  className={`w-full ${BTN[tier]} text-white text-xs font-semibold py-2 rounded-lg transition-colors`}
                >
                  Activar {meta.shortName}
                </button>
              ) : (
                <div className="w-full text-center text-xs text-gray-500 py-2 bg-gray-800/50 rounded-lg">
                  ✓ Plan activo
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Indicador visual de qué módulos están activos */}
      <div className="border-t border-gray-800 px-5 py-3">
        <p className="text-xs text-gray-500">
          <span className="text-white font-medium">Módulos activos:</span>{' '}
          {[
            ...PLAN_MODULES.basic,
            ...(activePlan !== 'basic' ? PLAN_MODULES.professional : []),
            ...(activePlan === 'enterprise' ? PLAN_MODULES.enterprise : []),
          ].join(' · ')}
        </p>
      </div>
    </div>
  )
}
