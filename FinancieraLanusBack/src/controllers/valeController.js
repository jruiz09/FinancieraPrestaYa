import {
  Vale,
  Collector,
  Supervisor,
  User,
  sequelize
} from '../models/index.js';

import { ROLES } from '../config/auth.js';

const ROLES_QUE_OTORGAN = [
  ROLES.ADMIN,
  ROLES.ADMINISTRATIVO
];

const generarNumeroVale = async transaction => {

  const ultimo =
    await Vale.findOne({
      order: [
        ['createdAt', 'DESC']
      ],
      transaction
    });

  const ultimoNumero =
    ultimo
      ? parseInt(
          ultimo.numero.replace('V-', ''),
          10
        )
      : 0;

  const siguiente =
    ultimoNumero + 1;

  return `V-${String(siguiente).padStart(4, '0')}`;
};

export const createVale = async (req, res, next) => {

  const transaction =
    await sequelize.transaction();

  try {

    const rolUsuario =
      req.user.role?.name;

    if (!ROLES_QUE_OTORGAN.includes(rolUsuario)) {

      await transaction.rollback();

      return res.status(403).json({
        success: false,
        message: 'No tenés permiso para otorgar vales.'
      });
    }

    const {
      fecha,
      tipo,
      monto,
      observaciones,
      collectorId,
      supervisorId
    } = req.body;

    if (
      (!collectorId && !supervisorId) ||
      (collectorId && supervisorId)
    ) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: 'Debe indicar un cobrador o un supervisor (no ambos).'
      });
    }

    let collector = null;
    let supervisor = null;

    if (collectorId) {

      collector =
        await Collector.findByPk(collectorId, { transaction });

      if (
        !collector ||
        collector.ownerId !== req.user.ownerId
      ) {

        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: 'Cobrador inválido.'
        });
      }
    }

    if (supervisorId) {

      supervisor =
        await Supervisor.findByPk(supervisorId, { transaction });

      if (
        !supervisor ||
        supervisor.ownerId !== req.user.ownerId
      ) {

        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: 'Supervisor inválido.'
        });
      }
    }

    const numero =
      await generarNumeroVale(transaction);

    const vale =
      await Vale.create(
        {
          numero,
          fecha,
          ownerId: req.user.ownerId,
          collectorId: collector?.id || null,
          supervisorId: supervisor?.id || null,
          tipo,
          monto,
          observaciones: observaciones || null,
          usuarioEntregaId: req.user.id,
          usuarioRecepcionId:
            collector?.userId ||
            supervisor?.userId ||
            null
        },
        { transaction }
      );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      data: vale
    });

  } catch (error) {

    if (!transaction.finished) {
      await transaction.rollback();
    }

    next(error);
  }
};

export const listVales = async (req, res, next) => {

  try {

    const vales =
      await Vale.findAll({

        where: {
          ownerId: req.user.ownerId,
          activo: true
        },

        include: [
          {
            model: Collector,
            as: 'collector',
            attributes: ['id', 'nombre', 'apellido']
          },
          {
            model: Supervisor,
            as: 'supervisor',
            attributes: ['id', 'nombre', 'apellido']
          },
          {
            model: User,
            as: 'usuarioEntrega',
            attributes: ['id', 'name']
          }
        ],

        order: [
          ['fecha', 'DESC'],
          ['createdAt', 'DESC']
        ]
      });

    return res.json({
      success: true,
      data: vales
    });

  } catch (error) {

    next(error);
  }
};

export const anularVale = async (req, res, next) => {

  try {

    const rolUsuario =
      req.user.role?.name;

    if (!ROLES_QUE_OTORGAN.includes(rolUsuario)) {

      return res.status(403).json({
        success: false,
        message: 'No tenés permiso para anular vales.'
      });
    }

    const vale =
      await Vale.findOne({
        where: {
          id: req.params.id,
          ownerId: req.user.ownerId
        }
      });

    if (!vale) {

      return res.status(404).json({
        success: false,
        message: 'Vale no encontrado.'
      });
    }

    if (vale.estado === 'ANULADO') {

      return res.status(400).json({
        success: false,
        message: 'El vale ya está anulado.'
      });
    }

    vale.estado = 'ANULADO';

    await vale.save();

    return res.json({
      success: true,
      data: vale
    });

  } catch (error) {

    next(error);
  }
};
