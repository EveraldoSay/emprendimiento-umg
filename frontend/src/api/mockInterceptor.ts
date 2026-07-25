/**
 * Interceptor Axios para modo demo offline.
 * Cuando VITE_DEMO_MODE=true, intercepta todas las llamadas a /api/v1/*
 * y retorna datos mock sin tocar ningún servidor.
 */

import type { AxiosInstance, AxiosResponse } from 'axios'
import {
  MOCK_ASSETS, MOCK_ASSETS_USAC, MOCK_VULNERABILITIES,
  MOCK_SCANS, MOCK_REPORTS, MOCK_XDR_ALERTS, MOCK_DASHBOARD_METRICS,
} from './mockData'

function mockResponse<T>(data: T, status = 200): Partial<AxiosResponse<T>> {
  return { data, status, statusText: 'OK', headers: {}, config: {} as never }
}

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** Detecta qué assets usar según org del usuario en localStorage */
function currentAssets() {
  try {
    const raw = localStorage.getItem('demo_user')
    if (!raw) return MOCK_ASSETS
    const user = JSON.parse(raw)
    return user.organization_id === 'org-usac' ? MOCK_ASSETS_USAC : MOCK_ASSETS
  } catch {
    return MOCK_ASSETS
  }
}

function currentVulns() {
  const assets = currentAssets()
  const ids = new Set(assets.map((a) => a.id))
  return MOCK_VULNERABILITIES.filter((v) => ids.has(v.asset_id))
}

export function setupMockInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use(async (config) => {
    const url = config.url ?? ''
    await delay(280)

    // ── Auth ─────────────────────────────────────────────────────────────────
    if (url.includes('/auth/me')) {
      const raw = localStorage.getItem('demo_user')
      const user = raw ? JSON.parse(raw) : { id: 'u1', email: 'demo@umg.edu.gt', full_name: 'Demo', role: 'admin', organization_id: 'org-umg', mfa_enabled: true }
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse(user) })
    }

    // ── Assets ───────────────────────────────────────────────────────────────
    if (url.includes('/assets/') && url.match(/\/assets\/[^/]+\/vulnerabilities/)) {
      const assetId = url.split('/assets/')[1].split('/')[0]
      const items = MOCK_VULNERABILITIES.filter((v) => v.asset_id === assetId)
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ total: items.length, items }) })
    }
    if (url.includes('/assets/') && !url.endsWith('/assets/')) {
      const assetId = url.split('/assets/')[1]?.replace(/\/$/, '')
      const asset = currentAssets().find((a) => a.id === assetId)
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse(asset ?? null) })
    }
    if (url.includes('/assets')) {
      const items = currentAssets()
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ total: items.length, items }) })
    }

    // ── Vulnerabilities ──────────────────────────────────────────────────────
    if (url.match(/\/vulnerabilities\/[^/]+\/remediate/)) {
      const suggestion = {
        id: 'sg-' + Date.now(),
        vulnerability_id: url.split('/vulnerabilities/')[1].split('/')[0],
        model_used: 'llama3',
        mode: url.includes('explain') ? 'explain' : 'technical',
        suggestion: {
          severity_assessment: 'Vulnerabilidad de alto impacto que requiere acción inmediata. Explotación activa confirmada en el ecosistema.',
          immediate_actions: [
            'Aislar el sistema afectado de la red de producción',
            'Activar el playbook de respuesta a incidentes',
            'Notificar al equipo de seguridad y dirección de TI',
          ],
          remediation_steps: [
            'Actualizar el componente afectado a la versión parcheada más reciente',
            'Aplicar regla de WAF para bloquear vectores de explotación conocidos',
            'Revisar logs de los últimos 30 días en busca de indicadores de compromiso',
            'Ejecutar escaneo de integridad de archivos del sistema',
            'Cambiar todas las credenciales de servicio del sistema afectado',
          ],
          references: ['https://nvd.nist.gov/vuln/detail/' + (url.includes('CVE') ? 'CVE' : 'CVE-2021-44228'), 'https://attack.mitre.org/techniques/T1190/'],
          estimated_effort: '4-8 horas',
          verification_steps: ['Ejecutar nuevo escaneo tras aplicar parche', 'Confirmar que el CVE ya no aparece en resultados'],
        },
        created_at: new Date().toISOString(),
      }
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse(suggestion) })
    }
    if (url.match(/\/vulnerabilities\/[^/]+\/suggestions/)) {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ vulnerability_id: '', total: 0, items: [] }) })
    }
    if (url.match(/\/vulnerabilities\/[^/]+\/status/)) {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ status: 'updated' }) })
    }
    if (url.match(/\/vulnerabilities\/[^/]+$/) && config.method === 'get') {
      const vulnId = url.split('/vulnerabilities/')[1]?.replace(/\/$/, '')
      const vuln = MOCK_VULNERABILITIES.find((v) => v.id === vulnId)
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse(vuln ?? null) })
    }
    if (url.includes('/vulnerabilities')) {
      const items = currentVulns()
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ total: items.length, items }) })
    }

    // ── Scans ────────────────────────────────────────────────────────────────
    if (config.method === 'post' && url.includes('/scans/') && url.includes('/cancel')) {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ message: 'Escaneo cancelado' }) })
    }
    if (config.method === 'post' && url.endsWith('/scans/')) {
      const newScan = { id: 's-' + Date.now(), target: (config.data ? JSON.parse(config.data as string).target : '0.0.0.0'), scan_type: 'quick', status: 'pending', celery_task_id: null, asset_id: null, started_at: null, completed_at: null, error_message: null, created_at: new Date().toISOString() }
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ message: 'Escaneo iniciado', scan_job: newScan }, 202) })
    }
    if (url.includes('/scans')) {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ total: MOCK_SCANS.length, items: MOCK_SCANS }) })
    }

    // ── Reports ──────────────────────────────────────────────────────────────
    if (config.method === 'post' && url.includes('/reports/') && url.includes('/sign')) {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ message: 'Reporte firmado' }) })
    }
    if (url.match(/\/reports\/[^/]+\/download/)) {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ message: 'En modo demo el PDF se genera en servidor real' }) })
    }
    if (config.method === 'post' && url.endsWith('/reports/')) {
      const newReport = { id: 'r-' + Date.now(), title: 'Reporte Demo', standard: 'iso27001', format: 'pdf', status: 'ready', signed: false, file_path: null, created_at: new Date().toISOString() }
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ message: 'Generando reporte', report: newReport }, 202) })
    }
    if (url.includes('/reports')) {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ total: MOCK_REPORTS.length, items: MOCK_REPORTS }) })
    }

    // ── Admin / Feature Flags ────────────────────────────────────────────────
    if (url.includes('/admin/feature-flags') && config.method === 'patch') {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ feature: 'updated', enabled: true }) })
    }
    if (url.includes('/admin/feature-flags')) {
      const orgId = localStorage.getItem('demo_user') ? JSON.parse(localStorage.getItem('demo_user')!).organization_id : 'org-umg'
      const isPremium = orgId === 'org-umg'
      throw Object.assign(new Error('mock'), {
        isMock: true,
        response: mockResponse({
          organization_id: orgId,
          flags: { ai_remediation: isPremium, xdr: isPremium, auto_remediation: isPremium, dedicated_infra: false, advanced_compliance: false },
        }),
      })
    }
    if (url.includes('/admin/audit-logs')) {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ total: 0, items: [] }) })
    }

    return config
  })

  // Interceptor de respuesta: captura los "errores" mock y los retorna como éxito
  client.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error?.isMock && error?.response) {
        return Promise.resolve(error.response as AxiosResponse)
      }
      return Promise.reject(error)
    },
  )
}
