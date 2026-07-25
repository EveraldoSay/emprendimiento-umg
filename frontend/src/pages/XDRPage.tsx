import { useEffect } from 'react'
import { Activity, Wifi, WifiOff, Trash2 } from 'lucide-react'
import { useAlertStore } from '@/store/alertStore'
import { useAuthStore } from '@/store/authStore'

const SEVERITY_STYLE: Record<string, string> = {
  critical: 'bg-red-900/30 border-red-800/50 text-red-300',
  high: 'bg-orange-900/30 border-orange-800/50 text-orange-300',
  medium: 'bg-yellow-900/30 border-yellow-800/50 text-yellow-300',
  low: 'bg-green-900/30 border-green-800/50 text-green-300',
}

export function XDRPage() {
  const { alerts, wsStatus, connect, disconnect, clearAlerts } = useAlertStore()
  const { user } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token && wsStatus === 'disconnected') {
      connect(token)
    }
    return () => {
      disconnect()
    }
  }, [])

  const statusConfig = {
    connected: { icon: Wifi, label: 'Conectado', color: 'text-green-400' },
    connecting: { icon: Activity, label: 'Conectando...', color: 'text-yellow-400' },
    disconnected: { icon: WifiOff, label: 'Desconectado', color: 'text-gray-500' },
    error: { icon: WifiOff, label: 'Error de conexión', color: 'text-red-400' },
  }[wsStatus]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">XDR — Detección y Respuesta Extendida</h1>
          <p className="text-gray-500 text-sm">Alertas en tiempo real de endpoints, red e identidad</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-sm ${statusConfig.color}`}>
            <statusConfig.icon className="w-4 h-4" />
            {statusConfig.label}
          </div>
          <button
            onClick={clearAlerts}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-600"
          >
            <Trash2 className="w-3 h-3" />
            Limpiar
          </button>
        </div>
      </div>

      {/* Alerts feed */}
      {alerts.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Activity className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">Sin alertas activas. El sistema está monitoreando...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-xl p-4 flex items-start justify-between gap-4 ${SEVERITY_STYLE[alert.severity] ?? ''}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {alert.severity}
                  </span>
                  <span className="text-xs opacity-60">·</span>
                  <span className="text-xs opacity-60 capitalize">{alert.source}</span>
                </div>
                <p className="font-semibold text-sm">{alert.title}</p>
                <p className="text-xs opacity-75 mt-0.5">{alert.description}</p>
              </div>
              <div className="text-xs opacity-50 whitespace-nowrap">
                {new Date(alert.timestamp).toLocaleTimeString('es-GT')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
