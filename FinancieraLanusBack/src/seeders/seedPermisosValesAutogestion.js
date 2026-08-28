import { Role, Permission } from '../models/index.js'
import { ROLES } from '../config/auth.js'

/*
=====================================================
Otorga VALES_CREATE a COBRADOR y SUPERVISOR para que
puedan autogestionar sus propios vales desde mobile.

seedRolePermissions solo aplica sus permisos por
defecto en el alta inicial de cada rol (no pisa
ediciones manuales hechas desde la UI), asi que un
permiso agregado ahi no llega a los roles que ya
existen en una base ya inicializada. Este seeder es
aditivo e idempotente: solo agrega VALES_CREATE si el
rol todavia no lo tiene, sin tocar el resto de sus
permisos.
=====================================================
*/

export const seedPermisosValesAutogestion = async () => {

  const permiso =
    await Permission.findOne({
      where: {
        codigo: 'VALES_CREATE'
      }
    })

  if (!permiso) return

  const roles =
    await Role.findAll({
      where: {
        name: [
          ROLES.COBRADOR,
          ROLES.SUPERVISOR
        ]
      },
      include: [
        'permissions'
      ]
    })

  for (const role of roles) {

    const yaLoTiene =
      role.permissions.some(
        p => p.codigo === 'VALES_CREATE'
      )

    if (yaLoTiene) continue

    await role.addPermission(permiso)

  }

}
