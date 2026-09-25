import {
  Zone,
  Collector,
  Oficina
} from '../models/index.js'

import { Op } from 'sequelize'

import {
  obtenerZoneIdsPermitidos,
  filtrarZoneIdsPermitidos
} from '../utils/oficinaScope.js'

/*
=====================================================
Devuelve las zonas visibles para el usuario: primero se
restringen por sus oficinas asignadas (obtenerZoneIdsPermitidos,
null = sin restricción); si además mandó ?oficinaIds= (el switch
del Header), se acota más todavía a solo esas oficinas puntuales
(intersectado contra lo permitido, nunca puede "pedir" una
oficina ajena).
=====================================================
*/
export const listZones = async (
  req,
  res,
  next
) => {

  try {

    const zoneIdsPermitidos =
      await obtenerZoneIdsPermitidos(req.user)

    let zoneIdsSwitch = null

    if (req.query.oficinaIds) {

      const oficinaIds =
        req.query.oficinaIds
          .split(',')
          .map(id => id.trim())
          .filter(Boolean)

      const oficinas =
        await Oficina.findAll({
          where: {
            id: oficinaIds,
            ownerId: req.user.ownerId
          },
          include: [
            {
              model: Zone,
              as: 'zonas',
              attributes: ['id']
            }
          ]
        })

      const zoneIdsSet = new Set()

      for (const oficina of oficinas) {
        for (const zona of oficina.zonas || []) {
          zoneIdsSet.add(zona.id)
        }
      }

      zoneIdsSwitch = Array.from(zoneIdsSet)
    }

    let zoneIdsFinal = zoneIdsSwitch

    if (zoneIdsPermitidos !== null) {

      zoneIdsFinal =
        zoneIdsSwitch === null
          ? zoneIdsPermitidos
          : filtrarZoneIdsPermitidos(zoneIdsSwitch, zoneIdsPermitidos)

    }

    const where = {
      activa: true,
      ownerId:
        req.user.ownerId
    }

    if (zoneIdsFinal !== null) {
      where.id = { [Op.in]: zoneIdsFinal }
    }

    const zones =
      await Zone.findAll({

        where,

        include: [
          {
            model: Collector,
            as: 'collectors'
          },
          {
            model: Oficina,
            as: 'oficinas',
            attributes: ['id', 'nombre'],
            through: { attributes: [] }
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