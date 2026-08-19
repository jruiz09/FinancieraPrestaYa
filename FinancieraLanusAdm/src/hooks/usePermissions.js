import { useAuthStore } from '../store/useAuthStore'

export default function usePermissions() {

  const user =
    useAuthStore(
      state => state.user
    )

  const permissions =
    user?.permissions || []

  const can = permission =>

    permissions.includes(
      permission
    )

  const cannot = permission =>

    !permissions.includes(
      permission
    )

  const hasAny = (...items) =>

    items.some(
      permission =>
        permissions.includes(permission)
    )

  const hasAll = (...items) =>

    items.every(
      permission =>
        permissions.includes(permission)
    )

  const isAdmin =
    user?.role === 'ADMIN'

  return {

    permissions,

    can,

    cannot,

    hasAny,

    hasAll,

    isAdmin

  }

}