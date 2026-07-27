import { Bell, LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAlertStore } from '@/store/alertStore'
import { useFeatureStore, PLAN_META } from '@/store/featureStore'
import { useNavigate } from 'react-router-dom'

export function Navbar() {
  const { user, logout }   = useAuthStore()
  const { alerts }         = useAlertStore()
  const { activePlan }     = useFeatureStore()
  const navigate           = useNavigate()

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length
  const meta = PLAN_META[activePlan]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">

      {/* Espacio botón hamburguesa mobile */}
      <div className="w-8 lg:hidden" />

      {/* Plan badge — visible en todos los tamaños */}
      <div className="flex-1 flex items-center">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${meta.badgeCls} hidden sm:inline-flex items-center gap-1.5`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dotCls}`} />
          {meta.name}
        </span>
        {/* Solo punto en mobile */}
        <span className={`sm:hidden w-2 h-2 rounded-full ${meta.dotCls}`} title={meta.name} />
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">

        {/* Campanita con conteo */}
        <button
          onClick={() => navigate('/xdr')}
          className="relative p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Ver alertas XDR"
        >
          <Bell className="w-5 h-5" />
          {criticalCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>

        {/* Usuario */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-3 h-3 text-white" />
          </div>
          <div className="hidden md:block leading-none">
            <p className="text-white text-xs font-medium">{user?.full_name || user?.email}</p>
            <p className="text-gray-500 text-xs capitalize">{user?.role}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
