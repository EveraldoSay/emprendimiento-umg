/**
 * Cumplimiento ISO 27001 — Plan Profesional
 */
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { DEMO_ENTITIES } from '@/api/mockData'

const CONTROLS_UMG = [
  { code: 'A.5',  name: 'Políticas de Seguridad',         pct: 90, status: 'compliant',   finding: null },
  { code: 'A.6',  name: 'Organización de Seguridad',      pct: 75, status: 'partial',     finding: 'Roles CISO y DPO no formalizados' },
  { code: 'A.8',  name: 'Gestión de Activos',             pct: 82, status: 'compliant',   finding: null },
  { code: 'A.9',  name: 'Control de Acceso',              pct: 65, status: 'partial',     finding: 'MFA no aplicado en 34% de cuentas privilegiadas' },
  { code: 'A.10', name: 'Criptografía',                   pct: 70, status: 'partial',     finding: 'Backups sin cifrado en reposo' },
  { code: 'A.12', name: 'Seguridad en Operaciones',       pct: 88, status: 'compliant',   finding: null },
  { code: 'A.13', name: 'Seguridad en Comunicaciones',    pct: 72, status: 'partial',     finding: 'TLS 1.0/1.1 aún activo en 2 servidores legacy' },
  { code: 'A.16', name: 'Gestión de Incidentes',          pct: 60, status: 'non_compliant', finding: 'Sin procedimiento documentado para brechas de datos' },
  { code: 'A.17', name: 'Continuidad del Negocio',        pct: 55, status: 'non_compliant', finding: 'BCP sin probar desde 2023' },
  { code: 'A.18', name: 'Cumplimiento Legal',             pct: 85, status: 'compliant',   finding: null },
]

const CONTROLS_HOSPITAL = [
  { code: 'A.5',  name: 'Políticas de Seguridad',         pct: 85, status: 'compliant',    finding: null },
  { code: 'A.6',  name: 'Organización de Seguridad',      pct: 60, status: 'partial',      finding: 'Comité de Seguridad no se reúne hace 8 meses' },
  { code: 'A.8',  name: 'Gestión de Activos (PHI)',        pct: 70, status: 'partial',      finding: 'Clasificación de datos de pacientes incompleta' },
  { code: 'A.9',  name: 'Control de Acceso',              pct: 55, status: 'non_compliant', finding: 'Cuentas genéricas compartidas en UCI (10 usuarios, 1 cuenta)' },
  { code: 'A.10', name: 'Criptografía',                   pct: 50, status: 'non_compliant', finding: 'HL7 en texto plano, PACS sin cifrado en reposo' },
  { code: 'A.12', name: 'Seguridad en Operaciones',       pct: 80, status: 'compliant',    finding: null },
  { code: 'A.13', name: 'Seguridad en Comunicaciones',    pct: 60, status: 'partial',      finding: 'Segmentación VLAN médica insuficiente' },
  { code: 'A.16', name: 'Gestión de Incidentes (HIPAA)',  pct: 45, status: 'non_compliant', finding: 'Sin notificación formal a MSPAS/CERT-GT en últimas 2 brechas' },
  { code: 'A.17', name: 'Continuidad del Negocio',        pct: 65, status: 'partial',      finding: 'BCP existe pero no contempla fallo del HIS' },
  { code: 'A.18', name: 'Cumplimiento (Ley GT + HIPAA)',  pct: 55, status: 'non_compliant', finding: 'Pendiente designar DPO según Ley Ciberseg. Guatemala' },
]

const STATUS_ICON = {
  compliant:     <CheckCircle className="w-4 h-4 text-green-400" />,
  partial:       <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  non_compliant: <XCircle className="w-4 h-4 text-red-400" />,
}

export function CompliancePage() {
  const { activeEntityId } = useAuthStore()
  const entity = DEMO_ENTITIES.find(e => e.id === activeEntityId)
  const controls = activeEntityId === 'hospital' ? CONTROLS_HOSPITAL : CONTROLS_UMG
  const avg = Math.round(controls.reduce((a, c) => a + c.pct, 0) / controls.length)
  const compliant = controls.filter(c => c.status === 'compliant').length
  const noncompliant = controls.filter(c => c.status === 'non_compliant').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-400" /> Cumplimiento ISO/IEC 27001:2022
        </h1>
        <p className="text-gray-500 text-sm">{entity?.name} — Gap Analysis de controles del Anexo A</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className={`text-3xl font-bold ${avg >= 80 ? 'text-green-400' : avg >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{avg}%</p>
          <p className="text-gray-500 text-xs mt-1">Cumplimiento general</p>
        </div>
        <div className="bg-gray-900 border border-green-800/30 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{compliant}</p>
          <p className="text-gray-500 text-xs mt-1">Controles OK</p>
        </div>
        <div className="bg-gray-900 border border-red-800/30 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{noncompliant}</p>
          <p className="text-gray-500 text-xs mt-1">No conformidades</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800">
          <h3 className="text-white font-semibold text-sm">Controles del Anexo A</h3>
        </div>
        <div className="divide-y divide-gray-800">
          {controls.map((c) => (
            <div key={c.code} className="px-5 py-3 flex items-center gap-4 flex-wrap">
              {STATUS_ICON[c.status as keyof typeof STATUS_ICON]}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-500 text-xs font-mono">{c.code}</span>
                  <span className="text-white text-sm">{c.name}</span>
                </div>
                {c.finding && <p className="text-orange-400 text-xs mt-0.5">⚠ {c.finding}</p>}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden hidden sm:block">
                  <div className={`h-full rounded-full ${c.pct >= 80 ? 'bg-green-500' : c.pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${c.pct}%` }} />
                </div>
                <span className={`text-sm font-bold w-10 text-right ${c.pct >= 80 ? 'text-green-400' : c.pct >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{c.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
