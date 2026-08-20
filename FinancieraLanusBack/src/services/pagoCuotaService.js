import { Op } from 'sequelize';

import { CreditoDetalle } from '../models/index.js';

/*
=====================================================
CASCADA DE SOBREPAGO

Cuando el monto ingresado supera el saldo de la cuota
principal, el excedente se distribuye primero entre las
cuotas ANTERIORES impagas del mismo crédito (de la más
vieja a la más nueva) y recién después entre las cuotas
SIGUIENTES impagas, hasta agotar el monto.

Si el monto alcanza para todas las cuotas del crédito y
todavía sobra, ese resto queda como saldo a favor.
=====================================================
*/

export const calcularCuotasAfectadas = async ({
  cuota,
  montoIngresado,
  transaction
}) => {

  const cuotasObjetivo = [];

  let restante = montoIngresado;

  const aplicarACuota = c => {

    if (restante <= 0) return;

    const saldo =
      Number(c.monto) -
      Number(c.montoPago || 0);

    if (saldo <= 0) return;

    const aPagar =
      Math.min(saldo, restante);

    cuotasObjetivo.push({
      cuota: c,
      aPagar
    });

    restante -= aPagar;
  };

  aplicarACuota(cuota);

  if (restante > 0) {

    const anteriores =
      await CreditoDetalle.findAll({
        where: {
          creditoId: cuota.creditoId,
          numeroCuota: {
            [Op.lt]: cuota.numeroCuota
          },
          estado: {
            [Op.ne]: 'PAGADA'
          }
        },
        order: [
          ['numeroCuota', 'ASC']
        ],
        transaction,
        lock: transaction.LOCK.UPDATE
      });

    for (const c of anteriores) {

      if (restante <= 0) break;

      aplicarACuota(c);
    }
  }

  if (restante > 0) {

    const siguientes =
      await CreditoDetalle.findAll({
        where: {
          creditoId: cuota.creditoId,
          numeroCuota: {
            [Op.gt]: cuota.numeroCuota
          },
          estado: {
            [Op.ne]: 'PAGADA'
          }
        },
        order: [
          ['numeroCuota', 'ASC']
        ],
        transaction,
        lock: transaction.LOCK.UPDATE
      });

    for (const c of siguientes) {

      if (restante <= 0) break;

      aplicarACuota(c);
    }
  }

  return {
    cuotasObjetivo,
    saldoAFavor: restante
  };
};
