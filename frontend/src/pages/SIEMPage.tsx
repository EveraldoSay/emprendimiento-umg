/**
 * SIEM Integrado — Plan Enterprise
 */
import { Database, AlertTriangle, Activity, Filter } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { DEMO_ENTITIES } from '@/api/mockData'

const EVENTS_UMG = [
  { time: '07:42:13', level: 'CRITICAL', source: 'FortiGate-200F', category: 'Intrusion', message: 'IPS: Log4Shell exploit attempt blocked — src 185.220.101.45 → portal.umg.edu.gt:8080', rule: 'IPS-47291' },
  { time: '07:38:02', level: 'HIGH',     source: 'AD-DC01',        category: 'Identity',  message: 'Logon failure x47 — user svc_erp from 192.168.10.55 — potential brute force', rule: 'AUTH-1045' },
  { time: '07:21:44', level: 'HIGH',     source: 'Exchange-2019',  category: 'Email',     message: 'Phishing URL detected in attachment: hxxp://malware-cdn.ru/payload.doc', rule: 'EMAIL-302' },
  { time: '06:55:10', level: 'MEDIUM',   source: 'NAS-01',        category: 'Storage',   message: 'Unusual data access: 2.3GB read by svc_backup outside backup window (03:12AM)', rule: 'DLP-201' },
  { time: '06:30:00', level: 'INFO',     source: 'Portal-UMG',    category: 'Auth',      message: '12,430 successful student logins — morning peak load nominal', rule: 'AUTH-INFO' },
  { time: '05:15:22', level: 'MEDIUM',   source: 'Moodle-LMS',    category: 'App',       message: 'Response time degraded: avg 340ms (threshold 200ms) — possible DB bottleneck', rule: 'PERF-110' },
]

const EVENTS_HOSPITAL = [
  { time: '08:01:30', level: 'CRITICAL', source: 'Palo-Alto-PA450', category: 'Firewall',  message: 'CVE-2024-3400 exploit attempt detected — GlobalProtect HTTP request anomaly', rule: 'NGFW-9921' },
  { time: '07:45:11', level: 'CRITICAL', source: 'HIS-OpenMRS',    category: 'PHI',       message: 'Bulk export attempt: 45,000 patient records queried in 8 min by user labtech01', rule: 'PHI-401' },
  { time: '07:22:33', level: 'HIGH',     source: 'PACS-Server',    category: 'Lateral',   message: 'Pass-the-Hash detected: workstation-UCI-03 → PACS (NTLM relay) — MITRE T1550.002', rule: 'CRED-512' },
  { time: '06:58:47', level: 'HIGH',     source: 'LIS-Lab',        category: 'Network',   message: 'HL7 messages captured unencrypted — sniffing activity from 172.16.1.99', rule: 'NET-330' },
  { time: '06:20:00', level: 'MEDIUM',   source: 'Farmacia-Srv',   category: 'App',       message: 'Unauthorized inventory modification: user recep02 changed stock of controlled substance', rule: 'APP-225' },
  { time: '05:44:18', level: 'INFO',     source: 'Backup-Server',  category: 'Backup',    message: 'Daily backup completed: HIS 45GB, PACS 2.1TB — status: SUCCESS', rule: 'BACKUP-OK' },
]

const LEVEL_STYLE: Record<string, string> = {
  CRITICAL: 'text-red-400 bg-red-900/20',
  HIGH:     'text-orange-400 bg-orange-900/20',
  MEDIUM:   'text-yellow-400 bg-yellow-900/20',
  INFO:     'text-gray-400 bg-gray-800',
}

export function SIEMPage() {
  const { activeEntityId } = useAuthStore()
  const entity = DEMO_ENTITIES.find(e => e.id === activeEntityId)
  const events = activeEntityId === 'hospital' ? EVENTS_HOSPITAL : EVENTS_UMG
  const critical = events.filter(e => e.level === 'CRITICAL').length
  const high     = events.filter(e => e.level === 'HIGH').length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-900/30 rounded-xl flex items-center justify-center">
          <Database className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">SIEM Integrado</h1>
          <p className="text-gray-500 text-sm">{entity?.name} — Correlación de eventos de seguridad</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Eventos (24h)', value: events.length, color: 'text-white' },
          { label: 'Críticos', value: critical, color: 'text-red-400' },
          { label: 'Altos', value: high, color: 'text-orange-400' },
          { label: 'Fuentes', value: new Set(events.map(e => e.source)).size, color: 'text-blue-400' },
        ].map((k, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" /> Log de Eventos — Últimas 4 horas
          </h3>
          <Filter className="w-4 h-4 text-gray-500" />
        </div>
        <div className="divide-y divide-gray-800/50 font-mono text-xs">
          {events.map((ev, i) => (
            <div key={i} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-800/20 transition-colors">
              <span className="text-gray-600 flex-shrink-0 pt-0.5">{ev.time}</span>
              <span className={`font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${LEVEL_STYLE[ev.level]}`}>{ev.level}</span>
              <span className="text-blue-400 flex-shrink-0 hidden sm:block">[{ev.source}]</span>
              <span className="text-gray-300 flex-1 min-w-0 break-words">{ev.message}</span>
              <span className="text-gray-700 flex-shrink-0 hidden md:block">{ev.rule}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
