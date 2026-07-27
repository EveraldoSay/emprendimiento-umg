/**
 * Monitoreo Continuo — Plan Profesional
 * Muestra estado en tiempo real de activos críticos por entidad.
 */

import { useEffect, useState } from 'react'
import { MonitorCheck, Wifi, WifiOff, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { DEMO_ENTITIES } from '@/api/mockData'

interface ServiceStatus {
  name: string
  host: string
  type: string
  status: 'up' | 'down' | 'degraded'
  uptime: string
  latency: string
  lastCheck: string
}

const SERVICES_UMG: ServiceStatus[] = [
  { name: 'Portal Académico', host: 'portal.umg.edu.gt', type: 'HTTPS', status: 'up', uptime: '99.7%', latency: '45ms', lastCheck: 'hace 30s' },
  { name: 'Servidor de Correo', host: 'mail.umg.edu.gt', type: 'SMTP/IMAP', status: 'up', uptime: '99.1%', latency: '82ms', lastCheck: 'hace 30s' },
  { name: 'LMS Moodle', host: 'lms.umg.edu.gt', type: 'HTTPS', status: 'degraded', uptime: '97.3%', latency: '340ms', lastCheck: 'hace 30s' },
  { name: 'ERP SAP', host: 'erp.umg.edu.gt', type: 'HTTPS', status: 'up', uptime: '99.9%', latency: '28ms', lastCheck: 'hace 30s' },
  { name: 'DNS Primario', host: '190.107.94.1', type: 'DNS', status: 'up', uptime: '100%', latency: '2ms', lastCheck: 'hace 30s' },
  { name: 'Biblioteca Digital', host: 'biblioteca.umg.edu.gt', type: 'HTTPS', status: 'up', uptime: '98.4%', latency: '67ms', lastCheck: 'hace 1min' },
  { name: 'VPN Institucional', host: 'vpn.umg.edu.gt', type: 'VPN/SSL', status: 'up', uptime: '99.5%', latency: '110ms', lastCheck: 'hace 1min' },
  { name: 'NAS Backup', host: 'nas01.umg.local', type: 'SMB', status: 'down', uptime: '95.2%', latency: 'timeout', lastCheck: 'hace 2min' },
]

const SERVICES_HOSPITAL: ServiceStatus[] = [
  { name: 'HIS OpenMRS', host: 'his.hospitalroosevelt.gob.gt', type: 'HTTPS', status: 'up', uptime: '99.8%', latency: '38ms', lastCheck: 'hace 30s' },
  { name: 'PACS Imágenes', host: 'pacs.hospitalroosevelt.gob.gt', type: 'DICOM', status: 'up', uptime: '99.5%', latency: '55ms', lastCheck: 'hace 30s' },
  { name: 'Sistema Farmacia', host: 'farmacia.hospitalroosevelt.gob.gt', type: 'HTTPS', status: 'degraded', uptime: '98.1%', latency: '280ms', lastCheck: 'hace 30s' },
  { name: 'LIS Laboratorio', host: 'lis.hospitalroosevelt.gob.gt', type: 'HTTPS', status: 'up', uptime: '99.2%', latency: '42ms', lastCheck: 'hace 30s' },
  { name: 'Telemedicina', host: 'telemedicina.hospitalroosevelt.gob.gt', type: 'HTTPS', status: 'up', uptime: '96.8%', latency: '98ms', lastCheck: 'hace 1min' },
  { name: 'RIS Radiología', host: 'ris.hospitalroosevelt.gob.gt', type: 'HTTPS', status: 'up', uptime: '99.0%', latency: '61ms', lastCheck: 'hace 1min' },
  { name: 'Firewall Palo Alto', host: '172.16.0.1', type: 'HTTPS/API', status: 'up', uptime: '100%', latency: '5ms', lastCheck: 'hace 30s' },
  { name: 'DC MSPAS', host: 'dc-hosp.mspas.local', type: 'LDAP', status: 'down', uptime: '94.7%', latency: 'timeout', lastCheck: 'hace 3min' },
]

function StatusIcon({ status }: { status: ServiceStatus['status'] }) {
  if (status === 'up') return <Wifi className="w-4 h-4 text-green-400" />
  if (status === 'degraded') return <AlertTriangle className="w-4 h-4 text-yellow-400" />
  return <WifiOff className="w-4 h-4 text-red-400" />
}

function StatusBadge({ status }: { status: ServiceStatus['status'] }) {
  const cls = status === 'up' ? 'bg-green-900/30 text-green-400' : status === 'degraded' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'
  const label = status === 'up' ? 'Operativo' : status === 'degraded' ? 'Degradado' : 'Caído'
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}

export function MonitoringPage() {
  const { activeEntityId } = useAuthStore()
  const [tick, setTick] = useState(0)
  const services = activeEntityId === 'hospital' ? SERVICES_HOSPITAL : SERVICES_UMG
  const entity = DEMO_ENTITIES.find(e => e.id === activeEntityId)

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const up = services.filter(s => s.status === 'up').length
  const degraded = services.filter(s => s.status === 'degraded').length
  const down = services.filter(s => s.status === 'down').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MonitorCheck className="w-5 h-5 text-blue-400" /> Monitoreo Continuo
          </h1>
          <p className="text-gray-500 text-sm">{entity?.name} — Estado de servicios en tiempo real</p>
        </div>
        <button onClick={() => setTick(n => n + 1)} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white border border-gray-700 rounded-lg px-3 py-1.5 transition-colors">
          <RefreshCw className="w-3 h-3" /> Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-green-800/40 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{up}</p>
          <p className="text-gray-500 text-xs mt-1">Operativos</p>
        </div>
        <div className="bg-gray-900 border border-yellow-800/40 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">{degraded}</p>
          <p className="text-gray-500 text-xs mt-1">Degradados</p>
        </div>
        <div className="bg-gray-900 border border-red-800/40 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{down}</p>
          <p className="text-gray-500 text-xs mt-1">Caídos</p>
        </div>
      </div>

      {/* Tabla de servicios */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">Estado de Servicios</h3>
          <span className="text-xs text-gray-500">Actualización cada 30s</span>
        </div>
        <div className="divide-y divide-gray-800">
          {services.map((svc, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-4 flex-wrap">
              <StatusIcon status={svc.status} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{svc.name}</p>
                <p className="text-gray-500 text-xs font-mono">{svc.host} · {svc.type}</p>
              </div>
              <div className="flex items-center gap-4 text-xs flex-wrap">
                <span className="text-gray-400">Latencia: <span className={svc.latency === 'timeout' ? 'text-red-400 font-semibold' : 'text-white'}>{svc.latency}</span></span>
                <span className="text-gray-400">Uptime: <span className="text-white">{svc.uptime}</span></span>
                <span className="text-gray-600">{svc.lastCheck}</span>
                <StatusBadge status={svc.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SLA summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" /> Resumen SLA — Últimos 30 días
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Disponibilidad general', pct: Math.round((up / services.length) * 100) },
            { label: 'Servicios críticos (salud/educación)', pct: 99 },
            { label: 'Tiempo medio de respuesta', pct: 87, note: 'avg 65ms' },
            { label: 'SLA contratado', pct: 100, note: '99.5% objetivo' },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{item.label} {item.note ? <span className="text-gray-600">({item.note})</span> : ''}</span>
                <span className={`font-semibold ${item.pct >= 95 ? 'text-green-400' : item.pct >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>{item.pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${item.pct >= 95 ? 'bg-green-500' : item.pct >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
