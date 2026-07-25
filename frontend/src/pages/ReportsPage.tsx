/**
 * ReportsPage — reportes simulados en modo demo (sin backend).
 * Muestra reportes predeterminados por entidad con vista de detalle expandible.
 */

import { useState } from 'react'
import { FileText, Download, CheckCircle, ChevronDown, ChevronUp, Shield, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { DEMO_ENTITIES } from '@/api/mockData'

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

const STANDARD_LABELS: Record<string, { name: string; color: string }> = {
  iso27001: { name: 'ISO/IEC 27001:2022', color: 'text-blue-400 bg-blue-900/20' },
  nist:     { name: 'NIST CSF 2.0',        color: 'text-green-400 bg-green-900/20' },
  cis:      { name: 'CIS Controls v8',     color: 'text-yellow-400 bg-yellow-900/20' },
  ley_gt:   { name: 'Ley Ciberseg. GT',    color: 'text-purple-400 bg-purple-900/20' },
}

// Contenido simulado de cada reporte
const REPORT_DETAILS: Record<string, {
  compliance: number
  findings: { title: string; severity: string }[]
  recommendations: string[]
  controls: { name: string; status: string; pct: number }[]
}> = {
  iso27001: {
    compliance: 74,
    findings: [
      { title: 'Gestión de accesos privilegiados sin MFA', severity: 'critical' },
      { title: 'Política de contraseñas desactualizada (< 8 chars)', severity: 'high' },
      { title: 'Registro de auditoría incompleto en servidores críticos', severity: 'high' },
      { title: 'Backups sin cifrado en reposo', severity: 'medium' },
    ],
    recommendations: [
      'Implementar MFA obligatorio para cuentas privilegiadas (A.9.4)',
      'Actualizar política de contraseñas: mínimo 12 caracteres + complejidad',
      'Habilitar logging centralizado en SIEM para todos los servidores críticos',
      'Cifrar respaldos con AES-256 antes del almacenamiento',
    ],
    controls: [
      { name: 'A.9 — Control de Acceso', status: 'parcial', pct: 65 },
      { name: 'A.10 — Criptografía', status: 'parcial', pct: 70 },
      { name: 'A.12 — Seguridad Operacional', status: 'cumplido', pct: 85 },
      { name: 'A.16 — Gestión de Incidentes', status: 'parcial', pct: 60 },
      { name: 'A.18 — Cumplimiento', status: 'cumplido', pct: 90 },
    ],
  },
  nist: {
    compliance: 68,
    findings: [
      { title: 'Sin inventario completo de activos de software', severity: 'high' },
      { title: 'Plan de respuesta a incidentes desactualizado (2022)', severity: 'high' },
      { title: 'Sin ejercicios de recuperación ante desastres en 18 meses', severity: 'medium' },
    ],
    recommendations: [
      'ID.AM: Completar inventario de activos de hardware y software con herramienta automatizada',
      'RS.RP: Actualizar y probar el plan de respuesta a incidentes trimestralmente',
      'RC.RP: Ejecutar simulacro de recuperación ante desastres en Q4 2025',
    ],
    controls: [
      { name: 'IDENTIFY (ID)', status: 'parcial', pct: 72 },
      { name: 'PROTECT (PR)', status: 'parcial', pct: 68 },
      { name: 'DETECT (DE)', status: 'cumplido', pct: 80 },
      { name: 'RESPOND (RS)', status: 'parcial', pct: 55 },
      { name: 'RECOVER (RC)', status: 'riesgo', pct: 40 },
    ],
  },
  cis: {
    compliance: 71,
    findings: [
      { title: 'Control 3: Datos sensibles sin clasificación formal', severity: 'high' },
      { title: 'Control 5: Cuentas de servicio con privilegios excesivos', severity: 'high' },
      { title: 'Control 7: Escaneo de vulnerabilidades no automatizado', severity: 'medium' },
    ],
    recommendations: [
      'Implementar política de clasificación de datos: Público / Interno / Confidencial / Restringido',
      'Aplicar principio de mínimo privilegio a todas las cuentas de servicio',
      'Automatizar escaneo semanal de vulnerabilidades con herramienta agentless',
    ],
    controls: [
      { name: 'Control 1 — Inventario de Activos', status: 'cumplido', pct: 88 },
      { name: 'Control 3 — Protección de Datos', status: 'parcial', pct: 62 },
      { name: 'Control 5 — Gestión de Cuentas', status: 'parcial', pct: 70 },
      { name: 'Control 7 — Gestión de Vulnerabilidades', status: 'parcial', pct: 65 },
      { name: 'Control 13 — Monitoreo y Defensa de Red', status: 'cumplido', pct: 82 },
    ],
  },
  ley_gt: {
    compliance: 60,
    findings: [
      { title: 'Sin procedimiento formal de notificación de brechas (72h)', severity: 'critical' },
      { title: 'Infraestructura crítica sin evaluación de riesgos documentada', severity: 'high' },
      { title: 'Ausencia de delegado de protección de datos (DPO)', severity: 'high' },
    ],
    recommendations: [
      'Art. 12: Establecer procedimiento de notificación al CERT-GT en máximo 72 horas',
      'Art. 15: Documentar evaluación de riesgos para infraestructura crítica',
      'Designar formalmente un Delegado de Protección de Datos (DPO)',
    ],
    controls: [
      { name: 'Art. 12 — Notificación de Incidentes', status: 'riesgo', pct: 30 },
      { name: 'Art. 15 — Infraestructura Crítica', status: 'parcial', pct: 55 },
      { name: 'Art. 18 — Gestión de Vulnerabilidades', status: 'parcial', pct: 65 },
      { name: 'Art. 22 — Auditorías Periódicas', status: 'parcial', pct: 70 },
      { name: 'Art. 25 — Continuidad Operacional', status: 'riesgo', pct: 45 },
    ],
  },
}

function statusColor(status: string) {
  if (status === 'cumplido') return 'bg-green-500'
  if (status === 'parcial')  return 'bg-yellow-500'
  return 'bg-red-500'
}

function pctColor(pct: number) {
  if (pct >= 80) return 'bg-green-500'
  if (pct >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function ReportsPage() {
  const { activeEntityId } = useAuthStore()
  const [expanded, setExpanded] = useState<string | null>(null)

  const entity = DEMO_ENTITIES.find((e) => e.id === activeEntityId)

  const reports = [
    { id: 'iso27001', title: `Evaluación ISO 27001:2022 — ${entity?.shortName ?? 'Organización'}` },
    { id: 'nist',     title: `NIST CSF 2.0 — Diagnóstico de Madurez` },
    { id: 'cis',      title: `CIS Controls v8 — Auditoría de Controles Críticos` },
    { id: 'ley_gt',   title: `Ley de Ciberseguridad de Guatemala — Cumplimiento` },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Reportes de Cumplimiento</h1>
        <p className="text-gray-500 text-sm">Evidencia automática para auditorías — {entity?.name}</p>
      </div>

      {/* Nota GitHub Pages */}
      {IS_DEMO && (
        <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl px-4 py-3 text-sm text-amber-300 flex items-start gap-2">
          <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Modo demo: los reportes PDF se generan en el servidor real. Aquí puedes ver el análisis interactivo completo de cada estándar.</span>
        </div>
      )}

      {/* Reportes */}
      <div className="space-y-3">
        {reports.map((r) => {
          const std = STANDARD_LABELS[r.id]
          const detail = REPORT_DETAILS[r.id]
          const isOpen = expanded === r.id
          const criticalCount = detail.findings.filter(f => f.severity === 'critical').length
          const highCount = detail.findings.filter(f => f.severity === 'high').length

          return (
            <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {/* Header clickeable */}
              <button
                className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-800/30 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : r.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">{r.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${std.color}`}>{std.name}</span>
                      <span className="text-xs text-gray-500">Cumplimiento: <span className={`font-semibold ${detail.compliance >= 80 ? 'text-green-400' : detail.compliance >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{detail.compliance}%</span></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {criticalCount > 0 && <span className="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full">{criticalCount} crítico{criticalCount > 1 ? 's' : ''}</span>}
                  {highCount > 0 && <span className="text-xs bg-orange-900/30 text-orange-400 px-2 py-0.5 rounded-full">{highCount} alto{highCount > 1 ? 's' : ''}</span>}
                  <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Listo</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {/* Detalle expandido */}
              {isOpen && (
                <div className="border-t border-gray-800 p-5 space-y-5">
                  {/* Barra de cumplimiento */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-400">Nivel de cumplimiento general</span>
                      <span className={`font-bold ${detail.compliance >= 80 ? 'text-green-400' : detail.compliance >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{detail.compliance}%</span>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${pctColor(detail.compliance)}`} style={{ width: `${detail.compliance}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Hallazgos */}
                    <div>
                      <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-400" /> Hallazgos ({detail.findings.length})
                      </h4>
                      <div className="space-y-2">
                        {detail.findings.map((f, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${f.severity === 'critical' ? 'bg-red-900/40 text-red-400' : f.severity === 'high' ? 'bg-orange-900/40 text-orange-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
                              {f.severity === 'critical' ? 'CRÍTICO' : f.severity === 'high' ? 'ALTO' : 'MEDIO'}
                            </span>
                            <p className="text-gray-300 text-xs">{f.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Controles */}
                    <div>
                      <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-blue-400" /> Estado de Controles
                      </h4>
                      <div className="space-y-2.5">
                        {detail.controls.map((c, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">{c.name}</span>
                              <span className={`font-semibold ${c.pct >= 80 ? 'text-green-400' : c.pct >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{c.pct}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${statusColor(c.status)}`} style={{ width: `${c.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recomendaciones */}
                  <div>
                    <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Recomendaciones</h4>
                    <div className="space-y-1.5">
                      {detail.recommendations.map((rec, i) => (
                        <p key={i} className="text-xs text-gray-300 flex items-start gap-2">
                          <span className="text-blue-400 font-bold flex-shrink-0">{i + 1}.</span> {rec}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Nota PDF */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 border-t border-gray-800 pt-3">
                    <Download className="w-3 h-3" />
                    <span>El PDF firmado digitalmente se genera al ejecutar el sistema con backend completo (Docker + FastAPI)</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
