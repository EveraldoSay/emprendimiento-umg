/**
 * Interceptor Axios para modo demo offline.
 * Lee los datos de la entidad activa desde localStorage.
 */

import type { AxiosInstance, AxiosResponse } from 'axios'
import { MOCK_SCANS, MOCK_REPORTS } from './mockData'

function mockResponse<T>(data: T, status = 200): Partial<AxiosResponse<T>> {
  return { data, status, statusText: 'OK', headers: {}, config: {} as never }
}

function delay(ms = 280): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function getAssets() {
  try { return JSON.parse(localStorage.getItem('demo_assets') ?? '[]') } catch { return [] }
}
function getVulns() {
  try { return JSON.parse(localStorage.getItem('demo_vulns') ?? '[]') } catch { return [] }
}
function getUser() {
  try { return JSON.parse(localStorage.getItem('demo_user') ?? 'null') } catch { return null }
}

export function setupMockInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use(async (config) => {
    const url = config.url ?? ''
    await delay(260)

    // Auth/me
    if (url.includes('/auth/me')) {
      const user = getUser()
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse(user) })
    }

    // Assets + vulns del asset
    if (url.match(/\/assets\/[^/]+\/vulnerabilities/)) {
      const assetId = url.split('/assets/')[1].split('/')[0]
      const items = getVulns().filter((v: { asset_id: string }) => v.asset_id === assetId)
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ total: items.length, items }) })
    }
    if (url.match(/\/assets\/[^/?]+$/) && config.method === 'get') {
      const assetId = url.split('/assets/')[1]?.replace(/\/$/, '')
      const asset = getAssets().find((a: { id: string }) => a.id === assetId) ?? null
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse(asset) })
    }
    if (config.method === 'post' && (url.endsWith('/assets/') || url.endsWith('/assets'))) {
      const body = config.data ? JSON.parse(config.data as string) : {}
      const newAsset = { id: 'a-' + Date.now(), ...body, is_active: true, last_scanned: null, created_at: new Date().toISOString() }
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse(newAsset, 201) })
    }
    if (url.includes('/assets')) {
      const items = getAssets()
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ total: items.length, items }) })
    }

    // Vulnerabilities
    if (url.match(/\/vulnerabilities\/[^/]+\/remediate/)) {
      const suggestion = {
        id: 'sg-' + Date.now(),
        vulnerability_id: url.split('/vulnerabilities/')[1].split('/')[0],
        model_used: 'llama3:8b',
        mode: 'technical',
        suggestion: {
          severity_assessment: 'Vulnerabilidad de alto impacto que permite ejecución remota de código. Explotación activa confirmada por CISA y múltiples CERTs internacionales. Requiere acción inmediata.',
          immediate_actions: [
            'Aislar el sistema afectado de la red de producción inmediatamente',
            'Activar el playbook de respuesta a incidentes (IRP)',
            'Notificar al equipo de seguridad, CISO y dirección de TI',
            'Preservar evidencia forense (logs, memory dump)',
          ],
          remediation_steps: [
            'Actualizar el componente afectado a la última versión parcheada disponible',
            'Aplicar regla de WAF para bloquear vectores de explotación conocidos (OWASP Rule ID)',
            'Revisar logs de acceso de los últimos 30 días en busca de IoCs',
            'Ejecutar análisis de integridad de archivos del sistema (FIM)',
            'Cambiar todas las credenciales de servicio y rotarlas cada 90 días',
            'Implementar segmentación de red adicional para el asset afectado',
          ],
          references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-44228', 'https://attack.mitre.org/techniques/T1190/', 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog'],
          estimated_effort: '4-8 horas con equipo de 2 ingenieros',
          verification_steps: ['Ejecutar escaneo completo tras aplicar parche', 'Confirmar que el CVE ya no aparece como activo', 'Validar que los logs muestren bloqueo de intentos de explotación'],
        },
        created_at: new Date().toISOString(),
      }
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse(suggestion) })
    }
    if (url.match(/\/vulnerabilities\/[^/]+\/suggestions/)) {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ total: 0, items: [] }) })
    }
    if (url.match(/\/vulnerabilities\/[^/]+\/status/) && config.method === 'patch') {
      const body = config.data ? JSON.parse(config.data as string) : {}
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ status: body.status ?? 'updated' }) })
    }
    if (url.match(/\/vulnerabilities\/[^/?]+$/) && config.method === 'get') {
      const vulnId = url.split('/vulnerabilities/')[1]?.replace(/\/$/, '')
      const vuln = getVulns().find((v: { id: string }) => v.id === vulnId) ?? null
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse(vuln) })
    }
    if (url.includes('/vulnerabilities')) {
      const items = getVulns()
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ total: items.length, items }) })
    }

    // Scans
    if (config.method === 'post' && url.match(/\/scans\/[^/]+\/cancel/)) {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ message: 'Escaneo cancelado' }) })
    }
    if (config.method === 'post' && (url.endsWith('/scans/') || url.endsWith('/scans'))) {
      const body = config.data ? JSON.parse(config.data as string) : {}
      const newScan = { id: 's-' + Date.now(), target: body.target ?? '0.0.0.0', scan_type: body.scan_type ?? 'quick', status: 'pending', celery_task_id: null, asset_id: null, started_at: new Date().toISOString(), completed_at: null, error_message: null, created_at: new Date().toISOString() }
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ message: 'Escaneo iniciado', scan_job: newScan }, 202) })
    }
    if (url.includes('/scans')) {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ total: MOCK_SCANS.length, items: MOCK_SCANS }) })
    }

    // Reports
    if (config.method === 'post' && url.match(/\/reports\/[^/]+\/sign/)) {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ message: 'Reporte firmado' }) })
    }
    if (url.match(/\/reports\/[^/]+\/download/)) {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ message: 'PDF disponible en modo backend completo' }) })
    }
    if (config.method === 'post' && (url.endsWith('/reports/') || url.endsWith('/reports'))) {
      const body = config.data ? JSON.parse(config.data as string) : {}
      const newRep = { id: 'r-' + Date.now(), title: body.title ?? 'Reporte', standard: body.standard ?? 'iso27001', format: 'pdf', status: 'ready', signed: false, file_path: null, created_at: new Date().toISOString() }
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ message: 'Reporte generado', report: newRep }, 202) })
    }
    if (url.includes('/reports')) {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ total: MOCK_REPORTS.length, items: MOCK_REPORTS }) })
    }

    // Admin / feature flags
    if (url.includes('/admin/feature-flags') && config.method === 'patch') {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ updated: true }) })
    }
    if (url.includes('/admin/feature-flags')) {
      const user = getUser()
      const orgId = user?.organization_id ?? 'org-umg'
      throw Object.assign(new Error('mock'), {
        isMock: true,
        response: mockResponse({
          organization_id: orgId,
          flags: { scanning: true, dashboard: true, basic_reports: true, risk_assessment: false, iso27001_compliance: false, asset_management: false, monitoring: false, ai_remediation: false, xdr: false, auto_remediation: false, dedicated_infra: false, advanced_compliance: false },
        }),
      })
    }
    if (url.includes('/admin/audit-logs')) {
      throw Object.assign(new Error('mock'), { isMock: true, response: mockResponse({ total: 0, items: [] }) })
    }

    return config
  })

  client.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error?.isMock && error?.response) return Promise.resolve(error.response as AxiosResponse)
      return Promise.reject(error)
    },
  )
}
