// ==============================================================
// CyberSec AI Platform — TypeScript Interfaces
// ==============================================================

// --- Auth ---

export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'analyst' | 'viewer' | 'auditor' | 'superadmin'
  organization_id: string
  mfa_enabled: boolean
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
}

export interface Session {
  session_id: string
  user_email: string
  ip_address: string
  user_agent: string
  expires_at: string
}

// --- Organization ---

export type Sector = 'hospital' | 'gobierno' | 'banca' | 'pyme' | 'otro'
export type Plan = 'standard' | 'premium' | 'enterprise'

export interface Organization {
  id: string
  name: string
  sector: Sector
  plan: Plan
  is_active: boolean
  created_at: string
}

// --- Assets ---

export type AssetType = 'server' | 'vm' | 'container' | 'endpoint' | 'cloud_service' | 'network_device'
export type Criticality = 'alta' | 'media' | 'baja'

export interface Asset {
  id: string
  name: string
  asset_type: AssetType
  ip_address: string | null
  hostname: string | null
  operating_system: string | null
  criticality: Criticality
  sector_tag: string | null
  description: string | null
  is_active: boolean
  last_scanned: string | null
  created_at: string
}

export interface AssetCreate {
  name: string
  asset_type: AssetType
  ip_address?: string
  hostname?: string
  operating_system?: string
  criticality?: Criticality
  sector_tag?: string
  description?: string
}

// --- Scan Jobs ---

export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type ScanType = 'quick' | 'full' | 'scheduled' | 'stealth'

export interface ScanJob {
  id: string
  target: string
  scan_type: ScanType
  status: ScanStatus
  celery_task_id: string | null
  asset_id: string | null
  started_at: string | null
  completed_at: string | null
  error_message: string | null
  created_at: string
}

// --- Vulnerabilities ---

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type VulnStatus = 'open' | 'in_remediation' | 'resolved' | 'accepted'

export interface Vulnerability {
  id: string
  asset_id: string
  asset_name: string
  cve_id: string | null
  title: string
  description: string
  severity: Severity
  cvss_score: number | null
  cvss_vector: string | null
  affected_component: string | null
  status: VulnStatus
  discovered_at: string
  resolved_at: string | null
}

// --- AI Suggestions ---

export type RemediationMode = 'technical' | 'explain'

export interface TechnicalSuggestion {
  severity_assessment: string
  immediate_actions: string[]
  remediation_steps: string[]
  references: string[]
  estimated_effort: string
  verification_steps: string[]
}

export interface ExplainSuggestion {
  business_risk: string
  what_happened: string
  what_to_do: string[]
  urgency: 'Inmediata' | 'Esta semana' | 'Este mes'
  who_should_act: string
}

export interface AISuggestion {
  id: string
  vulnerability_id: string
  model_used: string
  mode: RemediationMode
  suggestion: TechnicalSuggestion | ExplainSuggestion
  created_at: string
}

// --- Reports ---

export type ReportStandard = 'iso27001' | 'nist' | 'cis' | 'ley_gt'
export type ReportFormat = 'pdf' | 'csv' | 'json'
export type ReportStatus = 'pending' | 'generating' | 'ready' | 'failed'

export interface Report {
  id: string
  title: string
  standard: ReportStandard
  format: ReportFormat
  status: ReportStatus
  signed: boolean
  file_path: string | null
  created_at: string
}

// --- Feature Flags ---

export type FeatureName =
  | 'scanning'
  | 'dashboard'
  | 'basic_reports'
  | 'risk_assessment'
  | 'iso27001_compliance'
  | 'asset_management'
  | 'monitoring'
  | 'ai_remediation'
  | 'xdr'
  | 'auto_remediation'
  | 'dedicated_infra'
  | 'advanced_compliance'

export type FeatureFlags = Record<FeatureName, boolean>

// --- XDR Alerts ---

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'
export type AlertSource = 'endpoint' | 'network' | 'identity'

export interface XDRAlert {
  id: string
  type: 'alert'
  severity: AlertSeverity
  title: string
  source: AlertSource
  asset_id?: string
  description: string
  timestamp: string
}

// --- Pagination ---

export interface PaginatedResponse<T> {
  total: number
  items: T[]
}

// --- Dashboard Metrics ---

export interface DashboardMetrics {
  total_assets: number
  critical_vulnerabilities: number
  high_vulnerabilities: number
  open_vulnerabilities: number
  resolved_last_30d: number
  active_scans: number
  assets_by_criticality: { name: string; value: number }[]
  vulns_by_severity: { name: string; value: number; color: string }[]
  scans_last_7d: { date: string; count: number }[]
}
