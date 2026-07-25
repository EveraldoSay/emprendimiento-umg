import { useEffect, useState } from 'react'
import { Server, Plus, ExternalLink } from 'lucide-react'
import { apiClient } from '@/api/client'
import { useNavigate } from 'react-router-dom'
import type { Asset, Criticality } from '@/types'

const CRITICALITY_STYLE: Record<Criticality, string> = {
  alta: 'text-red-400 bg-red-900/20',
  media: 'text-yellow-400 bg-yellow-900/20',
  baja: 'text-green-400 bg-green-900/20',
}

export function AssetsPage() {
  const navigate = useNavigate()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .get('/assets/?limit=100')
      .then((res) => setAssets(res.data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Inventario de Activos</h1>
          <p className="text-gray-500 text-sm">{assets.length} activos registrados</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Agregar Activo
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 border-b border-gray-800">
            <tr>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Nombre</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Tipo</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">IP / Host</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">OS</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Criticidad</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Último Escaneo</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">Cargando activos...</td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  <Server className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Sin activos registrados. Ejecuta un escaneo para descubrirlos.
                </td>
              </tr>
            ) : (
              assets.map((a) => (
                <tr key={a.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{a.name}</td>
                  <td className="px-4 py-3 text-gray-400 capitalize">{a.asset_type.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                    {a.ip_address ?? a.hostname ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{a.operating_system ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CRITICALITY_STYLE[a.criticality]}`}>
                      {a.criticality.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {a.last_scanned ? new Date(a.last_scanned).toLocaleDateString('es-GT') : 'Nunca'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/assets/${a.id}`)}
                      className="text-gray-500 hover:text-blue-400 transition-colors"
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
