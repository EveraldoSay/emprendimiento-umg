/**
 * Página genérica para módulos según el plan activo.
 */

import { Lock, ArrowRight } from 'lucide-react'
import { useFeatureStore, PLAN_META, type PlanTier } from '@/store/featureStore'
import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  description: string
  icon: React.ReactNode
  requiredPlan?: PlanTier
  content?: React.ReactNode
}

export function PlaceholderPage({ title, description, icon, requiredPlan, content }: Props) {
  const { activePlan, setPlan } = useFeatureStore()
  const navigate = useNavigate()

  const isLocked = requiredPlan && activePlan === 'basic' && requiredPlan !== 'basic'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-400">
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
      </div>

      {isLocked ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-gray-600" />
          </div>
          <h3 className="text-white font-semibold mb-2">Módulo no disponible en tu plan actual</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Esta funcionalidad requiere el <strong className="text-white">{PLAN_META[requiredPlan!].name}</strong>.
            Actívalo desde el Dashboard para acceder.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => { setPlan(requiredPlan!); navigate('/dashboard') }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Activar {PLAN_META[requiredPlan!].name} <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-300 text-sm px-4 py-2.5 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
            >
              Ver planes disponibles
            </button>
          </div>
        </div>
      ) : (
        content ?? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center text-gray-500">
            <p className="text-sm">Módulo activo. Contenido disponible en el sistema completo con backend.</p>
          </div>
        )
      )}
    </div>
  )
}
