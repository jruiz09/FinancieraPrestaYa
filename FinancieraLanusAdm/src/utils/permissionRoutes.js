export const RUTAS_POR_PERMISO = [

  { path: '/dashboard', permission: 'DASHBOARD_VIEW' },

  { path: '/clients', permission: 'CLIENTS_VIEW' },

  { path: '/creditos', permission: 'CREDITS_VIEW' },

  { path: '/supervisores', permission: 'SUPERVISORS_VIEW' },

  { path: '/collectors', permission: 'COLLECTORS_VIEW' },

  { path: '/zonas', permission: 'ZONES_VIEW' },

  { path: '/ayudas', permission: 'AYUDAS_VIEW' },

  { path: '/vales', permission: 'VALES_VIEW' },

  { path: '/tipoplan', permission: 'PLAN_TYPES_VIEW' },

  { path: '/dias-no-laborables', permission: 'HOLIDAYS_VIEW' },

  { path: '/users', permission: 'USERS_VIEW' },

  { path: '/roles', permission: 'ROLES_VIEW' }

]

export const obtenerPrimeraRutaAccesible = (permissions = []) => {

  const encontrada =
    RUTAS_POR_PERMISO.find(
      item =>
        permissions.includes(
          item.permission
        )
    )

  return encontrada?.path || '/sin-acceso'

}
