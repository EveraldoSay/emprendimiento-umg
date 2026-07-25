import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts'
import { Shield, AlertTriangle, Server, Activity, CheckCircle, Zap } from 'lucide-react'
import { apiClient } from '@/api/client'
import type { DashboardMetrics, Vulnerability } from '@/types'

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
  info: '#6b7280',
}

function StatCard({
  icon: Icon, label, value, color = 'blue', sublabel
}: {
  icon: React.ElementType; label: string; value: number | string;
  color?: 'blue' | 'red' | 'yellow' | 'green'; sublabel?: string
}) {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-900/20',
    red: 'text-red-400 bg-red-900/20',
    yellow: 'text-yellow-400 bg-yellow-900/20',
    green: 'text-green-400 bg-green-900/20',
  }
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-400 text-sm">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sublabel && <p className="text-xs text-gray-500 mt-1">{sublabel}</p>}
    </div>
  )
}

// Mock data para cuando la API devuelva vacío
const MOCK_METRICS: DashboardMetrics = {
  total_assets: 48,
  critical_vulnerabilities: 7,
  high_vulnerabilities: 23,
  open_vulnerabilities: 64,
  resolved_last_30d: 31,
  active_scans: 2,
  assets_by_criticality: [
    { name: 'Alta', value: 12 },
    { name: 'Media', value: 26 },
    { name: 'Baja', value: 10 },
  ],
  vulns_by_severity: [
    { name: 'Crítica', value: 7, color: '#ef4444' },
    { name: 'Alta', value: 23, color: '#f97316' },
    { name: 'Media', value: 34, color: '#eab308' },
    { name: 'Baja', value: 18, color: '#22c55e' },
  ],
  scans_last_7d: [
    { date: 'Lun', count: 4 },
    { date: 'Mar', count: 7 },
    { date: 'Mié', count: 3 },
    { date: 'Jue', count: 9 },
    { date: 'Vie', count: 5 },
    { date: 'Sáb', count: 2 },
    { date: 'Dom', count: 6 },
  ],
}

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(MOCK_METRICS)
  const [recentVulns, setRecentVulns] = useState<Vulnerability[]>([])

  useEffect(() => {
    // Cargar vulnerabilidades recientes
    apiClient.get('/vulnerabilities/?limit=5&status=open')
      .then((res) => setRecentVulns(res.data.items ?? []))
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm">Vista general de seguridad operativa</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Server} label="Total Activos" value={metrics.total_assets} color="blue" />
        <StatCard icon={AlertTriangle} label="Vulnerabilidades Críticas" value={metrics.critical_vulnerabilities} color="red" sublabel="Acción inmediata" />
        <StatCard icon={Shield} label="Vulnerabilidades Altas" value={metrics.high_vulnerabilities} color="yellow" />
        <StatCard icon={Activity} label="Abiertas" value={metrics.open_vulnerabilities} color="red" />
        <StatCard icon={CheckCircle} label="Resueltas (30d)" value={metrics.resolved_last_30d} color="green" />
        <StatCard icon={Zap} label="Escaneos Activos" value={metrics.active_scans} color="blue" sublabel="En progreso" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vulns by severity */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Vulnerabilidades por Severidad</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={metrics.vulns_by_severity}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                dataKey="value"
                nameKey="name"
              >
                {metrics.vulns_by_severity.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-gray-400 text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Assets by criticality */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Activos por Criticidad</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metrics.assets_by_criticality} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scans last 7d */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Escaneos (últimos 7 días)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics.scans_last_7d}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Line type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent critical vulnerabilities */}
      {recentVulns.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold text-sm">Vulnerabilidades Abiertas Recientes</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {recentVulns.map((v) => (
              <div key={v.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{v.cve_id ?? v.title}</p>
                  <p className="text-gray-500 text-xs">{v.asset_name}</p>
                </div>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    color: SEVERITY_COLORS[v.severity],
                    background: `${SEVERITY_COLORS[v.severity]}20`,
                  }}
                >
                  {v.severity.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
