/**
 * Store de alertas XDR en tiempo real.
 * Modo demo: simula alertas automáticas cada 15 segundos.
 * Modo real: conecta via WebSocket.
 */

import { create } from 'zustand'
import type { XDRAlert } from '@/types'
import { MOCK_XDR_ALERTS } from '@/api/mockData'

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

// Alertas adicionales simuladas en vivo durante la demo
const LIVE_DEMO_ALERTS: Omit<XDRAlert, 'id' | 'timestamp'>[] = [
  {
    type: 'alert', severity: 'critical',
    title: 'Ransomware LockBit 3.0 — Actividad de cifrado detectada',
    source: 'endpoint',
    description: 'Proceso svchost.exe iniciando cifrado masivo de archivos en unidad C:\\. Host aislado automáticamente.',
  },
  {
    type: 'alert', severity: 'high',
    title: 'Movimiento lateral detectado — Pass-the-Hash',
    source: 'identity',
    description: 'Credenciales de dominio reutilizadas desde workstation-42 hacia servidor DB-01. Técnica MITRE T1550.002.',
  },
  {
    type: 'alert', severity: 'high',
    title: 'Exfiltración de datos — Tráfico DNS inusual',
    source: 'network',
    description: '1,240 consultas DNS a subdominio aleatorio en 60 segundos. Posible DNS tunneling hacia C2 externo.',
  },
  {
    type: 'alert', severity: 'medium',
    title: 'Cuenta privilegiada fuera de horario laboral',
    source: 'identity',
    description: 'Usuario admin@usac.edu.gt accedió al panel de administración a las 03:42 AM desde IP no registrada.',
  },
]

interface AlertState {
  alerts: XDRAlert[]
  wsStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  ws: WebSocket | null
  demoInterval: ReturnType<typeof setInterval> | null
  connect: (token: string) => void
  disconnect: () => void
  addAlert: (alert: XDRAlert) => void
  clearAlerts: () => void
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  wsStatus: 'disconnected',
  ws: null,
  demoInterval: null,

  connect: (token) => {
    // ── Modo demo ───────────────────────────────────────────────────────────
    if (IS_DEMO) {
      if (get().demoInterval) return // ya conectado

      set({ wsStatus: 'connected', alerts: [...MOCK_XDR_ALERTS] })

      let idx = 0
      const interval = setInterval(() => {
        const template = LIVE_DEMO_ALERTS[idx % LIVE_DEMO_ALERTS.length]
        const newAlert: XDRAlert = {
          ...template,
          id: `live-${Date.now()}`,
          timestamp: new Date().toISOString(),
        }
        set((state) => ({
          alerts: [newAlert, ...state.alerts].slice(0, 200),
        }))
        idx++
      }, 15_000)

      set({ demoInterval: interval })
      return
    }

    // ── Modo real (WebSocket) ───────────────────────────────────────────────
    const existing = get().ws
    if (existing && existing.readyState === WebSocket.OPEN) return

    const wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/v1/alerts`
    const ws = new WebSocket(wsUrl)
    set({ wsStatus: 'connecting', ws })

    ws.onopen = () => ws.send(JSON.stringify({ type: 'auth', token }))

    ws.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data as string)
      if (data.type === 'connected') {
        set({ wsStatus: 'connected' })
      } else if (data.type === 'alert') {
        const alert: XDRAlert = { ...data, id: `${Date.now()}-${Math.random()}` }
        set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 200) }))
      }
    }

    ws.onerror = () => set({ wsStatus: 'error' })
    ws.onclose = () => set({ wsStatus: 'disconnected', ws: null })
  },

  disconnect: () => {
    const { ws, demoInterval } = get()
    if (ws) ws.close()
    if (demoInterval) clearInterval(demoInterval)
    set({ ws: null, demoInterval: null, wsStatus: 'disconnected' })
  },

  addAlert: (alert) =>
    set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 200) })),

  clearAlerts: () => set({ alerts: [] }),
}))
