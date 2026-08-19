import {
  Credito,
  CreditoDetalle,
  Client,
  Collector
} from '../models/index.js';

import { Op } from 'sequelize';
import { actualizarCuotasVencidas } from './creditoController.js';

export const getResumenDashboard =
  async (
    req,
    res,
    next
  ) => {

    try {

      await actualizarCuotasVencidas();

      const hoy =
        new Date()
          .toISOString()
          .split('T')[0];

      const creditosActivos =
        await Credito.count({
          where: {
            estado: {
              [Op.in]: [
                'NUEVO',
                'EN_CURSO'
              ]
            }
          }
        });

      const clientesActivos =
        await Client.count({
          where: {
            activo: true
          }
        });

      const cobradoresActivos =
        await Collector.count({
          where: {
            activo: true
          }
        });

      const creditos =
        await Credito.findAll({
          attributes: [
            'montoFinal'
          ]
        });

      const capitalPrestado =
        creditos.reduce(
          (total, credito) =>
            total +
            Number(
              credito.montoFinal || 0
            ),
          0
        );

      const cuotas =
        await CreditoDetalle.findAll();

      let saldoCobrar = 0;
      let moraTotal = 0;

      let cuotasPendientes = 0;
      let cuotasVencidas = 0;

      cuotas.forEach(
        (cuota) => {

          const saldo =
            Number(cuota.monto) -
            Number(cuota.montoPago || 0);

          saldoCobrar += saldo;

          if (
            cuota.estado ===
            'VENCIDA'
          ) {

            moraTotal += saldo;
            cuotasVencidas++;
          }

          if (
            cuota.estado === 'PENDIENTE' ||
            cuota.estado === 'PARCIAL'
          ) {

            cuotasPendientes++;
          }
        }
      );

      const pagosHoy =
        await CreditoDetalle.findAll({
          where: {
            fechaPago: hoy
          }
        });

      const cobradoHoy =
        pagosHoy.reduce(
          (total, cuota) =>
            total +
            Number(
              cuota.montoPago || 0
            ),
          0
        );

      const ultimosCreditos =
        await Credito.findAll({

          include: [
            {
              association: 'cliente',
              attributes: [
                'nombre',
                'apellido'
              ]
            }
          ],

          attributes: [
            'id',
            'numeroCredito',
            'montoFinal',
            'createdAt',
            'estado'
          ],

          order: [
            ['createdAt', 'DESC']
          ],

          limit: 5
        });

      const topMorosos =
        await CreditoDetalle.findAll({

          where: {
            estado: 'VENCIDA'
          },

          include: [
            {
              association: 'credito',

              attributes: [
                'id',
                'numeroCredito'
              ],

              include: [
                {
                  association: 'cliente',

                  attributes: [
                    'nombre',
                    'apellido'
                  ]
                }
              ]
            }
          ],

          order: [
            ['fechaVencimiento', 'ASC']
          ],

          limit: 5
        });

      return res.json({
        success: true,

        data: {

          capitalPrestado,

          saldoCobrar,

          cobradoHoy,

          moraTotal,

          creditosActivos,

          cuotasPendientes,

          cuotasVencidas,

          clientesActivos,

          cobradoresActivos,

          ultimosCreditos,

          topMorosos
        }
      });

    } catch (error) {

      next(error);

    }
  };