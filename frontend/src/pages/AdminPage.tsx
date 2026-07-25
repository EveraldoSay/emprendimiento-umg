import { useEffect, useState } from 'react'
import { Settings, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { apiClient } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { useFeatureStore } from '@/store/featureStore'
import type { FeatureName, FeatureFlags } from '@/types'

const FEATURE_LABELS: Record<FeatureName, { label: string; description: string; plan: string }> = {
  ai_remediation: {
    label: 'Motor de Remediación con IA',
    description: 'Sugerencias de remediación generadas por LLM local (Ollama).',
    plan: 'Premium',
  },
  xdr: {
    label: 'XDR — Detección Extendida',
    description: 'Correlación de eventos de endpoints, red e identidad en tiempo real.',
    plan: 'Premium',
  },
  auto_remediation: {
    label: 'Remediación Automática',
    description: 'Playbooks de respuesta automática: aislamiento de host, bloqueo de IP.',
    plan: 'Premium',
  },
  dedicated_infra: {
    label: 'Infraestructura Dedicada',
    description: 'Contenedor Docker exclusivo y API personalizada para el tenant.',
    plan: 'Enterprise',
  },
  advanced_compliance: {
    label: 'Compliance Avanzado',
    description: 'Reportes ISO 27001, NIST CSF y Ley de Ciberseguridad de Guatemala avanzados.',
    plan: 'Enterprise',
  },
}

export function AdminPage() {
  const { user } = useAuthStore()
  const { fetchFlags } = useFeatureStore()
  const [flags, setFlags] = useState<FeatureFlags | null>(null)
  const [saving, setSaving] = useState<FeatureName | null>(null)

  useEffect(() => {
    if (user?.organization_id) {
      apiClient
        .get(`/admin/feature-flags/${user.organization_id}`)
        .then((res) => setFlags(res.data.flags))
        .catch(() => {})
    }
  }, [user?.organization_id])

  const toggle = async (feature: FeatureName) => {
    if (!flags || !user?.organization_id) return
    setSaving(feature)
    const newValue = !flags[feature]
    try {
      await apiClient.patch(`/admin/feature-flags/${user.organization_id}`, {
        feature,
        enabled: newValue,
      })
      const updated = { ...flags, [feature]: newValue }
      setFlags(updated)
      await fetchFlags(user.organization_id)
    } catch {
      // Revertir en caso de error
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Administración</h1>
        <p className="text-gray-500 text-sm">Gestión de funcionalidades y configuración del tenant</p>
      </div>

      {/* Feature Flags */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-400" />
          <h3 className="text-white font-semibold text-sm">Feature Flags</h3>
          <span className="text-xs text-gray-600 ml-auto">Organización: {user?.organization_id?.slice(0, 8)}...</span>
        </div>

        <div className="divide-y divide-gray-800">
          {(Object.entries(FEATURE_LABELS) as [FeatureName, typeof FEATURE_LABELS[FeatureName]][]).map(
            ([feature, meta]) => (
              <div key={feature} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium">{meta.label}</p>
                    <span className="text-xs bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded">
                      {meta.plan}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">{meta.description}</p>
                </div>

                <button
                  onClick={() => toggle(feature)}
                  disabled={saving === feature || !flags}
                  className="flex items-center gap-2 text-sm font-medium disabled:opacity-50 transition-colors"
                  aria-label={`Toggle ${meta.label}`}
                >
                  {saving === feature ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  ) : flags?.[feature] ? (
                    <>
                      <ToggleRight className="w-7 h-7 text-green-400" />
                      <span className="text-green-400 text-xs">ON</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-7 h-7 text-gray-600" />
                      <span className="text-gray-600 text-xs">OFF</span>
                    </>
                  )}
                </button>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Plan info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Plan Actual</h3>
        <div className="flex gap-3">
          {['standard', 'premium', 'enterprise'].map((plan) => (
            <div
              key={plan}
              className={`flex-1 rounded-xl border p-4 text-center ${
                plan === 'premium'
                  ? 'border-blue-600 bg-blue-900/20'
                  : 'border-gray-700 bg-gray-800/50 opacity-50'
              }`}
            >
              <p className="text-white font-semibold text-sm capitalize">{plan}</p>
              <p className="text-gray-500 text-xs mt-1">
                {plan === 'standard' && 'Escaneo + Inventario'}
                {plan === 'premium' && 'IA + XDR + Auto'}
                {plan === 'enterprise' && 'Infra Dedicada + Compliance'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
