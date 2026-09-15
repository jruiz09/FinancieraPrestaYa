import { Notificacion } from '../models/index.js';

export const listNotificaciones = async (
  req,
  res,
  next
) => {

  try {

    const ownerId = req.user.ownerId;

    const notificaciones =
      await Notificacion.findAll({
        where: { ownerId },
        order: [['createdAt', 'DESC']],
        limit: 20
      });

    const noLeidas =
      await Notificacion.count({
        where: {
          ownerId,
          leida: false
        }
      });

    res.json({
      success: true,
      data: {
        notificaciones,
        noLeidas
      }
    });

  } catch (error) {

    next(error);

  }

};

export const marcarNotificacionLeida = async (
  req,
  res,
  next
) => {

  try {

    const notificacion =
      await Notificacion.findByPk(
        req.params.id
      );

    if (
      !notificacion ||
      notificacion.ownerId !== req.user.ownerId
    ) {

      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada.'
      });

    }

    notificacion.leida = true;

    await notificacion.save();

    res.json({
      success: true,
      data: notificacion
    });

  } catch (error) {

    next(error);

  }

};

export const marcarTodasLeidas = async (
  req,
  res,
  next
) => {

  try {

    await Notificacion.update(
      { leida: true },
      {
        where: {
          ownerId: req.user.ownerId,
          leida: false
        }
      }
    );

    res.json({
      success: true
    });

  } catch (error) {

    next(error);

  }

};
