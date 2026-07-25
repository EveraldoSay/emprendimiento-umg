import { create } from 'zustand'
import type { XDRAlert } from '@/types'
import { MOCK_XDR_ALERTS, LIVE_DEMO_ALERTS } from '@/api/mockData'

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

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
    if (IS_DEMO) {
      if (get().demoInterval) return
      set({ wsStatus: 'connected', alerts: [...MOCK_XDR_ALERTS] })
      let idx = 0
      const interval = setInterval(() => {
        const template = LIVE_DEMO_ALERTS[idx % LIVE_DEMO_ALERTS.length]
        const newAlert: XDRAlert = { ...template, id: `live-${Date.now()}`, timestamp: new Date().toISOString() }
        set((s) => ({ alerts: [newAlert, ...s.alerts].slice(0, 200) }))
        idx++
      }, 15_000)
      set({ demoInterval: interval })
      return
    }

    const existing = get().ws
    if (existing && existing.readyState === WebSocket.OPEN) return
    const wsUrl = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/v1/alerts`
    const ws = new WebSocket(wsUrl)
    set({ wsStatus: 'connecting', ws })
    ws.onopen = () => ws.send(JSON.stringify({ type: 'auth', token }))
    ws.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data as string)
      if (data.type === 'connected') set({ wsStatus: 'connected' })
      else if (data.type === 'alert') set((s) => ({ alerts: [{ ...data, id: `${Date.now()}` }, ...s.alerts].slice(0, 200) }))
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

  addAlert: (alert) => set((s) => ({ alerts: [alert, ...s.alerts].slice(0, 200) })),
  clearAlerts: () => set({ alerts: [] }),
}))
