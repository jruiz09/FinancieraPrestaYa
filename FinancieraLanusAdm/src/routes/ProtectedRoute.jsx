import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { obtenerPrimeraRutaAccesible } from '../utils/permissionRoutes'

export default function ProtectedRoute({ children, requiredPermissions = [] }) {
  const token = useAuthStore((state) => state.token)
  const permissions = useAuthStore((state) => state.user?.permissions || [])

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const hasPermissions = requiredPermissions.every((permission) =>
    permissions.includes(permission),
  )

  if (!hasPermissions) {
    return <Navigate to={obtenerPrimeraRutaAccesible(permissions)} replace />
  }

  return children
}
