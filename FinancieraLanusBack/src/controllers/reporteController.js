import {
  CreditoDetalle,
  Credito,
  Collector,
  PagoCuota
} from '../models/index.js';

import {
  Op
} from 'sequelize';


/*
=====================================================
HELPERS
=====================================================
*/

const numero = value =>
  Number(value || 0);


const porcentaje = (
  recaudado,
  esperado
) => {

  if (!esperado) {
    return 0;
  }

  return Number(
    (
      (recaudado / esperado) *
      100
    ).toFixed(2)
  );
};


/*
=====================================================
RESUMEN DE RECAUDACION
=====================================================

GET /api/reportes/recaudacion

Query params:

fechaDesde=2026-08-01
fechaHasta=2026-08-10
cobradorId=UUID

cobradorId es opcional.

=====================================================
*/

export const getResumenRecaudacion =
  async (
    req,
    res,
    next
  ) => {

    try {

      const {
        fechaDesde,
        fechaHasta,
        cobradorId
      } = req.query;


      /*
      =================================================
      VALIDACIONES
      =================================================
      */

      if (
        !fechaDesde ||
        !fechaHasta
      ) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              'Debe indicar fechaDesde y fechaHasta.'
          });
      }


      if (
        fechaDesde >
        fechaHasta
      ) {

        return res
          .status(400)
          .json({
            success: false,
            message:
              'fechaDesde no puede ser mayor que fechaHasta.'
          });
      }


      /*
      =================================================
      FILTRO DE CREDITOS

      El cobrador pertenece al crédito.
      =================================================
      */

      const whereCredito = {
        activo: true
      };


      if (cobradorId) {

        whereCredito.cobradorId =
          cobradorId;
      }


      /*
      =================================================
      A RECAUDAR

      Tomamos las cuotas cuya fechaPagoEsperada
      está dentro del período seleccionado.
      =================================================
      */

      const cuotasEsperadas =
        await CreditoDetalle.findAll({

          where: {

            activo: true,

            fechaPagoEsperada: {
              [Op.between]: [
                fechaDesde,
                fechaHasta
              ]
            }
          },

          attributes: [
            'id',
            'creditoId',
            'numeroCuota',
            'monto',
            'fechaPagoEsperada'
          ],

          include: [
            {
              model: Credito,
              as: 'credito',

              where:
                whereCredito,

              required: true,

              attributes: [
                'id',
                'numeroCredito',
                'cobradorId'
              ],

              include: [
                {
                  model:
                    Collector,

                  as:
                    'cobrador',

                  attributes: [
                    'id',
                    'nombre',
                    'apellido'
                  ]
                }
              ]
            }
          ],

          order: [
            [
              'fechaPagoEsperada',
              'ASC'
            ]
          ]
        });


      /*
      =================================================
      PAGOS REALES

      IMPORTANTE:

      Acá usamos PagoCuota.fecha.

      No usamos CreditoDetalle.fechaPago porque una
      cuota puede tener múltiples pagos.
      =================================================
      */

      const pagos =
        await PagoCuota.findAll({

          where: {

            activo: true,

            fecha: {
              [Op.between]: [
                fechaDesde,
                fechaHasta
              ]
            }
          },

          attributes: [
            'id',
            'cuotaId',
            'fecha',
            'monto',
            'tipoTransaccion'
          ],

          include: [
            {
              model:
                CreditoDetalle,

              as:
                'cuota',

              required: true,

              attributes: [
                'id',
                'creditoId',
                'numeroCuota'
              ],

              include: [
                {
                  model:
                    Credito,

                  as:
                    'credito',

                  where:
                    whereCredito,

                  required:
                    true,

                  attributes: [
                    'id',
                    'numeroCredito',
                    'cobradorId'
                  ],

                  include: [
                    {
                      model:
                        Collector,

                      as:
                        'cobrador',

                      attributes: [
                        'id',
                        'nombre',
                        'apellido'
                      ]
                    }
                  ]
                }
              ]
            }
          ],

          order: [
            [
              'fecha',
              'ASC'
            ]
          ]
        });


      /*
      =================================================
      MAPA DE COBRADORES
      =================================================
      */

      const cobradoresMap =
        new Map();


      const obtenerCobrador =
        (
          id,
          cobrador
        ) => {

          if (!id) {
            return null;
          }


          if (
            !cobradoresMap.has(id)
          ) {

            cobradoresMap.set(
              id,
              {
                id,

                nombre:
                  cobrador
                    ? `${cobrador.apellido || ''} ${cobrador.nombre || ''}`
                        .trim()
                    : 'Sin cobrador',

                aRecaudar: 0,

                recaudado: 0,

                efectivo: 0,

                transferencia: 0,

                diferencia: 0,

                porcentajeRecaudacion:
                  0,

                cantidadCuotas:
                  0,

                cantidadPagos:
                  0
              }
            );
          }


          return cobradoresMap.get(
            id
          );
        };


      /*
      =================================================
      PROCESAR A RECAUDAR
      =================================================
      */

      let totalARecaudar = 0;


      for (
        const cuota
        of cuotasEsperadas
      ) {

        const credito =
          cuota.credito;

        if (!credito) {
          continue;
        }


        const monto =
          numero(
            cuota.monto
          );


        totalARecaudar +=
          monto;


        const cobrador =
          obtenerCobrador(
            credito.cobradorId,
            credito.cobrador
          );


        if (cobrador) {

          cobrador.aRecaudar +=
            monto;

          cobrador.cantidadCuotas +=
            1;
        }
      }


      /*
      =================================================
      PROCESAR PAGOS
      =================================================
      */

      let totalRecaudado = 0;

      let totalEfectivo = 0;

      let totalTransferencia = 0;


      for (
        const pago
        of pagos
      ) {

        const credito =
          pago.cuota
            ?.credito;


        if (!credito) {
          continue;
        }


        const monto =
          numero(
            pago.monto
          );


        totalRecaudado +=
          monto;


        if (
          pago.tipoTransaccion ===
          'TRANSFERENCIA'
        ) {

          totalTransferencia +=
            monto;

        } else {

          totalEfectivo +=
            monto;
        }


        const cobrador =
          obtenerCobrador(
            credito.cobradorId,
            credito.cobrador
          );


        if (cobrador) {

          cobrador.recaudado +=
            monto;

          cobrador.cantidadPagos +=
            1;


          if (
            pago.tipoTransaccion ===
            'TRANSFERENCIA'
          ) {

            cobrador.transferencia +=
              monto;

          } else {

            cobrador.efectivo +=
              monto;
          }
        }
      }


      /*
      =================================================
      FINALIZAR COBRADORES
      =================================================
      */

      const cobradores =
        Array.from(
          cobradoresMap.values()
        )
          .map(
            cobrador => {

              cobrador.diferencia =
                cobrador.aRecaudar -
                cobrador.recaudado;


              cobrador
                .porcentajeRecaudacion =
                porcentaje(
                  cobrador.recaudado,
                  cobrador.aRecaudar
                );


              return cobrador;
            }
          )
          .sort(
            (
              a,
              b
            ) =>
              b.recaudado -
              a.recaudado
          );


      /*
      =================================================
      EVOLUCION DIARIA
      =================================================
      */

      const diasMap =
        new Map();


      const obtenerDia =
        fecha => {

          if (
            !diasMap.has(fecha)
          ) {

            diasMap.set(
              fecha,
              {
                fecha,

                aRecaudar: 0,

                recaudado: 0,

                efectivo: 0,

                transferencia: 0,

                diferencia: 0
              }
            );
          }


          return diasMap.get(
            fecha
          );
        };


      /*
      A recaudar por fecha esperada
      */

      for (
        const cuota
        of cuotasEsperadas
      ) {

        const fecha =
          cuota.fechaPagoEsperada;


        const dia =
          obtenerDia(
            fecha
          );


        dia.aRecaudar +=
          numero(
            cuota.monto
          );
      }


      /*
      Recaudado por fecha real del pago
      */

      for (
        const pago
        of pagos
      ) {

        const dia =
          obtenerDia(
            pago.fecha
          );


        const monto =
          numero(
            pago.monto
          );


        dia.recaudado +=
          monto;


        if (
          pago.tipoTransaccion ===
          'TRANSFERENCIA'
        ) {

          dia.transferencia +=
            monto;

        } else {

          dia.efectivo +=
            monto;
        }
      }


      const porDia =
        Array.from(
          diasMap.values()
        )
          .map(
            dia => ({

              ...dia,

              diferencia:
                dia.aRecaudar -
                dia.recaudado,

              porcentajeRecaudacion:
                porcentaje(
                  dia.recaudado,
                  dia.aRecaudar
                )
            })
          )
          .sort(
            (
              a,
              b
            ) =>
              a.fecha.localeCompare(
                b.fecha
              )
          );


      /*
      =================================================
      RESUMEN GENERAL
      =================================================
      */

      const diferencia =
        totalARecaudar -
        totalRecaudado;


      const porcentajeRecaudacion =
        porcentaje(
          totalRecaudado,
          totalARecaudar
        );


      /*
      =================================================
      RESPONSE
      =================================================
      */

      return res.json({

        success: true,

        data: {

          filtros: {

            fechaDesde,

            fechaHasta,

            cobradorId:
              cobradorId ||
              null
          },


          resumen: {

            aRecaudar:
              totalARecaudar,

            recaudado:
              totalRecaudado,

            efectivo:
              totalEfectivo,

            transferencia:
              totalTransferencia,

            diferencia,

            porcentajeRecaudacion
          },


          cobradores,

          porDia
        }
      });


    } catch (error) {

      next(error);
    }
  };