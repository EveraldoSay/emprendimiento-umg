/**
 * Sidebar con módulos controlados por plan.
 *
 * Básico:       Escaneo · Dashboard · Reportes
 * Profesional:  + Evaluación Riesgos · ISO 27001 · Activos · Monitoreo
 * Enterprise:   + IA Predictiva · SOC/XDR · SIEM · Incidentes · Administración
 */

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Shield, Server, Radio, FileText,
  Activity, Settings, Zap, X, Menu, AlertTriangle,
  CheckCircle, Brain, MonitorCheck, Database,
} from 'lucide-react'
import { useFeatureStore, PLAN_META } from '@/store/featureStore'
import { useAuthStore } from '@/store/authStore'
import clsx from 'clsx'

// Secciones del sidebar por plan
const NAV_SECTIONS = [
  {
    label: 'Básico',
    items: [
      { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',               feature: 'dashboard'     },
      { to: '/scans',      icon: Radio,           label: 'Escaneo Vulnerabilidades', feature: 'scanning'      },
      { to: '/reports',    icon: FileText,        label: 'Reportes',                feature: 'basic_reports' },
    ],
  },
  {
    label: 'Profesional',
    items: [
      { to: '/vulnerabilities', icon: AlertTriangle, label: 'Evaluación de Riesgos',   feature: 'risk_assessment'     },
      { to: '/compliance',      icon: CheckCircle,   label: 'Cumplimiento ISO 27001',   feature: 'iso27001_compliance' },
      { to: '/assets',          icon: Server,        label: 'Gestión de Activos',       feature: 'asset_management'    },
      { to: '/monitoring',      icon: MonitorCheck,  label: 'Monitoreo',                feature: 'monitoring'          },
    ],
  },
  {
    label: 'Enterprise',
    items: [
      { to: '/ai',       icon: Brain,    label: 'IA Predictiva',          feature: 'ai_remediation'  },
      { to: '/xdr',      icon: Activity, label: 'SOC Virtual — XDR',      feature: 'xdr'             },
      { to: '/siem',     icon: Database, label: 'SIEM Integrado',         feature: 'auto_remediation'},
      { to: '/incidents',icon: Shield,   label: 'Gestión de Incidentes',  feature: 'dedicated_infra' },
      { to: '/admin',    icon: Settings, label: 'Respuesta Automatizada', feature: 'dedicated_infra', roles: ['admin', 'superadmin'] },
    ],
  },
]

function NavContent({ close }: { close: () => void }) {
  const { hasFeature, activePlan } = useFeatureStore()
  const { user } = useAuthStore()
  const meta = PLAN_META[activePlan]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-none">CyberSec AI</p>
            <p className="text-gray-500 text-xs">Plataforma Soberana</p>
          </div>
        </div>
        <button onClick={close} className="lg:hidden p-1 text-gray-500 hover:text-white flex-shrink-0" aria-label="Cerrar">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Módulos por sección */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {NAV_SECTIONS.map((section) => {
          // Filtrar ítems habilitados
          const visibleItems = section.items.filter((item) => {
            if (!hasFeature(item.feature as never)) return false
            if (item.roles && user && !item.roles.includes(user.role)) return false
            return true
          })

          if (visibleItems.length === 0) return null

          return (
            <div key={section.label}>
              <p className="px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                {section.label}
              </p>
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={close}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                    )
                  }
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          )
        })}

        {/* Módulos bloqueados (grises) */}
        {NAV_SECTIONS.map((section) => {
          const lockedItems = section.items.filter((item) => !hasFeature(item.feature as never))
          if (lockedItems.length === 0) return null
          return lockedItems.map((item) => (
            <div key={item.to}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 cursor-not-allowed select-none"
              title={`Requiere ${section.label === 'Profesional' ? 'Plan Profesional' : 'Plan Enterprise'}`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0 opacity-40" />
              <span className="truncate opacity-40">{item.label}</span>
              <span className="ml-auto text-xs opacity-40 flex-shrink-0">
                {section.label === 'Profesional' ? 'Pro' : 'Ent'}
              </span>
            </div>
          ))
        })}
      </nav>

      {/* Plan activo + usuario */}
      <div className="px-3 pb-3 border-t border-gray-800 pt-3 flex-shrink-0 space-y-2">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${meta.badgeCls}`}>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dotCls}`} />
          <span className="text-xs font-semibold truncate">{meta.name}</span>
        </div>
        {user && (
          <div className="px-3">
            <p className="text-white text-xs font-medium truncate">{user.full_name}</p>
            <p className="text-gray-600 text-xs truncate">{user.email}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Hamburguesa mobile */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 hover:text-white shadow-lg"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />
      )}

      {/* Drawer mobile */}
      <aside className={clsx(
        'fixed top-0 left-0 h-full z-50 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 lg:hidden',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>
        <NavContent close={() => setOpen(false)} />
      </aside>

      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex-shrink-0">
        <NavContent close={() => {}} />
      </aside>
    </>
  )
}
