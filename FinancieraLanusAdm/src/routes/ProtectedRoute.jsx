import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { obtenerPrimeraRutaAccesible } from '../utils/permissionRoutes'

export default function ProtectedRoute({ children, requiredPermissions = [] }) {
  const location = useLocation()
  const token = useAuthStore((state) => state.token)
  const permissions = useAuthStore((state) => state.user?.permissions || [])
  const oficinas = useAuthStore((state) => state.user?.oficinas || [])
  const oficinaSeleccionConfirmada = useAuthStore(
    (state) => state.oficinaSeleccionConfirmada,
  )

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (
    oficinas.length > 1 &&
    !oficinaSeleccionConfirmada &&
    location.pathname !== '/seleccionar-oficina'
  ) {
    return <Navigate to="/seleccionar-oficina" replace />
  }

  const hasPermissions = requiredPermissions.every((permission) =>
    permissions.includes(permission),
  )

  if (!hasPermissions) {
    return <Navigate to={obtenerPrimeraRutaAccesible(permissions)} replace />
  }

  return children
}
