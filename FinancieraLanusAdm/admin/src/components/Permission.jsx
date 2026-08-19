import usePermissions from '../hooks/usePermissions'

export default function Permission({

  permission,

  permissions,

  children,

  fallback = null

}) {

  const {

    can,

    hasAny

  } = usePermissions()

  if (permission) {

    return can(permission)

      ? children

      : fallback

  }

  if (permissions) {

    return hasAny(...permissions)

      ? children

      : fallback

  }

  return children

}