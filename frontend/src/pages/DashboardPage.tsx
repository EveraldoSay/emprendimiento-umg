import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts'
import { Shield, AlertTriangle, Server, Activity, CheckCircle, Zap } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useFeatureStore } from '@/store/featureStore'
import { PlanSwitcher } from '@/components/ui/PlanSwitcher'
import { DEMO_ENTITIES } from '@/api/mockData'
import type { DashboardMetrics } from '@/types'

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

function StatCard({ icon: Icon, label, value, color = 'blue', sublabel }: {
  icon: React.ElementType; label: string; value: number | string
  color?: 'blue' | 'red' | 'yellow' | 'green'; sublabel?: string
}) {
  const cm = { blue: 'text-blue-400 bg-blue-900/20', red: 'text-red-400 bg-red-900/20', yellow: 'text-yellow-400 bg-yellow-900/20', green: 'text-green-400 bg-green-900/20' }
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-400 text-sm">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cm[color]}`}><Icon className="w-4 h-4" /></div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sublabel && <p className="text-xs text-gray-500 mt-1">{sublabel}</p>}
    </div>
  )
}

export function DashboardPage() {
  const { activeEntityId } = useAuthStore()
  const { activePlan } = useFeatureStore()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)

  useEffect(() => {
    if (IS_DEMO && activeEntityId) {
      const entity = DEMO_ENTITIES.find((e) => e.id === activeEntityId)
      if (entity) setMetrics(entity.metrics as DashboardMetrics)
    } else {
      try {
        const raw = localStorage.getItem('demo_metrics')
        if (raw) setMetrics(JSON.parse(raw))
      } catch { /* usa null */ }
    }
  }, [activeEntityId])

  const entity = IS_DEMO && activeEntityId ? DEMO_ENTITIES.find((e) => e.id === activeEntityId) : null

  if (!metrics) return (
    <div className="flex items-center justify-center h-48 text-gray-500">Cargando métricas...</div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          {entity && (
            <p className="text-gray-500 text-sm mt-0.5">
              {entity.emoji} {entity.name} · <span className="text-gray-400">{entity.sector}</span>
            </p>
          )}
        </div>
        {entity && (
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
            activePlan === 'enterprise' ? 'bg-purple-900/40 text-purple-300 border border-purple-700/40' :
            activePlan === 'professional' ? 'bg-blue-900/40 text-blue-300 border border-blue-700/40' :
            'bg-gray-800 text-gray-400 border border-gray-700'
          }`}>
            {activePlan === 'enterprise' ? 'Plan Enterprise' : activePlan === 'professional' ? 'Plan Profesional' : 'Plan Básico'}
          </span>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Server}       label="Total Activos"        value={metrics.total_assets}              color="blue" />
        <StatCard icon={AlertTriangle} label="Vulnerabilidades Críticas" value={metrics.critical_vulnerabilities} color="red"    sublabel="Acción inmediata" />
        <StatCard icon={Shield}       label="Vulnerabilidades Altas"    value={metrics.high_vulnerabilities}      color="yellow" />
        <StatCard icon={Activity}     label="Abiertas"            value={metrics.open_vulnerabilities}       color="red" />
        <StatCard icon={CheckCircle}  label="Resueltas (30d)"     value={metrics.resolved_last_30d}          color="green" />
        <StatCard icon={Zap}          label="Escaneos Activos"    value={metrics.active_scans}               color="blue"   sublabel="En progreso" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Vulnerabilidades por Severidad</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={metrics.vulns_by_severity} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" nameKey="name">
                {metrics.vulns_by_severity.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-gray-400 text-xs">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Activos por Criticidad</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metrics.assets_by_criticality} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Escaneos (últimos 7 días)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics.scans_last_7d}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Panel de planes */}
      <PlanSwitcher />
    </div>
  )
}
