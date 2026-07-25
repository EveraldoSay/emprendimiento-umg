import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Loader2, Shield, Lock, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { DEMO_ENTITIES } from '@/api/mockData'
import type { DemoEntityId } from '@/api/mockData'

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, verifyOtp, isLoading, pendingUserId, clearPending } = useAuthStore()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp]           = useState('')
  const [error, setError]       = useState('')

  // ── Demo: entrar como entidad ─────────────────────────────────────────────
  const handleDemoLogin = (entityId: DemoEntityId) => {
    const entity = DEMO_ENTITIES.find((e) => e.id === entityId)!
    const { useDemoLogin } = useAuthStore.getState()
    useDemoLogin(entity.profile, entity.assets, entity.vulns, entity.metrics, entityId)
    navigate('/dashboard')
  }

  // ── Real: paso 1 ─────────────────────────────────────────────────────────
  const handleCredentials = async (e: FormEvent) => {
    e.preventDefault(); setError('')
    try { await login(email, password) }
    catch (err: unknown) {
      const ax = err as { response?: { data?: { detail?: string } } }
      setError(ax?.response?.data?.detail ?? 'Credenciales incorrectas')
    }
  }

  // ── Real: paso 2 ─────────────────────────────────────────────────────────
  const handleOtp = async (e: FormEvent) => {
    e.preventDefault(); setError('')
    try { await verifyOtp(pendingUserId!, otp); navigate('/dashboard') }
    catch (err: unknown) {
      const ax = err as { response?: { data?: { detail?: string } } }
      setError(ax?.response?.data?.detail ?? 'Código OTP inválido o expirado')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/25">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">CyberSec AI Platform</h1>
        <p className="text-gray-500 text-sm mt-1">Gestión Preventiva de Riesgos Cibernéticos con IA</p>
        <p className="text-gray-600 text-xs mt-1">Universidad Mariano Gálvez · Maestría en Seguridad Informática</p>
      </div>

      {/* ── MODO DEMO ── */}
      {IS_DEMO ? (
        <div className="w-full max-w-2xl">
          <p className="text-center text-gray-400 text-sm mb-5">
            Selecciona una entidad para explorar la plataforma
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMO_ENTITIES.map((entity) => {
              const isBlue  = entity.color === 'blue'
              const border  = isBlue ? 'border-blue-700/50 hover:border-blue-500' : 'border-green-700/50 hover:border-green-500'
              const bg      = isBlue ? 'hover:bg-blue-900/10' : 'hover:bg-green-900/10'
              const badge   = isBlue ? 'bg-blue-900/40 text-blue-300 border-blue-700/40' : 'bg-green-900/40 text-green-300 border-green-700/40'
              const btnCls  = isBlue ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-700 hover:bg-green-600'
              const dotCls  = isBlue ? 'bg-blue-500' : 'bg-green-500'

              return (
                <div key={entity.id}
                  className={`bg-gray-900 border ${border} ${bg} rounded-2xl p-6 flex flex-col gap-4 transition-all cursor-pointer group`}
                  onClick={() => handleDemoLogin(entity.id as DemoEntityId)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badge}`}>
                        {entity.label}
                      </span>
                      <p className="text-white font-bold text-base mt-2 leading-tight">
                        {entity.emoji} {entity.shortName}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">{entity.name}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors mt-1 flex-shrink-0" />
                  </div>

                  {/* Sector */}
                  <p className="text-gray-500 text-xs">{entity.sector}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Activos', value: entity.assets.length },
                      { label: 'Vulns', value: entity.vulns.length },
                      { label: 'Críticas', value: entity.vulns.filter(v => v.severity === 'critical').length },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-gray-800/60 rounded-lg p-2 text-center">
                        <p className="text-white font-bold text-lg leading-none">{stat.value}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Plan inicial */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className={`w-2 h-2 rounded-full ${dotCls}`} />
                    Inicia en Plan Básico — puedes cambiar desde el Dashboard
                  </div>

                  {/* Botón */}
                  <button
                    className={`w-full ${btnCls} text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2`}
                    onClick={(e) => { e.stopPropagation(); handleDemoLogin(entity.id as DemoEntityId) }}
                  >
                    <Shield className="w-4 h-4" />
                    Ingresar como {entity.shortName}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Badges estándares */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['ISO 27001', 'NIST CSF 2.0', 'CIS Controls v8', 'OWASP Top 10', 'MITRE ATT&CK', 'Zero Trust'].map((s) => (
              <span key={s} className="text-xs bg-gray-800/80 text-gray-500 border border-gray-700/50 px-3 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>

      ) : (
        /* ── MODO REAL (2FA) ── */
        <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
          {!pendingUserId ? (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-4 h-4 text-blue-400" />
                <h2 className="text-white font-semibold">Iniciar Sesión</h2>
              </div>
              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Correo institucional</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="usuario@entidad.gt"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'Verificando...' : 'Continuar'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-400" />
                <h2 className="text-white font-semibold">Verificación 2FA</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">Código de 6 caracteres enviado a tu correo. Vence en 10 minutos.</p>
              <form onSubmit={handleOtp} className="space-y-4">
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  maxLength={6} required placeholder="ABC123" autoFocus
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-2xl font-mono tracking-[0.5em] text-center focus:outline-none focus:border-blue-500" />
                {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={isLoading || otp.length < 6}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  {isLoading ? 'Verificando...' : 'Verificar y Acceder'}
                </button>
                <button type="button" onClick={clearPending} className="w-full text-gray-500 hover:text-gray-300 text-sm transition-colors">
                  ← Volver
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  )
}
