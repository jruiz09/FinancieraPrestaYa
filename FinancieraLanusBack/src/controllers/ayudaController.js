import { Ayuda, Collector, Supervisor } from '../models/index.js';
import { obtenerOficinaIdsPermitidos } from '../utils/oficinaScope.js';

export const createAyuda = async (req, res, next) => {
  try {
    /*
    Mismo esquema de numeración que crearAyudaMobile: sin esto,
    las ayudas dadas de oficina quedaban con numeroAyuda en null.
    */
    const numeroAyuda = String(
      (await Ayuda.count()) + 1
    ).padStart(6, '0');

    const ayuda = await Ayuda.create({
      ...req.body,
      numeroAyuda,
    });

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

    /*
    origenId/destinoId son polimórficos (Collector o
    Supervisor, según origenTipo/destinoTipo) y Ayuda no tiene
    ownerId propio, así que el filtro de owner/oficina se hace
    acá, contra la entidad real resuelta en el include. Una
    ayuda es visible si CUALQUIERA de sus dos lados (origen o
    destino) cae en una oficina permitida, igual criterio que
    ya usa el resumen de Caja para "ayuda recibida"/"ayuda
    dada".
    */
    const oficinaIdsPermitidos =
      await obtenerOficinaIdsPermitidos(req.user)

    const ayudasVisibles = ayudas.filter(ayuda => {

      const origen =
        ayuda.origenCobrador || ayuda.origenSupervisor

      const destino =
        ayuda.destinoCobrador || ayuda.destinoSupervisor

      const entidadOwner = origen || destino

      if (
        !entidadOwner ||
        entidadOwner.ownerId !== req.user.ownerId
      ) {
        return false
      }

      if (oficinaIdsPermitidos === null) {
        return true
      }

      return (
        (origen && oficinaIdsPermitidos.includes(origen.oficinaId)) ||
        (destino && oficinaIdsPermitidos.includes(destino.oficinaId))
      )

    })

    return res.json({

      success: true,

      data: ayudasVisibles

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