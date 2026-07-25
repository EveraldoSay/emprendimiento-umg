import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Shield, Server, Radio, FileText,
  Activity, Settings, Zap, ChevronRight, X, Menu,
} from 'lucide-react'
import { useFeatureStore } from '@/store/featureStore'
import { useAuthStore } from '@/store/authStore'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assets',          icon: Server,          label: 'Activos' },
  { to: '/scans',           icon: Radio,           label: 'Escaneos' },
  { to: '/vulnerabilities', icon: Shield,          label: 'Vulnerabilidades' },
  { to: '/reports',         icon: FileText,        label: 'Reportes',        roles: ['admin', 'auditor', 'superadmin'] },
  { to: '/xdr',             icon: Activity,        label: 'XDR Alertas',     feature: 'xdr' as const },
  { to: '/admin',           icon: Settings,        label: 'Administración',  roles: ['admin', 'superadmin'] },
]

export function Sidebar() {
  const { hasFeature } = useFeatureStore()
  const { user } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const close = () => setMobileOpen(false)

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo + close button (mobile) */}
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
        {/* Botón cerrar — solo mobile */}
        <button
          onClick={close}
          className="lg:hidden p-1 text-gray-500 hover:text-white transition-colors"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.feature && !hasFeature(item.feature)) return null
          if (item.roles && user && !item.roles.includes(user.role)) return null
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={close}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                )
              }
            >
              <span className="flex items-center gap-3">
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          )
        })}
      </nav>

      {/* Demo environments */}
      <div className="px-3 pb-4 border-t border-gray-800 pt-4 space-y-1">
        <p className="text-xs text-gray-600 px-3 pb-1 uppercase tracking-wider">Demo</p>
        <NavLink to="/demo/hospital" onClick={close}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-800 hover:text-white transition-colors">
          🏥 Sector Hospital
        </NavLink>
        <NavLink to="/demo/gobierno" onClick={close}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-800 hover:text-white transition-colors">
          🏛️ Sector Gobierno
        </NavLink>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Botón hamburguesa (solo mobile/tablet) ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors shadow-lg"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Overlay oscuro (mobile) ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* ── Sidebar mobile (drawer) ── */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full z-50 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {content}
      </aside>

      {/* ── Sidebar desktop (fijo) ── */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex-shrink-0">
        {content}
      </aside>
    </>
  )
}
