/**
 * Entorno de demostración: Sector Hospital (HIPAA)
 * Muestra datos ficticios clínicos con riesgos detectados por IA local.
 */

import { Shield, Lock, AlertTriangle, CheckCircle, Brain } from 'lucide-react'

const MOCK_ALERTS = [
  { id: '1', title: 'Acceso no autorizado a registros de pacientes', severity: 'critical', asset: 'HIS-Servidor-01', ai_insight: 'La IA detectó acceso desde IP externa a las 03:14 AM. Se recomienda aislar el host y revisar logs de sesión.' },
  { id: '2', title: 'Transmisión de datos HL7 sin cifrado', severity: 'high', asset: 'Integrador-HL7-02', ai_insight: 'El protocolo HL7 está siendo transmitido en texto plano. Se requiere TLS 1.3 para cumplimiento HIPAA §164.312(e)(1).' },
  { id: '3', title: 'Contraseñas débiles en sistema PACS', severity: 'medium', asset: 'PACS-Radiología', ai_insight: '14 cuentas tienen contraseñas de menos de 8 caracteres. Implementar política de contraseñas robustas.' },
]

export function DemoHospitalPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/40 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🏥</span>
          <div>
            <h1 className="text-xl font-bold text-white">Demo: Sector Hospital</h1>
            <p className="text-blue-300 text-sm">Entorno HIPAA · IA Soberana · Datos Ficticios</p>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-3 max-w-2xl">
          Demostración de la plataforma en un entorno hospitalario. La IA detecta riesgos en documentos
          clínicos y sistemas de información de salud sin que ningún dato salga de la red local.
        </p>
        <div className="flex gap-2 mt-4 flex-wrap">
          <span className="text-xs bg-green-900/30 text-green-400 border border-green-800/40 px-3 py-1 rounded-full flex items-center gap-1">
            <Lock className="w-3 h-3" /> Datos en red local
          </span>
          <span className="text-xs bg-blue-900/30 text-blue-400 border border-blue-800/40 px-3 py-1 rounded-full flex items-center gap-1">
            <Shield className="w-3 h-3" /> Cumplimiento HIPAA
          </span>
          <span className="text-xs bg-purple-900/30 text-purple-400 border border-purple-800/40 px-3 py-1 rounded-full flex items-center gap-1">
            <Brain className="w-3 h-3" /> IA Ollama (Llama 3)
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Activos Clínicos', value: '23', icon: '🖥️' },
          { label: 'Vulnerabilidades', value: '12', icon: '🛡️' },
          { label: 'HIPAA Controls', value: '87%', icon: '✅', green: true },
          { label: 'Alertas 24h', value: '3', icon: '⚠️', red: true },
        ].map((kpi, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">{kpi.icon}</p>
            <p className={`text-2xl font-bold ${kpi.green ? 'text-green-400' : kpi.red ? 'text-red-400' : 'text-white'}`}>
              {kpi.value}
            </p>
            <p className="text-gray-500 text-xs">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* AI Detected Risks */}
      <div>
        <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          Riesgos Detectados por IA (Llama 3 — Local)
        </h2>
        <div className="space-y-3">
          {MOCK_ALERTS.map((alert) => (
            <div key={alert.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      alert.severity === 'critical' ? 'text-red-400' :
                      alert.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                    }`} />
                    <p className="text-white font-medium text-sm">{alert.title}</p>
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">Activo: {alert.asset}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  alert.severity === 'critical' ? 'bg-red-900/30 text-red-400' :
                  alert.severity === 'high' ? 'bg-orange-900/30 text-orange-400' :
                  'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
              <div className="bg-purple-900/10 border border-purple-800/20 rounded-lg p-3">
                <p className="text-xs text-purple-300 flex items-start gap-2">
                  <Brain className="w-3 h-3 mt-0.5 flex-shrink-0 text-purple-400" />
                  <span><strong>IA Soberana:</strong> {alert.ai_insight}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HIPAA Compliance summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          Resumen de Cumplimiento HIPAA
        </h3>
        <div className="space-y-3">
          {[
            { control: '§164.308 — Salvaguardas Administrativas', compliance: 91, ok: true },
            { control: '§164.310 — Salvaguardas Físicas', compliance: 78, ok: true },
            { control: '§164.312 — Salvaguardas Técnicas', compliance: 65, ok: false },
            { control: '§164.314 — Requisitos Organizacionales', compliance: 85, ok: true },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{item.control}</span>
                <span className={item.ok ? 'text-green-400' : 'text-yellow-400'}>{item.compliance}%</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${item.ok ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${item.compliance}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
