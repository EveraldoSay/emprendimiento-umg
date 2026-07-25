import { useEffect, useState } from 'react'
import { Shield, ExternalLink, Filter } from 'lucide-react'
import { apiClient } from '@/api/client'
import { useNavigate } from 'react-router-dom'
import type { Vulnerability, Severity, VulnStatus } from '@/types'

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: 'text-red-400 bg-red-900/20',
  high: 'text-orange-400 bg-orange-900/20',
  medium: 'text-yellow-400 bg-yellow-900/20',
  low: 'text-green-400 bg-green-900/20',
  info: 'text-gray-400 bg-gray-800',
}

export function VulnerabilitiesPage() {
  const navigate = useNavigate()
  const [vulns, setVulns] = useState<Vulnerability[]>([])
  const [loading, setLoading] = useState(true)
  const [severity, setSeverity] = useState<Severity | ''>('')
  const [vulnStatus, setVulnStatus] = useState<VulnStatus | ''>('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (severity) params.set('severity', severity)
    if (vulnStatus) params.set('status', vulnStatus)

    apiClient
      .get(`/vulnerabilities/?${params.toString()}&limit=100`)
      .then((res) => setVulns(res.data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [severity, vulnStatus])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Vulnerabilidades</h1>
          <p className="text-gray-500 text-sm">{vulns.length} registros encontrados</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filtrar:</span>
        </div>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as Severity | '')}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="">Todas las severidades</option>
          <option value="critical">Crítica</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
        <select
          value={vulnStatus}
          onChange={(e) => setVulnStatus(e.target.value as VulnStatus | '')}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="open">Abierta</option>
          <option value="in_remediation">En remediación</option>
          <option value="resolved">Resuelta</option>
          <option value="accepted">Aceptada</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 border-b border-gray-800">
            <tr>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">CVE / Título</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Activo</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Severidad</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">CVSS</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Estado</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Detectada</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">Cargando...</td>
              </tr>
            ) : vulns.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Sin vulnerabilidades que coincidan
                </td>
              </tr>
            ) : (
              vulns.map((v) => (
                <tr key={v.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{v.cve_id ?? '—'}</p>
                    <p className="text-gray-500 text-xs truncate max-w-xs">{v.title}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{v.asset_name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEVERITY_COLORS[v.severity]}`}>
                      {v.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {v.cvss_score !== null ? v.cvss_score.toFixed(1) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400 capitalize">{v.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(v.discovered_at).toLocaleDateString('es-GT')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/vulnerabilities/${v.id}`)}
                      className="text-gray-500 hover:text-blue-400 transition-colors"
                      aria-label="Ver detalle"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
