import { useEffect, useState, type FormEvent } from 'react'
import { Radio, Plus, RefreshCw, Wifi, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useScanStore } from '@/store/scanStore'
import { apiClient } from '@/api/client'
import type { ScanJob, ScanType } from '@/types'

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

// Targets predeterminados para el demo (redes reales de universidades GT)
const DEMO_TARGETS = [
  { label: 'Red UMG — Servidores (190.0.0.0/28)',      value: '190.0.0.0/28' },
  { label: 'Red UMG — Interna (192.168.10.0/24)',      value: '192.168.10.0/24' },
  { label: 'Red USAC — Servidores (200.0.0.0/28)',     value: '200.0.0.0/28' },
  { label: 'Red USAC — Académica (192.168.20.0/24)',   value: '192.168.20.0/24' },
  { label: 'Firewall Perimetral (190.0.0.1)',          value: '190.0.0.1' },
]

const STATUS_STYLE: Record<string, { cls: string; icon: React.ReactNode }> = {
  pending:   { cls: 'text-gray-400 bg-gray-800',           icon: <Clock className="w-3 h-3" /> },
  running:   { cls: 'text-blue-400 bg-blue-900/20',        icon: <Wifi className="w-3 h-3 animate-pulse" /> },
  completed: { cls: 'text-green-400 bg-green-900/20',      icon: <CheckCircle className="w-3 h-3" /> },
  failed:    { cls: 'text-red-400 bg-red-900/20',          icon: <XCircle className="w-3 h-3" /> },
  cancelled: { cls: 'text-gray-500 bg-gray-800/50',        icon: <XCircle className="w-3 h-3" /> },
}

// Resultado de escaneo ficticio por target
const SCAN_RESULTS: Record<string, { hosts: number; ports: number; vulns: string[] }> = {
  '190.0.0.0/28':   { hosts: 5, ports: 38, vulns: ['CVE-2021-44228 (Log4Shell)', 'CVE-2021-26855 (ProxyLogon)', 'CVE-2024-21762 (FortiOS RCE)'] },
  '192.168.10.0/24':{ hosts: 3, ports: 22, vulns: ['CVE-2022-30190 (Follina)', 'CVE-2023-2454 (PostgreSQL)'] },
  '200.0.0.0/28':   { hosts: 4, ports: 31, vulns: ['CVE-2020-1350 (SIGRed)', 'CVE-2022-0778 (OpenSSL)'] },
  '192.168.20.0/24':{ hosts: 4, ports: 19, vulns: ['CVE-2023-21554 (QueueJumper)', 'Credenciales débiles Jitsi'] },
  '190.0.0.1':      { hosts: 1, ports: 6,  vulns: ['CVE-2024-21762 (FortiOS SSL-VPN RCE)'] },
}

export function ScansPage() {
  const { jobs, liveScans, startDemoScan } = useScanStore()
  const [realJobs, setRealJobs] = useState<ScanJob[]>([])
  const [loadingReal, setLoadingReal] = useState(!IS_DEMO)
  const [showForm, setShowForm] = useState(false)
  const [target, setTarget] = useState(DEMO_TARGETS[0].value)
  const [scanType, setScanType] = useState<ScanType>('full')
  const [submitting, setSubmitting] = useState(false)

  // Modo real: cargar desde API
  useEffect(() => {
    if (IS_DEMO) return
    setLoadingReal(true)
    apiClient.get('/scans/?limit=50')
      .then((r) => setRealJobs(r.data.items ?? []))
      .catch(() => {})
      .finally(() => setLoadingReal(false))
  }, [])

  const displayJobs = IS_DEMO ? jobs : realJobs

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setShowForm(false)

    if (IS_DEMO) {
      startDemoScan(target, scanType)
      setSubmitting(false)
      return
    }

    try {
      await apiClient.post('/scans/', { target, scan_type: scanType })
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Escaneos de Vulnerabilidades</h1>
          <p className="text-gray-500 text-sm">Descubrimiento agentless mediante Nmap + NVD · {displayJobs.length} registros</p>
        </div>
        <div className="flex gap-2">
          {!IS_DEMO && (
            <button onClick={() => setLoadingReal(true)} className="p-2 text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Escaneo
          </button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-gray-900 border border-blue-600/40 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Configurar nuevo escaneo</h3>
          <form onSubmit={handleSubmit} className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-56">
              <label className="block text-xs text-gray-400 mb-1">Target (IP, CIDR o hostname)</label>
              {IS_DEMO ? (
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  {DEMO_TARGETS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="192.168.1.0/24"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tipo de escaneo</label>
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value as ScanType)}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="quick">Rápido — Top 100 puertos</option>
                <option value="full">Completo — Todos los puertos + OS</option>
                <option value="stealth">Sigiloso — SYN scan</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {submitting ? 'Iniciando...' : '▶ Iniciar Escaneo'}
            </button>
          </form>
          {IS_DEMO && (
            <p className="text-xs text-gray-600 mt-3">
              Modo demo: el escaneo simulará las fases reales de Nmap en tiempo real (~12 segundos).
            </p>
          )}
        </div>
      )}

      {/* Jobs en vivo (solo modo demo) */}
      {IS_DEMO && Object.values(liveScans).some((l) => l.pct < 100) && (
        <div className="space-y-3">
          {Object.values(liveScans)
            .filter((l) => l.pct < 100)
            .map((live) => {
              const job = jobs.find((j) => j.id === live.jobId)
              if (!job) return null
              return (
                <div key={live.jobId} className="bg-gray-900 border border-blue-600/40 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold text-sm flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-blue-400 animate-pulse" />
                        Escaneo en progreso — <span className="font-mono text-blue-300">{job.target}</span>
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">{live.label}</p>
                    </div>
                    <span className="text-blue-400 font-bold text-sm">{live.pct}%</span>
                  </div>
                  {/* Barra de progreso */}
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-700"
                      style={{ width: `${live.pct}%` }}
                    />
                  </div>
                  {/* Fases */}
                  <div className="flex gap-1 mt-3">
                    {['Hosts', 'Puertos', 'Servicios', 'CVEs', 'Informe'].map((step, i) => {
                      const threshold = [20, 45, 65, 82, 95]
                      const done = live.pct >= threshold[i]
                      const active = live.pct >= (threshold[i - 1] ?? 0) && live.pct < threshold[i]
                      return (
                        <div key={step} className="flex-1 text-center">
                          <div className={`h-1 rounded-full mb-1 transition-all duration-500 ${done ? 'bg-cyan-400' : active ? 'bg-blue-500 animate-pulse' : 'bg-gray-700'}`} />
                          <p className={`text-xs ${done ? 'text-cyan-400' : active ? 'text-blue-400' : 'text-gray-600'}`}>{step}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* Resultados completados (solo demo) */}
      {IS_DEMO && Object.values(liveScans).some((l) => l.pct === 100) && (
        <div className="space-y-2">
          {Object.values(liveScans)
            .filter((l) => l.pct === 100)
            .map((live) => {
              const job = jobs.find((j) => j.id === live.jobId)
              if (!job) return null
              const result = SCAN_RESULTS[job.target] ?? { hosts: 2, ports: 12, vulns: ['Vulnerabilidad detectada'] }
              return (
                <div key={live.jobId} className="bg-gray-900 border border-green-600/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-semibold text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Escaneo completado — <span className="font-mono text-green-300">{job.target}</span>
                    </p>
                    <span className="text-xs text-green-400 bg-green-900/20 px-2 py-0.5 rounded-full">COMPLETADO</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-white">{result.hosts}</p>
                      <p className="text-xs text-gray-500">Hosts activos</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-white">{result.ports}</p>
                      <p className="text-xs text-gray-500">Puertos abiertos</p>
                    </div>
                    <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-red-400">{result.vulns.length}</p>
                      <p className="text-xs text-gray-500">CVEs detectados</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {result.vulns.map((v, i) => (
                      <p key={i} className="text-xs text-red-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        {v}
                      </p>
                    ))}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* Tabla historial */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">Historial de Escaneos</h3>
          <span className="text-xs text-gray-500">{displayJobs.length} registros</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Target</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Tipo</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Estado</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Iniciado</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Completado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loadingReal ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">Cargando...</td></tr>
            ) : displayJobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  <Radio className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No hay escaneos. Haz clic en "Nuevo Escaneo" para comenzar.</p>
                </td>
              </tr>
            ) : (
              displayJobs.map((s) => {
                const style = STATUS_STYLE[s.status] ?? STATUS_STYLE['pending']
                return (
                  <tr key={s.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-white font-mono text-xs">{s.target}</td>
                    <td className="px-4 py-3 text-gray-400 capitalize">{s.scan_type}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${style.cls}`}>
                        {style.icon}
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {s.started_at ? new Date(s.started_at).toLocaleString('es-GT') : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {s.completed_at ? new Date(s.completed_at).toLocaleString('es-GT') : '—'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
