import {
  Oficina,
  Zone
} from '../models/index.js'

export const listOficinas = async (
  req,
  res,
  next
) => {

  try {

    const oficinas =
      await Oficina.findAll({

        where: {
          activa: true,
          ownerId:
            req.user.ownerId
        },

        include: [
          {
            model: Zone,
            as: 'zonas'
          }
        ],

        order: [
          ['nombre', 'ASC']
        ]

      })

    res.json({

      success: true,

      data: oficinas

    })

  } catch (error) {

    next(error)

  }

}

export const getOficina = async (
  req,
  res,
  next
) => {

  try {

    const oficina =
      await Oficina.findByPk(
        req.params.id,
        {
          include: [
            {
              model: Zone,
              as: 'zonas'
            }
          ]
        }
      )

    if (
      !oficina ||
      oficina.ownerId !== req.user.ownerId
    ) {

      return res.status(404).json({

        success: false,

        message:
          'Oficina no encontrada'

      })

    }

    res.json({

      success: true,

      data: oficina

    })

  } catch (error) {

    next(error)

  }

}

export const createOficina = async (
  req,
  res,
  next
) => {

  try {

    const {
      nombre,
      zoneIds
    } = req.body

    const oficina =
      await Oficina.create({

        nombre,

        ownerId:
          req.user.ownerId

      })

    await oficina.setZonas(
      Array.isArray(zoneIds) ? zoneIds : []
    )

    const resultado =
      await Oficina.findByPk(
        oficina.id,
        {
          include: [
            {
              model: Zone,
              as: 'zonas'
            }
          ]
        }
      )

    res.status(201).json({

      success: true,

      data: resultado

    })

  } catch (error) {

    next(error)

  }

}

export const updateOficina = async (
  req,
  res,
  next
) => {

  try {

    const oficina =
      await Oficina.findByPk(
        req.params.id
      )

    if (
      !oficina ||
      oficina.ownerId !== req.user.ownerId
    ) {

      return res.status(404).json({

        success: false,

        message:
          'Oficina no encontrada'

      })

    }

    const {
      nombre,
      zoneIds
    } = req.body

    if (nombre !== undefined) {
      oficina.nombre = nombre
    }

    await oficina.save()

    if (zoneIds !== undefined) {

      await oficina.setZonas(
        Array.isArray(zoneIds) ? zoneIds : []
      )

    }

    const resultado =
      await Oficina.findByPk(
        oficina.id,
        {
          include: [
            {
              model: Zone,
              as: 'zonas'
            }
          ]
        }
      )

    res.json({

      success: true,

      data: resultado

    })

  } catch (error) {

    next(error)

  }

}

export const deleteOficina = async (
  req,
  res,
  next
) => {

  try {

    const oficina =
      await Oficina.findByPk(
        req.params.id
      )

    if (
      !oficina ||
      oficina.ownerId !== req.user.ownerId
    ) {

      return res.status(404).json({

        success: false,

        message:
          'Oficina no encontrada'

      })

    }

    oficina.activa = false

    await oficina.save()

    res.json({

      success: true,

      message:
        'Oficina desactivada'

    })

  } catch (error) {

    next(error)

  }

}
