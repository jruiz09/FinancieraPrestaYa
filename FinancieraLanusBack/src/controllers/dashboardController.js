import {
  Credito,
  CreditoDetalle,
  Client,
  Collector
} from '../models/index.js';

import { Op } from 'sequelize';
import { actualizarCuotasVencidas } from './creditoController.js';

import {
  obtenerZonasYCobradores,
  calcularVencimientosPorZona,
  calcularCobranzaPorZona
} from './informeDiarioController.js';

const numero = value => Number(value || 0);

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

export const getResumenPorZona = async (
  req,
  res,
  next
) => {

  try {

    await actualizarCuotasVencidas();

    const zoneIdsFiltro =
      req.query.zoneIds
        ? req.query.zoneIds
            .split(',')
            .map(id => id.trim())
            .filter(Boolean)
        : [];

    const hoy =
      new Date()
        .toISOString()
        .split('T')[0];

    const {
      zonas,
      collectorZonaMap,
      todosLosCollectorIds
    } = await obtenerZonasYCobradores(
      req.user.ownerId
    );

    const zonasFiltradas =
      zoneIdsFiltro.length
        ? zonas.filter(
            zona =>
              zoneIdsFiltro.includes(zona.id)
          )
        : zonas;

    const collectorIdsFiltrados =
      zonasFiltradas.flatMap(
        zona =>
          zona.collectors.map(
            collector => collector.id
          )
      );

    const {
      cuotasDetalle: cuotasVencenHoy
    } = await calcularVencimientosPorZona(
      collectorIdsFiltrados,
      collectorZonaMap,
      hoy,
      hoy
    );

    const {
      puntosPorZona,
      clientesConCuotaPorZona
    } = await calcularCobranzaPorZona(
      cuotasVencenHoy
    );

    const creditos =
      collectorIdsFiltrados.length
        ? await Credito.findAll({
            where: {
              activo: true,
              ownerId: req.user.ownerId,
              cobradorId: collectorIdsFiltrados
            },
            include: [
              {
                association: 'cuotas',
                attributes: ['montoPago']
              }
            ],
            attributes: [
              'id',
              'montoFinal',
              'estado',
              'cobradorId'
            ]
          })
        : [];

    const acumPorZona = new Map();

    for (const credito of creditos) {

      const zonaId =
        collectorZonaMap.get(credito.cobradorId);

      if (!zonaId) continue;

      if (!acumPorZona.has(zonaId)) {

        acumPorZona.set(zonaId, {
          cobrado: 0,
          saldoPendiente: 0,
          totalCreditos: 0,
          enCurso: 0,
          finalizados: 0,
          nuevos: 0
        });
      }

      const acc = acumPorZona.get(zonaId);

      const cobrado =
        credito.cuotas.reduce(
          (total, cuota) =>
            total + numero(cuota.montoPago),
          0
        );

      acc.cobrado += cobrado;
      acc.saldoPendiente +=
        numero(credito.montoFinal) - cobrado;
      acc.totalCreditos += 1;

      if (credito.estado === 'EN_CURSO') {
        acc.enCurso += 1;
      } else if (credito.estado === 'FINALIZADO') {
        acc.finalizados += 1;
      } else if (credito.estado === 'NUEVO') {
        acc.nuevos += 1;
      }
    }

    const data = zonasFiltradas.map(zona => {

      const acc =
        acumPorZona.get(zona.id) || {
          cobrado: 0,
          saldoPendiente: 0,
          totalCreditos: 0,
          enCurso: 0,
          finalizados: 0,
          nuevos: 0
        };

      const puntos =
        numero(puntosPorZona.get(zona.id));

      const clientesConCuota =
        numero(
          clientesConCuotaPorZona.get(zona.id)
        );

      const porcentajeCobranza =
        clientesConCuota > 0
          ? Number(
              (
                (puntos / clientesConCuota) *
                100
              ).toFixed(2)
            )
          : null;

      return {
        zoneId: zona.id,
        zona: zona.nombre,
        cobrado: acc.cobrado,
        saldoPendiente: acc.saldoPendiente,
        totalCreditos: acc.totalCreditos,
        enCurso: acc.enCurso,
        finalizados: acc.finalizados,
        nuevos: acc.nuevos,
        porcentajeCobranza
      };
    });

    res.json({
      success: true,
      data
    });

  } catch (error) {

    next(error);

  }
};