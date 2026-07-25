import { useEffect, useState, type FormEvent } from 'react'
import { FileText, Download, Plus, CheckCircle } from 'lucide-react'
import { apiClient } from '@/api/client'
import type { Report, ReportStandard } from '@/types'

const STANDARD_LABELS: Record<ReportStandard, string> = {
  iso27001: 'ISO/IEC 27001',
  nist: 'NIST CSF',
  cis: 'CIS Controls v8',
  ley_gt: 'Ley Ciberseguridad GT',
}

export function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [standard, setStandard] = useState<ReportStandard>('iso27001')
  const [submitting, setSubmitting] = useState(false)

  const loadReports = () => {
    setLoading(true)
    apiClient
      .get('/reports/?limit=50')
      .then((res) => setReports(res.data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadReports() }, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await apiClient.post('/reports/', { title, standard, format: 'pdf' })
      setShowForm(false)
      setTitle('')
      loadReports()
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownload = (reportId: string) => {
    const token = localStorage.getItem('access_token')
    window.open(`/api/v1/reports/${reportId}/download`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Reportes</h1>
          <p className="text-gray-500 text-sm">Generación automática de evidencia para auditorías</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generar Reporte
        </button>
      </div>

      {/* Standards badges */}
      <div className="flex gap-2 flex-wrap">
        {(Object.entries(STANDARD_LABELS) as [ReportStandard, string][]).map(([std, label]) => (
          <span key={std} className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700">
            {label}
          </span>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-900 border border-blue-600/30 rounded-xl p-5">
          <form onSubmit={handleCreate} className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-48">
              <label className="block text-xs text-gray-400 mb-1">Título del reporte</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Auditoría Q4 2025"
                required
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Estándar</label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value as ReportStandard)}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                {(Object.entries(STANDARD_LABELS) as [ReportStandard, string][]).map(([std, label]) => (
                  <option key={std} value={std}>{label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {submitting ? 'Generando...' : 'Generar PDF'}
            </button>
          </form>
        </div>
      )}

      {/* Reports list */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Cargando reportes...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            No hay reportes generados
          </div>
        ) : (
          reports.map((r) => (
            <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{r.title}</p>
                  <p className="text-gray-500 text-xs">
                    {STANDARD_LABELS[r.standard]} · {r.format.toUpperCase()} ·{' '}
                    {new Date(r.created_at).toLocaleDateString('es-GT')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {r.signed && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    Firmado
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  r.status === 'ready' ? 'bg-green-900/20 text-green-400' :
                  r.status === 'generating' ? 'bg-blue-900/20 text-blue-400' :
                  r.status === 'failed' ? 'bg-red-900/20 text-red-400' :
                  'bg-gray-800 text-gray-400'
                }`}>
                  {r.status.toUpperCase()}
                </span>
                {r.status === 'ready' && (
                  <button
                    onClick={() => handleDownload(r.id)}
                    className="p-1.5 text-gray-400 hover:text-white transition-colors"
                    aria-label="Descargar reporte"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
