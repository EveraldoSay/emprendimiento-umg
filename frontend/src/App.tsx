import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute }      from '@/components/ui/ProtectedRoute'
import { LoginPage }           from '@/pages/LoginPage'
import { DashboardPage }       from '@/pages/DashboardPage'
import { AssetsPage }          from '@/pages/AssetsPage'
import { ScansPage }           from '@/pages/ScansPage'
import { VulnerabilitiesPage } from '@/pages/VulnerabilitiesPage'
import { ReportsPage }         from '@/pages/ReportsPage'
import { XDRPage }             from '@/pages/XDRPage'
import { AdminPage }           from '@/pages/AdminPage'
import { MonitoringPage }      from '@/pages/MonitoringPage'
import { AIPage }              from '@/pages/AIPage'
import { SIEMPage }            from '@/pages/SIEMPage'
import { IncidentsPage }       from '@/pages/IncidentsPage'
import { CompliancePage }      from '@/pages/CompliancePage'

const USE_HASH = import.meta.env.VITE_USE_HASH_ROUTER === 'true'
const Router   = USE_HASH ? HashRouter : BrowserRouter

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          {/* ── Plan Básico ── */}
          <Route path="/dashboard"      element={<DashboardPage />} />
          <Route path="/scans"          element={<ScansPage />} />
          <Route path="/assets"         element={<AssetsPage />} />
          <Route path="/reports"        element={<ReportsPage />} />

          {/* ── Plan Profesional ── */}
          <Route path="/vulnerabilities" element={<VulnerabilitiesPage />} />
          <Route path="/compliance"      element={<CompliancePage />} />
          <Route path="/monitoring"      element={<MonitoringPage />} />

          {/* ── Plan Enterprise ── */}
          <Route path="/ai"        element={<AIPage />} />
          <Route path="/xdr"       element={<XDRPage />} />
          <Route path="/siem"      element={<SIEMPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/admin"     element={<AdminPage />} />
        </Route>

        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}
