import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute }       from '@/components/ui/ProtectedRoute'
import { LoginPage }            from '@/pages/LoginPage'
import { DashboardPage }        from '@/pages/DashboardPage'
import { AssetsPage }           from '@/pages/AssetsPage'
import { ScansPage }            from '@/pages/ScansPage'
import { VulnerabilitiesPage }  from '@/pages/VulnerabilitiesPage'
import { ReportsPage }          from '@/pages/ReportsPage'
import { XDRPage }              from '@/pages/XDRPage'
import { AdminPage }            from '@/pages/AdminPage'
import { PlaceholderPage }      from '@/pages/PlaceholderPage'
import {
  CheckCircle, MonitorCheck, Brain, Database, Shield, Activity,
} from 'lucide-react'

const USE_HASH = import.meta.env.VITE_USE_HASH_ROUTER === 'true'
const Router   = USE_HASH ? HashRouter : BrowserRouter

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          {/* Básico */}
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/scans"      element={<ScansPage />} />
          <Route path="/reports"    element={<ReportsPage />} />

          {/* Profesional */}
          <Route path="/vulnerabilities" element={<VulnerabilitiesPage />} />
          <Route path="/compliance" element={
            <PlaceholderPage
              title="Cumplimiento ISO 27001"
              description="Evaluación de controles y gap analysis según ISO/IEC 27001:2022"
              icon={<CheckCircle className="w-5 h-5" />}
              requiredPlan="professional"
              content={<ReportsPage />}
            />
          } />
          <Route path="/assets"     element={<AssetsPage />} />
          <Route path="/monitoring" element={
            <PlaceholderPage
              title="Monitoreo Continuo"
              description="Vigilancia 24/7 de activos y servicios críticos"
              icon={<MonitorCheck className="w-5 h-5" />}
              requiredPlan="professional"
            />
          } />

          {/* Enterprise */}
          <Route path="/ai" element={
            <PlaceholderPage
              title="IA Predictiva"
              description="Motor de remediación con LLM local (Ollama — Llama 3 / Mistral)"
              icon={<Brain className="w-5 h-5" />}
              requiredPlan="enterprise"
            />
          } />
          <Route path="/xdr"      element={<XDRPage />} />
          <Route path="/siem"     element={
            <PlaceholderPage
              title="SIEM Integrado"
              description="Correlación de eventos y gestión de logs centralizada"
              icon={<Database className="w-5 h-5" />}
              requiredPlan="enterprise"
            />
          } />
          <Route path="/incidents" element={
            <PlaceholderPage
              title="Gestión de Incidentes"
              description="Ciclo de vida completo de incidentes de seguridad"
              icon={<Shield className="w-5 h-5" />}
              requiredPlan="enterprise"
            />
          } />
          <Route path="/admin"    element={<AdminPage />} />
        </Route>

        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}
