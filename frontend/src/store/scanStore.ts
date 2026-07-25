/**
 * Store de escaneos con simulación de progreso en modo demo.
 */

import { create } from 'zustand'
import type { ScanJob, ScanType } from '@/types'
import { MOCK_SCANS } from '@/api/mockData'

// Fases que recorre un escaneo simulado
interface ScanPhase {
  status: 'pending' | 'running' | 'completed'
  label: string
  pct: number
  delayMs: number
}

const SCAN_PHASES: ScanPhase[] = [
  { status: 'pending',   label: 'En cola...',                        pct: 0,   delayMs: 800  },
  { status: 'running',   label: 'Descubriendo hosts (ARP/ICMP)...',  pct: 20,  delayMs: 2500 },
  { status: 'running',   label: 'Escaneando puertos TCP/UDP...',     pct: 45,  delayMs: 3000 },
  { status: 'running',   label: 'Detectando servicios y versiones',  pct: 65,  delayMs: 2000 },
  { status: 'running',   label: 'Consultando NVD por CVEs...',       pct: 82,  delayMs: 2500 },
  { status: 'running',   label: 'Generando informe de hallazgos...', pct: 95,  delayMs: 1500 },
  { status: 'completed', label: 'Escaneo completado',                pct: 100, delayMs: 0    },
]

interface LiveScan {
  jobId: string
  phase: number
  pct: number
  label: string
  vulnsFound: number
}

interface ScanState {
  jobs: ScanJob[]
  liveScans: Record<string, LiveScan>
  startDemoScan: (target: string, scanType: ScanType) => ScanJob
  tickScan: (jobId: string) => void
}

const tickTimers: Record<string, ReturnType<typeof setTimeout>> = {}

export const useScanStore = create<ScanState>((set, get) => ({
  jobs: MOCK_SCANS,
  liveScans: {},

  startDemoScan: (target: string, scanType: ScanType): ScanJob => {
    const jobId = 'scan-' + Date.now()
    const newJob: ScanJob = {
      id: jobId,
      target,
      scan_type: scanType,
      status: 'pending',
      celery_task_id: 'demo-' + jobId,
      asset_id: null,
      started_at: new Date().toISOString(),
      completed_at: null,
      error_message: null,
      created_at: new Date().toISOString(),
    }

    const liveEntry: LiveScan = {
      jobId,
      phase: 0,
      pct: 0,
      label: SCAN_PHASES[0].label,
      vulnsFound: 0,
    }

    set((s: ScanState) => ({
      jobs: [newJob, ...s.jobs],
      liveScans: { ...s.liveScans, [jobId]: liveEntry },
    }))

    get().tickScan(jobId)
    return newJob
  },

  tickScan: (jobId: string): void => {
    const state = get()
    const live = state.liveScans[jobId]
    if (!live) return

    const phase = SCAN_PHASES[live.phase]
    if (!phase) return

    // Actualizar estado visual
    set((s: ScanState) => ({
      liveScans: {
        ...s.liveScans,
        [jobId]: { ...s.liveScans[jobId], pct: phase.pct, label: phase.label },
      },
      jobs: s.jobs.map((j: ScanJob) =>
        j.id === jobId ? { ...j, status: phase.status } : j
      ),
    }))

    const nextPhaseIdx = live.phase + 1

    if (nextPhaseIdx < SCAN_PHASES.length && phase.delayMs > 0) {
      tickTimers[jobId] = setTimeout(() => {
        set((s: ScanState) => ({
          liveScans: {
            ...s.liveScans,
            [jobId]: { ...s.liveScans[jobId], phase: nextPhaseIdx },
          },
        }))
        get().tickScan(jobId)
      }, phase.delayMs)
    }

    // Fase final
    if (phase.status === 'completed') {
      const vulnsFound = Math.floor(Math.random() * 4) + 2
      set((s: ScanState) => ({
        jobs: s.jobs.map((j: ScanJob) =>
          j.id === jobId
            ? { ...j, status: 'completed', completed_at: new Date().toISOString() }
            : j
        ),
        liveScans: {
          ...s.liveScans,
          [jobId]: { ...s.liveScans[jobId], vulnsFound, pct: 100 },
        },
      }))
      delete tickTimers[jobId]
    }
  },
}))
