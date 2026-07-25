import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Shield, Server, Radio, FileText,
  Activity, Settings, Zap, X, Menu,
} from 'lucide-react'
import { useFeatureStore } from '@/store/featureStore'
import { useAuthStore } from '@/store/authStore'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assets',          icon: Server,          label: 'Activos' },
  { to: '/scans',           icon: Radio,           label: 'Escaneos' },
  { to: '/vulnerabilities', icon: Shield,          label: 'Vulnerabilidades' },
  { to: '/reports',         icon: FileText,        label: 'Reportes' },
  { to: '/xdr',             icon: Activity,        label: 'XDR Alertas',    feature: 'xdr' as const },
  { to: '/admin',           icon: Settings,        label: 'Administración', roles: ['admin', 'superadmin'] },
]

function NavContent({ close }: { close: () => void }) {
  const { hasFeature, activePlan } = useFeatureStore()
  const { user } = useAuthStore()

  const planLabel = activePlan === 'enterprise' ? 'Enterprise' : activePlan === 'professional' ? 'Profesional' : 'Básico'
  const planColor = activePlan === 'enterprise' ? 'text-purple-400 bg-purple-900/20' : activePlan === 'professional' ? 'text-blue-400 bg-blue-900/20' : 'text-gray-400 bg-gray-800'

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">CyberSec AI</p>
            <p className="text-gray-500 text-xs">Plataforma Soberana</p>
          </div>
        </div>
        <button onClick={close} className="lg:hidden p-1 text-gray-500 hover:text-white" aria-label="Cerrar">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Plan badge */}
      <div className="px-4 py-2 border-b border-gray-800">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${planColor}`}>
          {planLabel}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          if (item.feature && !hasFeature(item.feature)) return null
          if (item.roles && user && !item.roles.includes(user.role)) return null
          return (
            <NavLink key={item.to} to={item.to} onClick={close}
              className={({ isActive }) =>
                clsx('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white')
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* Usuario */}
      {user && (
        <div className="px-4 py-3 border-t border-gray-800">
          <p className="text-white text-xs font-medium truncate">{user.full_name}</p>
          <p className="text-gray-500 text-xs truncate">{user.email}</p>
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Hamburguesa mobile */}
      <button onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 hover:text-white shadow-lg"
        aria-label="Abrir menú">
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {open && <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />}

      {/* Drawer mobile */}
      <aside className={clsx(
        'fixed top-0 left-0 h-full z-50 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 lg:hidden',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <NavContent close={() => setOpen(false)} />
      </aside>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex-shrink-0">
        <NavContent close={() => {}} />
      </aside>
    </>
  )
}
