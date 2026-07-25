import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Loader2, Shield, Lock, Info } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { DEMO_USERS } from '@/api/mockData'

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, verifyOtp, isLoading, pendingUserId, clearPending } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  // ── Modo demo: login directo sin backend ──────────────────────────────────
  const handleDemoLogin = async (demoUser: typeof DEMO_USERS[0]) => {
    const { useDemoLogin } = useAuthStore.getState()
    useDemoLogin(demoUser.profile, demoUser.assets)
    navigate('/dashboard')
  }

  // ── Modo real: flujo 2FA ───────────────────────────────────────────────────
  const handleCredentials = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      setError(axiosErr?.response?.data?.detail ?? 'Credenciales incorrectas')
    }
  }

  const handleOtp = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await verifyOtp(pendingUserId!, otp)
      navigate('/dashboard')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      setError(axiosErr?.response?.data?.detail ?? 'Código OTP inválido o expirado')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/25">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CyberSec AI</h1>
          <p className="text-gray-500 text-sm mt-1">Plataforma de Ciberseguridad Soberana</p>
          {IS_DEMO && (
            <span className="inline-flex items-center gap-1 mt-2 text-xs bg-amber-900/40 text-amber-400 border border-amber-700/40 px-2 py-0.5 rounded-full">
              <Info className="w-3 h-3" /> Modo Demo — UMG Maestría Seguridad Informática
            </span>
          )}
        </div>

        {/* ── MODO DEMO ── */}
        {IS_DEMO ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
            <p className="text-white font-semibold text-sm text-center">Selecciona un perfil de demostración</p>
            <p className="text-gray-500 text-xs text-center">Cada perfil carga una entidad distinta con sus activos y vulnerabilidades reales.</p>

            <div className="space-y-3 pt-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  onClick={() => handleDemoLogin(u)}
                  className="w-full text-left bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-600 rounded-xl p-4 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-semibold group-hover:text-blue-400 transition-colors">
                        {u.profile.full_name}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">{u.email}</p>
                      <p className="text-xs mt-1">
                        <span className={`font-medium ${u.plan === 'premium' ? 'text-blue-400' : 'text-gray-400'}`}>
                          {u.org}
                        </span>
                        <span className="text-gray-600 mx-1">·</span>
                        <span className="capitalize text-gray-400">{u.plan}</span>
                        <span className="text-gray-600 mx-1">·</span>
                        <span className="capitalize text-gray-400">{u.profile.role}</span>
                      </p>
                    </div>
                    <Shield className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>

            <p className="text-gray-700 text-xs text-center pt-1">
              Contraseña demo: <span className="text-gray-500 font-mono">Demo2025!</span> (no se valida en modo offline)
            </p>
          </div>

        ) : (
          /* ── MODO REAL (2FA) ── */
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
            {!pendingUserId ? (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="w-4 h-4 text-blue-400" />
                  <h2 className="text-white font-semibold">Iniciar Sesión</h2>
                </div>
                <form onSubmit={handleCredentials} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm text-gray-400 mb-1">Correo institucional</label>
                    <input
                      id="email" type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required autoComplete="email" placeholder="usuario@entidad.gt"
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm text-gray-400 mb-1">Contraseña</label>
                    <input
                      id="password" type="password" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required autoComplete="current-password" placeholder="••••••••"
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  {error && (
                    <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>
                  )}
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
                <p className="text-sm text-gray-500 mb-6">
                  Ingresa el código de 6 caracteres enviado a tu correo institucional. Vence en 10 minutos.
                </p>
                <form onSubmit={handleOtp} className="space-y-4">
                  <input
                    type="text" value={otp}
                    onChange={(e) => setOtp(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    maxLength={6} required placeholder="ABC123"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-2xl font-mono tracking-[0.5em] text-center focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  {error && (
                    <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>
                  )}
                  <button type="submit" disabled={isLoading || otp.length < 6}
                    className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    {isLoading ? 'Verificando...' : 'Verificar y Acceder'}
                  </button>
                  <button type="button" onClick={clearPending}
                    className="w-full text-gray-500 hover:text-gray-300 text-sm transition-colors">
                    ← Volver al inicio de sesión
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-600">
          <Shield className="w-3 h-3" />
          <span>Zero Trust · IA Soberana · ISO 27001 · NIST CSF 2.0</span>
        </div>
      </div>
    </div>
  )
}
