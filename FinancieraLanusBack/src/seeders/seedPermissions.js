import { Permission } from '../models/index.js'

const MODULES = {

  DASHBOARD: [
    'VIEW'
  ],

  INFORME_SEMANAL: [
    'VIEW'
  ],

  CLIENTS: [
    'VIEW',
    'CREATE',
    'EDIT',
    'DELETE'
  ],

  COLLECTORS: [
    'VIEW',
    'CREATE',
    'EDIT',
    'DELETE'
  ],

  SUPERVISORS: [
    'VIEW',
    'CREATE',
    'EDIT',
    'DELETE'
  ],

  USERS: [
    'VIEW',
    'CREATE',
    'EDIT',
    'DELETE'
  ],

  ROLES: [
    'VIEW',
    'CREATE',
    'EDIT',
    'DELETE',
    'ASSIGN_PERMISSIONS'
  ],

  OWNERS: [
    'VIEW',
    'CREATE',
    'EDIT',
    'DELETE'
  ],

  ZONES: [
    'VIEW',
    'CREATE',
    'EDIT',
    'DELETE'
  ],

  CREDITS: [
    'VIEW',
    'CREATE',
    'EDIT',
    'DELETE'
  ],

  PLAN_TYPES: [
    'VIEW',
    'CREATE',
    'EDIT',
    'DELETE'
  ],

  HOLIDAYS: [
    'VIEW',
    'CREATE',
    'EDIT',
    'DELETE'
  ],

  VALES: [
    'VIEW',
    'CREATE',
    'EDIT',
    'DELETE'
  ],

  AYUDAS: [
    'VIEW',
    'CREATE',
    'EDIT',
    'DELETE'
  ],

  MOBILE: [
    'SUPERVISOR'
  ]

}

const actionName = {

  VIEW: 'Ver',

  CREATE: 'Crear',

  EDIT: 'Editar',

  DELETE: 'Eliminar',

  ASSIGN_PERMISSIONS: 'Asignar permisos',

  SUPERVISOR: 'Acceso Supervisor'

}

const moduleName = {

  DASHBOARD: 'Dashboard',

  INFORME_SEMANAL: 'Informe Semanal',

  CLIENTS: 'Clientes',

  COLLECTORS: 'Cobradores',

  SUPERVISORS: 'Supervisores',

  USERS: 'Usuarios',

  ROLES: 'Roles',

  OWNERS: 'Propietarios',

  ZONES: 'Zonas',

  CREDITS: 'Créditos',

  PLAN_TYPES: 'Tipos de Plan',

  HOLIDAYS: 'Días No Laborables',

  VALES: 'Vales',

  AYUDAS: 'Ayudas',

  MOBILE: 'Mobile'

}

export const seedPermissions = async () => {

  for (const [module, actions] of Object.entries(MODULES)) {

    for (const action of actions) {

      const codigo =
        `${module}_${action}`

      await Permission.findOrCreate({

        where: {
          codigo
        },

        defaults: {

          codigo,

          modulo: module,

          nombre:
            `${actionName[action]} ${moduleName[module]}`,

          descripcion:
            `${actionName[action]} ${moduleName[module]}`

        }

      })

    }

  }

}