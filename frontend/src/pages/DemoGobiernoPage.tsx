/**
 * Entorno de demostración: Sector Gobierno / GovTech
 * Muestra datos ficticios de entidades públicas con análisis de cumplimiento.
 */

import { Building2, Shield, FileText, Lock, Users, AlertTriangle } from 'lucide-react'

export function DemoGobiernoPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900/20 to-teal-900/20 border border-green-800/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🏛️</span>
          <div>
            <h1 className="text-xl font-bold text-white">Demo: Consola GovTech</h1>
            <p className="text-green-300 text-sm">Sector Público · Transparencia Administrativa · Datos Ficticios</p>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-3 max-w-2xl">
          Entorno orientado a entidades gubernamentales como SAT, MP y municipalidades.
          Protege datos poblacionales y garantiza transparencia administrativa bajo la
          Ley de Ciberseguridad de Guatemala.
        </p>
        <div className="flex gap-2 mt-4 flex-wrap">
          <span className="text-xs bg-green-900/30 text-green-400 border border-green-800/40 px-3 py-1 rounded-full flex items-center gap-1">
            <Shield className="w-3 h-3" /> Ley Ciberseguridad GT
          </span>
          <span className="text-xs bg-teal-900/30 text-teal-400 border border-teal-800/40 px-3 py-1 rounded-full flex items-center gap-1">
            <Lock className="w-3 h-3" /> ISO 27001
          </span>
          <span className="text-xs bg-blue-900/30 text-blue-400 border border-blue-800/40 px-3 py-1 rounded-full flex items-center gap-1">
            <FileText className="w-3 h-3" /> NIST CSF 2.0
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Sistemas Críticos', value: '67', icon: <Building2 className="w-5 h-5" />, color: 'text-blue-400' },
          { label: 'Usuarios del Sistema', value: '1,240', icon: <Users className="w-5 h-5" />, color: 'text-teal-400' },
          { label: 'Incidentes (30d)', value: '4', icon: <AlertTriangle className="w-5 h-5" />, color: 'text-red-400' },
          { label: 'Cumplimiento Ley GT', value: '82%', icon: <Shield className="w-5 h-5" />, color: 'text-green-400' },
        ].map((kpi, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className={`${kpi.color} mb-2`}>{kpi.icon}</div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-gray-500 text-xs mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Infraestructura crítica */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-white font-semibold text-sm">Infraestructura Crítica Monitoreada</h3>
        </div>
        <div className="divide-y divide-gray-800">
          {[
            { name: 'Sistema de Registro Tributario (SAT)', status: 'operational', risk: 'media', vulns: 3 },
            { name: 'Portal de Transparencia MP', status: 'operational', risk: 'baja', vulns: 1 },
            { name: 'Base de Datos Poblacional RENAP', status: 'warning', risk: 'alta', vulns: 7 },
            { name: 'Red Interinstitucional MINGOB', status: 'operational', risk: 'media', vulns: 2 },
            { name: 'Sistema de Contrataciones GUATECOMPRAS', status: 'operational', risk: 'baja', vulns: 0 },
          ].map((sys, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  sys.status === 'operational' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
                }`} />
                <p className="text-white text-sm">{sys.name}</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className={`${
                  sys.risk === 'alta' ? 'text-red-400' :
                  sys.risk === 'media' ? 'text-yellow-400' : 'text-green-400'
                } font-semibold uppercase`}>
                  {sys.risk}
                </span>
                <span className="text-gray-500">{sys.vulns} vulns</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance timeline */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">
          Progreso de Cumplimiento — Ley de Ciberseguridad de Guatemala
        </h3>
        <div className="space-y-4">
          {[
            { art: 'Art. 12 — Notificación de incidentes (72h)', pct: 100, done: true },
            { art: 'Art. 15 — Protección infraestructura crítica', pct: 82, done: true },
            { art: 'Art. 18 — Gestión de vulnerabilidades', pct: 74, done: false },
            { art: 'Art. 22 — Auditorías periódicas', pct: 60, done: false },
            { art: 'Art. 25 — Continuidad operacional', pct: 45, done: false },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-400">{item.art}</span>
                <span className={item.done ? 'text-green-400' : 'text-yellow-400'}>{item.pct}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${item.done ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
