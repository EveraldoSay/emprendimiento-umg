/**
 * Protege rutas que requieren autenticación.
 * Redirige a /login si el usuario no está autenticado.
 */

import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useFeatureStore } from '@/store/featureStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'

export function ProtectedRoute() {
  const { isAuthenticated, user, refreshUser } = useAuthStore()
  const { fetchFlags } = useFeatureStore()

  useEffect(() => {
    if (isAuthenticated && !user) {
      refreshUser()
    }
  }, [isAuthenticated, user, refreshUser])

  useEffect(() => {
    if (user?.organization_id) {
      fetchFlags(user.organization_id)
    }
  }, [user?.organization_id, fetchFlags])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
