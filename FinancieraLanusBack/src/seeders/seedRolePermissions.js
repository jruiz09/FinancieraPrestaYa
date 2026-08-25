import { Role, Permission } from '../models/index.js'
import { ROLES } from '../config/auth.js'

export const seedRolePermissions = async () => {

  const roles =
    await Role.findAll({

      include: [
        'permissions'
      ]

    })

  const permissions =
    await Permission.findAll()

  const permissionMap = {}

  permissions.forEach(permission => {

    permissionMap[
      permission.codigo
    ] = permission

  })

  const rolePermissions = {

    [ROLES.ADMINISTRATIVO]: [

      'DASHBOARD_VIEW',

      'INFORME_SEMANAL_VIEW',

      'CLIENTS_VIEW',
      'CLIENTS_CREATE',
      'CLIENTS_EDIT',

      'COLLECTORS_VIEW',

      'SUPERVISORS_VIEW',

      'CREDITS_VIEW',
      'CREDITS_CREATE',
      'CREDITS_EDIT',

      'VALES_VIEW',
      'VALES_CREATE',

      'AYUDAS_VIEW',

      'ZONES_VIEW',

      'PLAN_TYPES_VIEW',

      'HOLIDAYS_VIEW'

    ],

    [ROLES.SUPERVISOR]: [

      'MOBILE_SUPERVISOR',

      'VALES_VIEW',

      'AYUDAS_VIEW',

      'AYUDAS_CREATE'

    ],

    [ROLES.COBRADOR]: [

      'VALES_VIEW'

    ],

    [ROLES.USER]: []

  }

  for (const role of roles) {

    //
    // ADMIN
    //

    if (role.name === ROLES.ADMIN) {

      await role.setPermissions(
        permissions
      )

      continue

    }

    //
    // resto: los permisos por defecto solo se aplican en el alta
    // inicial del rol, para no pisar ediciones manuales hechas
    // desde la UI en cada arranque del servidor
    //

    if (role.permissions.length > 0) {

      continue

    }

    const permisos =
      rolePermissions[
        role.name
      ] || []

    const permissionObjects =
      permisos

        .map(codigo =>
          permissionMap[codigo]
        )

        .filter(Boolean)

    await role.setPermissions(
      permissionObjects
    )

  }

}