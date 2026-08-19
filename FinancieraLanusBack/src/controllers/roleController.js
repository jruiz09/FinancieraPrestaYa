import {
  Role,
  Permission,
  User
} from '../models/index.js'

export const getRoles = async (
  req,
  res,
  next
) => {

  try {

    const roles =
      await Role.findAll({

        include: [

          {
            model: User,
            as: 'users',
            attributes: ['id']
          },

          {
            model: Permission,
            as: 'permissions',
            attributes: ['id'],
            through: {
              attributes: []
            }
          }

        ],

        order: [
          ['name', 'ASC']
        ]

      })

    const data =
      roles.map(role => ({

        id: role.id,

        name: role.name,

        description: role.description,

        usersCount:
          role.users.length,

        permissionsCount:
          role.permissions.length

      }))

    res.json({

      success: true,

      data

    })

  }

  catch (error) {

    next(error)

  }

}

export const getRoleById = async (
  req,
  res,
  next
) => {

  try {

    const role =
      await Role.findByPk(

        req.params.id,

        {

          include: [

            {

              model: Permission,

              as: 'permissions',

              attributes: [

                'id',
                'codigo',
                'nombre',
                'modulo'

              ],

              through: {

                attributes: []

              }

            }

          ]

        }

      )

    if (!role) {

      return res.status(404).json({

        success: false,

        message: 'Rol no encontrado'

      })

    }

    res.json({

      success: true,

      data: role

    })

  }

  catch (error) {

    next(error)

  }

}

export const createRole = async (

  req,

  res,

  next

) => {

  try {

    const {

      name,

      description,

      permissions = []

    } = req.body

    const exists =
      await Role.findOne({

        where: {

          name

        }

      })

    if (exists) {

      return res.status(400).json({

        success: false,

        message: 'Ya existe un rol con ese nombre'

      })

    }

    const role =
      await Role.create({

        name,

        description

      })

    if (permissions.length) {

      const permissionObjects =
        await Permission.findAll({

          where: {

            codigo: permissions

          }

        })

      await role.setPermissions(
        permissionObjects
      )

    }

    res.status(201).json({

      success: true,

      data: role

    })

  }

  catch (error) {

    next(error)

  }

}

export const updateRole = async (

  req,

  res,

  next

) => {

  try {

    const {

      name,

      description

    } = req.body

    const role =
      await Role.findByPk(

        req.params.id

      )

    if (!role) {

      return res.status(404).json({

        success: false,

        message: 'Rol no encontrado'

      })

    }

    const duplicated =
      await Role.findOne({

        where: {

          name

        }

      })

    if (

      duplicated &&

      duplicated.id !== role.id

    ) {

      return res.status(400).json({

        success: false,

        message: 'Ya existe un rol con ese nombre'

      })

    }

    role.name = name

    role.description = description

    await role.save()

    res.json({

      success: true,

      data: role

    })

  }

  catch (error) {

    next(error)

  }

}

export const updateRolePermissions = async (

  req,

  res,

  next

) => {

  try {

    const {

      permissions = []

    } = req.body

    const role =
      await Role.findByPk(

        req.params.id

      )

    if (!role) {

      return res.status(404).json({

        success: false,

        message: 'Rol no encontrado'

      })

    }

    const permissionObjects =
      await Permission.findAll({

        where: {

          codigo: permissions

        }

      })

    await role.setPermissions(
      permissionObjects
    )

    res.json({

      success: true,

      message: 'Permisos actualizados'

    })

  }

  catch (error) {

    next(error)

  }

}

export const deleteRole = async (

  req,

  res,

  next

) => {

  try {

    const role =
      await Role.findByPk(

        req.params.id,

        {

          include: [

            {

              model: User,

              as: 'users',

              attributes: ['id']

            }

          ]

        }

      )

    if (!role) {

      return res.status(404).json({

        success: false,

        message: 'Rol no encontrado'

      })

    }

    if (role.users.length > 0) {

      return res.status(400).json({

        success: false,

        message: 'No se puede eliminar un rol con usuarios asignados'

      })

    }

    await role.destroy()

    res.json({

      success: true,

      message: 'Rol eliminado correctamente'

    })

  }

  catch (error) {

    next(error)

  }

}