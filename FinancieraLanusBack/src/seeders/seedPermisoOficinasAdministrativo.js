import { Role, Permission } from '../models/index.js'
import { ROLES } from '../config/auth.js'

/*
=====================================================
Otorga OFICINAS_VIEW a ADMINISTRATIVO. Igual que
seedPermisosValesAutogestion: seedRolePermissions solo
aplica sus permisos por defecto en el alta inicial de
cada rol, así que un permiso agregado ahí no llega a los
roles que ya existen en una base ya inicializada. Este
seeder es aditivo e idempotente.
=====================================================
*/

export const seedPermisoOficinasAdministrativo = async () => {

  const permiso =
    await Permission.findOne({
      where: {
        codigo: 'OFICINAS_VIEW'
      }
    })

  if (!permiso) return

  const role =
    await Role.findOne({
      where: {
        name: ROLES.ADMINISTRATIVO
      },
      include: [
        'permissions'
      ]
    })

  if (!role) return

  const yaLoTiene =
    role.permissions.some(
      p => p.codigo === 'OFICINAS_VIEW'
    )

  if (yaLoTiene) return

  await role.addPermission(permiso)

}
