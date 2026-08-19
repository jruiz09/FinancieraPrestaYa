import {
  Credito
} from '../models/index.js';


export const getCreditoPublico =
async (
  req,
  res,
  next
) => {

  try {

    const credito =
      await Credito.findOne({

        where: {
          tokenConsulta:
            req.params.token
        },

        include: [
          'cliente',
          'cobrador',
          'tipoPlan',
          'cuotas'
        ]

      });


    if (!credito) {

      return res
        .status(404)
        .json({
          success: false,
          message:
            'Crédito no encontrado'
        });

    }


    res.json({
      success: true,
      data: credito
    });


  } catch (error) {

    next(error);

  }

};