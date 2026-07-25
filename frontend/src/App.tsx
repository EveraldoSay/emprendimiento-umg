/**
 * Enrutamiento principal.
 * - GitHub Pages: usa HashRouter (#/) para evitar 404 en rutas anidadas.
 * - Vercel / local: usa BrowserRouter con URLs limpias.
 */

import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ui/ProtectedRoute'
import { LoginPage }        from '@/pages/LoginPage'
import { DashboardPage }    from '@/pages/DashboardPage'
import { AssetsPage }       from '@/pages/AssetsPage'
import { ScansPage }        from '@/pages/ScansPage'
import { VulnerabilitiesPage } from '@/pages/VulnerabilitiesPage'
import { ReportsPage }      from '@/pages/ReportsPage'
import { XDRPage }          from '@/pages/XDRPage'
import { AdminPage }        from '@/pages/AdminPage'
import { DemoHospitalPage } from '@/pages/DemoHospitalPage'
import { DemoGobiernoPage } from '@/pages/DemoGobiernoPage'

// GitHub Pages requiere hash routing; Vercel y local usan history API
const USE_HASH = import.meta.env.VITE_USE_HASH_ROUTER === 'true'
const Router = USE_HASH ? HashRouter : BrowserRouter

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard"            element={<DashboardPage />} />
      <Route path="/assets"               element={<AssetsPage />} />
      <Route path="/scans"                element={<ScansPage />} />
      <Route path="/vulnerabilities"      element={<VulnerabilitiesPage />} />
      <Route path="/reports"              element={<ReportsPage />} />
      <Route path="/xdr"                  element={<XDRPage />} />
      <Route path="/admin"                element={<AdminPage />} />
      <Route path="/demo/hospital"        element={<DemoHospitalPage />} />
      <Route path="/demo/gobierno"        element={<DemoGobiernoPage />} />
    </Route>

    <Route path="/"   element={<Navigate to="/dashboard" replace />} />
    <Route path="*"   element={<Navigate to="/dashboard" replace />} />
  </Routes>
)

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}
