/**
 * Gestión de Incidentes + Respuesta Automatizada — Plan Enterprise
 */
import { Shield, Clock, CheckCircle, AlertTriangle, Zap } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { DEMO_ENTITIES } from '@/api/mockData'

const INCIDENTS_UMG = [
  { id: 'INC-2025-031', title: 'Explotación Log4Shell — Portal Académico', severity: 'critical', status: 'investigating', assigned: 'Equipo SOC', opened: '2025-07-24 07:42', sla: '4h restantes', automated: ['Host aislado de VLAN externa', 'Regla WAF activada automáticamente', 'Alerta enviada al CISO'] },
  { id: 'INC-2025-030', title: 'Fuerza bruta AD — Cuenta svc_erp', severity: 'high', status: 'contained', assigned: 'Analista L2', opened: '2025-07-24 07:38', sla: 'Dentro del SLA', automated: ['Cuenta bloqueada automáticamente después de 5 fallos', 'IP 192.168.10.55 añadida a blocklist temporal', 'Ticket creado en ServiceDesk'] },
  { id: 'INC-2025-028', title: 'Phishing con malware adjunto — Exchange', severity: 'high', status: 'resolved', assigned: 'Analista L1', opened: '2025-07-23 15:20', sla: 'Resuelto', automated: ['Email en cuarentena automáticamente', 'URL bloqueada en proxy', 'Notificación al usuario afectado'] },
]

const INCIDENTS_HOSPITAL = [
  { id: 'INC-2025-045', title: 'RCE Crítico en Firewall Palo Alto PA-450', severity: 'critical', status: 'escalated', assigned: 'CISO + Equipo SOC', opened: '2025-07-24 08:01', sla: '2h restantes — CRÍTICO', automated: ['Notificación automática al CERT-GT (Ley Ciberseg. Art.12)', 'Reglas temporales IPS activadas', 'Backup de configuración tomado automáticamente'] },
  { id: 'INC-2025-044', title: 'Exportación masiva registros de pacientes — PHI Breach', severity: 'critical', status: 'investigating', assigned: 'Oficial Privacidad + TI', opened: '2025-07-24 07:45', sla: '3h restantes', automated: ['Sesión del usuario labtech01 terminada', 'Cuenta suspendida temporalmente', 'Log de accesos preservado para forense'] },
  { id: 'INC-2025-042', title: 'Movimiento lateral — Pass-the-Hash UCI', severity: 'high', status: 'contained', assigned: 'Analista L2', opened: '2025-07-24 07:22', sla: 'Dentro del SLA', automated: ['Segmento de red UCI aislado', 'Hash NTLM comprometido invalidado en AD', 'Alerta a equipo médico de UCI sobre posible interrupción'] },
]

const STATUS_STYLE: Record<string, { cls: string; label: string }> = {
  critical:      { cls: 'bg-red-900/30 text-red-400', label: 'CRÍTICO' },
  high:          { cls: 'bg-orange-900/30 text-orange-400', label: 'ALTO' },
  investigating: { cls: 'bg-yellow-900/20 text-yellow-400', label: 'Investigando' },
  escalated:     { cls: 'bg-red-900/20 text-red-400', label: 'Escalado' },
  contained:     { cls: 'bg-blue-900/20 text-blue-400', label: 'Contenido' },
  resolved:      { cls: 'bg-green-900/20 text-green-400', label: 'Resuelto' },
}

export function IncidentsPage() {
  const { activeEntityId } = useAuthStore()
  const entity = DEMO_ENTITIES.find(e => e.id === activeEntityId)
  const incidents = activeEntityId === 'hospital' ? INCIDENTS_HOSPITAL : INCIDENTS_UMG

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Gestión de Incidentes — Respuesta Automatizada</h1>
          <p className="text-gray-500 text-sm">{entity?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Abiertos', value: incidents.filter(i => i.status !== 'resolved').length, color: 'text-red-400' },
          { label: 'Críticos', value: incidents.filter(i => i.severity === 'critical').length, color: 'text-red-400' },
          { label: 'Contenidos', value: incidents.filter(i => i.status === 'contained').length, color: 'text-blue-400' },
          { label: 'Acciones Auto', value: incidents.reduce((a, i) => a + i.automated.length, 0), color: 'text-green-400' },
        ].map((k, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {incidents.map((inc) => (
          <div key={inc.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-500 text-xs font-mono">{inc.id}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[inc.severity]?.cls}`}>{STATUS_STYLE[inc.severity]?.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[inc.status]?.cls}`}>{STATUS_STYLE[inc.status]?.label}</span>
                </div>
                <p className="text-white font-semibold text-sm mt-1">{inc.title}</p>
                <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {inc.opened}</span>
                  <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> SLA: {inc.sla}</span>
                  <span>Asignado: {inc.assigned}</span>
                </p>
              </div>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-3">
              <p className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Acciones Automatizadas ({inc.automated.length})
              </p>
              <ul className="space-y-1">
                {inc.automated.map((a, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
