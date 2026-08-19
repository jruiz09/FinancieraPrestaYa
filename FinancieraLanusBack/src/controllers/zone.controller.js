import {
  Zone,
  Collector
} from '../models/index.js'

export const listZones = async (
  req,
  res,
  next
) => {

  try {

    const zones =
      await Zone.findAll({

        where: {
          activa: true,
          ownerId:
            req.user.ownerId
        },

        include: [
          {
            model: Collector,
            as: 'collectors'
          }
        ],

        order: [
          ['nombre', 'ASC']
        ]

      })

    res.json({

      success: true,

      data: zones

    })

  } catch (error) {

    next(error)

  }

}

export const getZone = async (
  req,
  res,
  next
) => {

  try {

    const zone =
      await Zone.findByPk(
        req.params.id,
        {
          include: [
            {
              model: Collector,
              as: 'collectors'
            }
          ]
        }
      )

    if (!zone) {

      return res.status(404).json({

        success: false,

        message:
          'Zona no encontrada'

      })

    }

    res.json({

      success: true,

      data: zone

    })

  } catch (error) {

    next(error)

  }

}

export const createZone = async (
  req,
  res,
  next
) => {

  try {

    const zone =
      await Zone.create({

        ...req.body,

        ownerId:
          req.user.ownerId

      })

    res.status(201).json({

      success: true,

      data: zone

    })

  } catch (error) {

    next(error)

  }

}

export const updateZone = async (
  req,
  res,
  next
) => {

  try {

    const zone =
      await Zone.findByPk(
        req.params.id
      )

    if (!zone) {

      return res.status(404).json({

        success: false,

        message:
          'Zona no encontrada'

      })

    }

    await zone.update(
      req.body
    )

    res.json({

      success: true,

      data: zone

    })

  } catch (error) {

    next(error)

  }

}

export const deleteZone = async (
  req,
  res,
  next
) => {

  try {

    const zone =
      await Zone.findByPk(
        req.params.id
      )

    if (!zone) {

      return res.status(404).json({

        success: false,

        message:
          'Zona no encontrada'

      })

    }

    zone.activa = false

    await zone.save()

    res.json({

      success: true,

      message:
        'Zona desactivada'

    })

  } catch (error) {

    next(error)

  }

}