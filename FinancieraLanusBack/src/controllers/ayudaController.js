import { Ayuda, Collector, Supervisor } from '../models/index.js';

export const createAyuda = async (req, res, next) => {
  try {
    const ayuda = await Ayuda.create(req.body);

    return res.status(201).json({
      success: true,
      data: ayuda,
    });
  } catch (error) {
    next(error);
  }
};

export const listAyudas = async (
  req,
  res,
  next
) => {

  try {

    const ayudas =
      await Ayuda.findAll({

        where: {
          activo: true
        },

        include: [

          {
            model: Collector,
            as: 'origenCobrador'
          },

          {
            model: Collector,
            as: 'destinoCobrador'
          },

          {
            model: Supervisor,
            as: 'origenSupervisor'
          },

          {
            model: Supervisor,
            as: 'destinoSupervisor'
          }

        ],

        order: [
          ['fecha', 'DESC']
        ]

      })

    return res.json({

      success: true,

      data: ayudas

    })

  } catch (error) {

    next(error)

  }

}

export const deleteAyuda = async (req, res, next) => {
  try {
    const ayuda = await Ayuda.findByPk(req.params.id);

    if (!ayuda) {
      return res.status(404).json({
        success: false,
      });
    }

    ayuda.activo = false;

    await ayuda.save();

    res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};




export const aceptarAyuda =
  async (req, res, next) => {

    try {

      const ayuda =
        await Ayuda.findByPk(
          req.params.id
        )

      if (!ayuda) {

        return res.status(404)
          .json({
            success: false
          })

      }

      ayuda.estado =
        'ACEPTADA'

      ayuda.fechaAceptacion =
        new Date()

      await ayuda.save()

      res.json({
        success: true,
        data: ayuda
      })

    } catch (error) {

      next(error)

    }

  }



  export const rechazarAyuda =
  async (req, res, next) => {

    try {

      const ayuda =
        await Ayuda.findByPk(
          req.params.id
        )

      if (!ayuda) {

        return res.status(404)
          .json({
            success: false
          })

      }

      ayuda.estado =
        'RECHAZADA'

      ayuda.fechaRechazo =
        new Date()

      ayuda.motivoRechazo =
        req.body.motivoRechazo

      await ayuda.save()

      res.json({
        success: true,
        data: ayuda
      })

    } catch (error) {

      next(error)

    }

  }