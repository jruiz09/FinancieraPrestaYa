import {
  LayoutDashboard,
  Users,
  MapPinned,
  UserRound,
  CalendarDays,
  CreditCard,
  ReceiptText,
  CircleHelp,
  ShieldCheck,
  Landmark,
  Wallet,
  CalendarRange
} from 'lucide-react'

export const RUTAS_POR_PERMISO = [

  { path: '/dashboard', permission: 'DASHBOARD_VIEW', label: 'Dashboard', icon: LayoutDashboard },

  { path: '/informe-semanal', permission: 'INFORME_SEMANAL_VIEW', label: 'Informe semanal', icon: CalendarRange },

  { path: '/clients', permission: 'CLIENTS_VIEW', label: 'Clientes', icon: Users },

  { path: '/creditos', permission: 'CREDITS_VIEW', label: 'Créditos', icon: CreditCard },

  { path: '/supervisores', permission: 'SUPERVISORS_VIEW', label: 'Supervisores', icon: UserRound },

  { path: '/collectors', permission: 'COLLECTORS_VIEW', label: 'Cobradores', icon: ReceiptText },

  { path: '/zonas', permission: 'ZONES_VIEW', label: 'Zonas', icon: MapPinned },

  { path: '/ayudas', permission: 'AYUDAS_VIEW', label: 'Ayudas', icon: CircleHelp },

  { path: '/vales', permission: 'VALES_VIEW', label: 'Vales', icon: Wallet },

  { path: '/tipoplan', permission: 'PLAN_TYPES_VIEW', label: 'Planes', icon: Landmark },

  { path: '/dias-no-laborables', permission: 'HOLIDAYS_VIEW', label: 'Días no laborables', icon: CalendarDays },

  { path: '/users', permission: 'USERS_VIEW', label: 'Usuarios', icon: Users },

  { path: '/roles', permission: 'ROLES_VIEW', label: 'Roles', icon: ShieldCheck }

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
