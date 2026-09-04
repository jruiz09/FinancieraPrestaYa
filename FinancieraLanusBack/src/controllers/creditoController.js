import {
  Credito,
  CreditoDetalle,
  Client,
  TipoPlan,
  DiaNoLaborable,
  sequelize,
  PagoCuota
} from '../models/index.js';
import crypto from 'crypto';

import { Op } from 'sequelize';

import { calcularCuotasAfectadas } from '../services/pagoCuotaService.js';

const canViewAllOwners = (user) => user.permissions?.includes('OWNERS_VIEW');


export const actualizarCuotasVencidas =
  async () => {

    await CreditoDetalle.update(
      {
        estado: 'VENCIDA'
      },
      {
        where: {
          estado: {
            [Op.in]: [
              'PENDIENTE',
              'PARCIAL'
            ]
          },
          fechaVencimiento: {
            [Op.lt]: new Date()
          }
        }
      }
    );
  };

const parseFecha = (fecha) => {

  const [
    anio,
    mes,
    dia
  ] = fecha
      .split('-')
      .map(Number);

  return new Date(
    anio,
    mes - 1,
    dia
  );
};

const esDiaHabil = async (fecha) => {
  const dia = fecha.getDay();

  if (dia === 0 || dia === 6) {
    return false;
  }

  const fechaString = fecha.toISOString().split('T')[0];

  const noLaborable = await DiaNoLaborable.findOne({
    where: {
      fecha: fechaString,
      activo: true
    }
  });

  return !noLaborable;
};

const obtenerProximoDiaHabil = async (fecha) => {
  let nuevaFecha = new Date(fecha);

  while (!(await esDiaHabil(nuevaFecha))) {
    nuevaFecha.setDate(
      nuevaFecha.getDate() + 1
    );
  }

  return nuevaFecha;
};


export const listCreditos = async (
  req,
  res,
  next
) => {

  try {

    await actualizarCuotasVencidas();

    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      parseInt(req.query.limit) || 10,
      100
    );

    const offset =
      (page - 1) * limit;

    const where = {
      activo: true
    };

    if (!canViewAllOwners(req.user)) {
      where.ownerId = req.user.ownerId;
    } else if (req.query.ownerId) {
      where.ownerId = req.query.ownerId;
    }

    const zoneIds = req.query.zoneIds
      ? req.query.zoneIds
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

    const cobradorInclude = zoneIds.length
      ? {
          association: 'cobrador',
          where: {
            zoneId: {
              [Op.in]: zoneIds
            }
          }
        }
      : 'cobrador';

    const { count, rows } =
      await Credito.findAndCountAll({
        where,

        include: [
          'cliente',
          cobradorInclude,
          'tipoPlan',
          {
            association: 'cuotas',
            attributes: [
              'montoPago',
              'estado'
            ]
          }
        ],

        limit,
        offset,

        order: [
          ['createdAt', 'DESC']
        ]
      });

    const resumenPorEstado =
      await Credito.findAll({
        where,

        include: [
          {
            association: 'cobrador',
            attributes: [],
            where: zoneIds.length
              ? {
                  zoneId: {
                    [Op.in]: zoneIds
                  }
                }
              : undefined
          }
        ],

        attributes: [
          'estado',
          [
            sequelize.fn(
              'COUNT',
              sequelize.col('Creditos.id')
            ),
            'cantidad'
          ]
        ],

        group: ['estado'],
        raw: true
      });

    const resumen = resumenPorEstado.reduce(
      (acc, fila) => {
        const cantidad = Number(fila.cantidad);

        acc.total += cantidad;

        if (fila.estado === 'EN_CURSO') {
          acc.enCurso = cantidad;
        } else if (fila.estado === 'FINALIZADO') {
          acc.finalizados = cantidad;
        } else if (fila.estado === 'NUEVO') {
          acc.nuevos = cantidad;
        }

        return acc;
      },
      {
        total: 0,
        enCurso: 0,
        finalizados: 0,
        nuevos: 0
      }
    );

    const creditos =
      rows.map((credito) => {

        const montoCobrado =
          credito.cuotas.reduce(
            (total, cuota) =>
              total +
              Number(
                cuota.montoPago || 0
              ),
            0
          );

        const saldoPendiente =
          Number(
            credito.montoFinal
          ) -
          montoCobrado;

        const cantidadPagadas =
          credito.cuotas.filter(
            cuota =>
              cuota.estado ===
              'PAGADA'
          ).length;

        const cantidadPendientes =
          credito.cuotas.filter(
            cuota =>
              cuota.estado !==
              'PAGADA'
          ).length;

        const porcentajeAvance =
          Number(
            credito.cantidadCuotas
          ) > 0
            ? Math.round(
                (
                  cantidadPagadas *
                  100
                ) /
                Number(
                  credito.cantidadCuotas
                )
              )
            : 0;

        return {

          ...credito.toJSON(),

          montoCobrado,

          saldoPendiente,

          cantidadPagadas,

          cantidadPendientes,

          porcentajeAvance
        };
      });

    res.json({
      success: true,

      data: {
        total: count,
        page,
        limit,
        creditos,
        resumen
      }
    });

  } catch (error) {

    next(error);

  }
};


export const getCredito = async (req, res, next) => {
  try {
await actualizarCuotasVencidas();
    const credito =
      await Credito.findByPk(
        req.params.id,
        {
          include: [
            'cliente',
            'cobrador',
            'tipoPlan',
            'cuotas'
          ]
        }
      );

    if (!credito || !credito.activo) {
      return res.status(404).json({
        success: false,
        message: 'Crédito no encontrado.'
      });
    }

    if (
      !canViewAllOwners(req.user) &&
      credito.ownerId !== req.user.ownerId
    ) {
      return res.status(404).json({
        success: false,
        message: 'Crédito no encontrado.'
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


export const createCredito = async (
  req,
  res,
  next
) => {

  const transaction =
    await sequelize.transaction();

  try {

    const {
      clienteId,
      tipoPlanId,
      cantidadCuotas,
      montoCredito,
      interes,
      diasGracia,
      tipoTransaccion,
      fechaOtorgamiento,
      observaciones
    } = req.body;

    const cliente =
      await Client.findByPk(
        clienteId
      );

    if (!cliente) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: 'Cliente inválido.'
      });
    }

    const tipoPlan =
      await TipoPlan.findByPk(
        tipoPlanId
      );

    if (!tipoPlan) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: 'Tipo de plan inválido.'
      });
    }

   const fechaInicial =
  await obtenerProximoDiaHabil(
    parseFecha(fechaOtorgamiento)
  );

    if (
      fechaInicial.toISOString().split('T')[0]
      !==
      fechaOtorgamiento
    ) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          'La fecha de otorgamiento debe ser un día hábil.'
      });
    }

    const montoFinal =
      Number(montoCredito) +
      (
        Number(montoCredito)
        *
        Number(interes)
        / 100
      );

    let valorCuota =
      montoFinal /
      Number(cantidadCuotas);

    valorCuota =
      Math.ceil(
        valorCuota / 50
      ) * 50;

const ultimoCredito =
  await Credito.findOne({
    order: [
      ['numeroCredito', 'DESC']
    ],
    transaction
  });

const numeroCredito =
  ultimoCredito
    ? ultimoCredito.numeroCredito + 1
    : 1;

const tokenConsulta =
  crypto
    .randomBytes(24)
    .toString('hex');

 const credito =
  await Credito.create(
    {
      numeroCredito,

    tokenConsulta,
          ownerId:
            cliente.ownerId,

          clienteId:
            cliente.id,

          cobradorId:
            cliente.cobradorId,

          tipoPlanId,

          cantidadCuotas,

          montoCredito,

          interes,

          diasGracia,

          montoFinal,

          valorCuota,

          tipoTransaccion,

          fechaOtorgamiento,

          observaciones,

          estado: 'NUEVO'
        },
        {
          transaction
        }
      );

  let fechaBase =
  parseFecha(
    fechaOtorgamiento
  );

    for (
      let cuota = 1;
      cuota <= Number(cantidadCuotas);
      cuota++
    ) {

      fechaBase.setDate(
        fechaBase.getDate() +
        Number(tipoPlan.dias)
      );

      fechaBase =
        await obtenerProximoDiaHabil(
          fechaBase
        );

      const fechaPagoEsperada =
        new Date(fechaBase);

      let fechaVencimiento =
        new Date(
          fechaPagoEsperada
        );

      fechaVencimiento.setDate(
        fechaVencimiento.getDate() +
        Number(
          diasGracia || 0
        )
      );

      fechaVencimiento =
        await obtenerProximoDiaHabil(
          fechaVencimiento
        );

      await CreditoDetalle.create(
        {
          creditoId:
            credito.id,

          numeroCuota:
            cuota,

          monto:
            valorCuota,

          montoPago: 0,

          fechaPagoEsperada,

          fechaVencimiento,

          tipoTransaccion,

          estado:
            'PENDIENTE'
        },
        {
          transaction
        }
      );
    }

    await transaction.commit();

    return res.status(201).json({
      success: true,
      data: credito
    });

  } catch (error) {

    await transaction.rollback();

    next(error);
  }
};


export const deleteCredito = async (
  req,
  res,
  next
) => {
  try {

    const credito =
      await Credito.findByPk(
        req.params.id
      );

    if (!credito || !credito.activo) {
      return res.status(404).json({
        success: false,
        message: 'Crédito no encontrado.'
      });
    }

    credito.activo = false;

    await credito.save();

    res.json({
      success: true,
      message: 'Crédito desactivado.'
    });

  } catch (error) {
    next(error);
  }
};


export const simularCredito = async (
  req,
  res,
  next
) => {
  try {

    const {
      tipoPlanId,
      cantidadCuotas,
      montoCredito,
      interes,
      diasGracia,
      fechaOtorgamiento
    } = req.body;

    const tipoPlan =
      await TipoPlan.findByPk(
        tipoPlanId
      );

    if (!tipoPlan) {
      return res.status(400).json({
        success: false,
        message:
          'Tipo de plan inválido.'
      });
    }

const fechaInicial =
  await obtenerProximoDiaHabil(
    parseFecha(fechaOtorgamiento)
  );

    if (
      fechaInicial
        .toISOString()
        .split('T')[0]
      !==
      fechaOtorgamiento
    ) {
      return res.status(400).json({
        success: false,
        message:
          'La fecha de otorgamiento debe ser un día hábil.'
      });
    }

    const montoFinal =
      Number(montoCredito) +
      (
        Number(montoCredito)
        *
        Number(interes)
        / 100
      );

    let valorCuota =
      montoFinal /
      Number(cantidadCuotas);

    valorCuota =
      Math.ceil(
        valorCuota / 50
      ) * 50;

    const cuotas = [];

let fechaBase =
  parseFecha(
    fechaOtorgamiento
  );

    for (
      let cuota = 1;
      cuota <= Number(cantidadCuotas);
      cuota++
    ) {

      fechaBase.setDate(
        fechaBase.getDate() +
        Number(tipoPlan.dias)
      );

      fechaBase =
        await obtenerProximoDiaHabil(
          fechaBase
        );

      const fechaPagoEsperada =
        new Date(fechaBase);

      let fechaVencimiento =
        new Date(
          fechaPagoEsperada
        );

      fechaVencimiento.setDate(
        fechaVencimiento.getDate() +
        Number(
          diasGracia || 0
        )
      );

      fechaVencimiento =
        await obtenerProximoDiaHabil(
          fechaVencimiento
        );

      cuotas.push({
        numeroCuota: cuota,

        monto: valorCuota,

        fechaPagoEsperada,

        fechaVencimiento
      });
    }

    return res.json({
      success: true,
      data: {
        montoFinal,
        valorCuota,
        cuotas
      }
    });

  } catch (error) {
    next(error);
  }
};


export const registrarPagoCuota = async (
  req,
  res,
  next
) => {

  const transaction =
    await sequelize.transaction();

  try {

    const cuota =
      await CreditoDetalle.findByPk(
        req.params.id,
        {
          transaction,
          lock: transaction.LOCK.UPDATE
        }
      );

    if (!cuota) {

      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: 'Cuota no encontrada.'
      });
    }

    const {
      montoEfectivo,
      montoTransferencia,
      observaciones,
      fechaPago
    } = req.body;

    /*
    =====================================================
    VALIDAR MONTO (split efectivo / transferencia)
    =====================================================
    */

    const efectivo =
      Number(montoEfectivo || 0);

    const transferencia =
      Number(montoTransferencia || 0);

    if (
      !Number.isFinite(efectivo) ||
      !Number.isFinite(transferencia) ||
      efectivo < 0 ||
      transferencia < 0
    ) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          'Los montos de efectivo y transferencia deben ser numéricos y no negativos.'
      });
    }

    const montoIngresado =
      Math.round(
        (efectivo + transferencia) * 100
      ) / 100;

    if (montoIngresado <= 0) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          'El monto debe ser mayor a cero.'
      });
    }

    /*
    =====================================================
    CALCULAR SALDO
    =====================================================
    */

    const montoCuota =
      Number(cuota.monto);

    const montoPagadoActual =
      Number(
        cuota.montoPago || 0
      );

    const saldoPendiente =
      montoCuota -
      montoPagadoActual;

    if (
      saldoPendiente <= 0
    ) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          'La cuota ya se encuentra pagada.'
      });
    }

    /*
    =====================================================
    FECHA DEL PAGO
    =====================================================
    */

    const fechaMovimiento =
      fechaPago ||
      new Date()
        .toISOString()
        .split('T')[0];

    /*
    =====================================================
    CALCULAR CASCADA (cuotas afectadas por el pago)
    =====================================================
    */

    const {
      cuotasObjetivo,
      saldoAFavor
    } = await calcularCuotasAfectadas({
      cuota,
      montoIngresado,
      transaction
    });

    const afectaVariasCuotas =
      cuotasObjetivo.length > 1;

    if (
      afectaVariasCuotas &&
      !req.body.confirmado
    ) {

      await transaction.rollback();

      return res.json({
        success: true,
        requiereConfirmacion: true,
        message:
          `Este pago afecta ${cuotasObjetivo.length} cuotas. Confirmá para continuar.`,
        data: {
          cuotasAfectadas:
            cuotasObjetivo.map(
              ({ cuota: c, aPagar }) => ({
                id: c.id,
                numeroCuota: c.numeroCuota,
                monto: aPagar
              })
            ),
          saldoAFavor
        }
      });
    }

    /*
    =====================================================
    CREAR MOVIMIENTOS DE PAGO Y ACTUALIZAR CUOTAS
    (una cuota puede quedar PAGADA o PARCIAL; puede haber
    más de una cuota involucrada por la cascada)
    =====================================================
    */

    const pagosCreados = [];

    for (const { cuota: c, aPagar } of cuotasObjetivo) {

      /*
      Prorratea el split efectivo/transferencia del pago
      total sobre lo que le corresponde a esta cuota en la
      cascada. El efectivo se calcula por proporción y la
      transferencia se deriva como el resto, para que la
      suma de las dos partes cierre exacto contra "aPagar"
      sin arrastre de redondeo.
      */

      const aPagarEfectivo =
        Math.round(
          (aPagar * efectivo / montoIngresado) * 100
        ) / 100;

      const aPagarTransferencia =
        Math.round(
          (aPagar - aPagarEfectivo) * 100
        ) / 100;

      const partes = [
        { tipo: 'EFECTIVO', monto: aPagarEfectivo },
        { tipo: 'TRANSFERENCIA', monto: aPagarTransferencia }
      ].filter(parte => parte.monto > 0);

      for (const parte of partes) {

        const pagoCuota =
          await PagoCuota.create(
            {
              cuotaId:
                c.id,

              fecha:
                fechaMovimiento,

              monto:
                parte.monto,

              tipoTransaccion:
                parte.tipo,

              observaciones:
                observaciones || null,

              activo:
                true
            },
            {
              transaction
            }
          );

        pagosCreados.push(pagoCuota);

      }

      const nuevoMontoPago =
        Number(c.montoPago || 0) +
        aPagar;

      c.montoPago =
        nuevoMontoPago;

      /*
      Estos campos quedan por compatibilidad
      con el sistema actual.

      Representan el ULTIMO pago realizado. Cuando el pago
      de esta cuota tuvo ambos medios, se guarda 'MIXTO'.
      */

      c.tipoTransaccion =
        partes.length > 1
          ? 'MIXTO'
          : partes[0].tipo;

      c.observaciones =
        observaciones || null;

      c.fechaPago =
        fechaMovimiento;

      c.estado =
        nuevoMontoPago >=
        Number(c.monto)
          ? 'PAGADA'
          : 'PARCIAL';

      await c.save({
        transaction
      });
    }

    /*
    =====================================================
    ACTUALIZAR ESTADO DEL CREDITO
    =====================================================
    */

    const credito =
      await Credito.findByPk(
        cuota.creditoId,
        {
          transaction,
          lock:
            transaction.LOCK.UPDATE
        }
      );

    if (!credito) {

      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message:
          'Crédito no encontrado.'
      });
    }

    /*
    =====================================================
    SALDO A FAVOR
    (sobra monto después de cubrir todas las cuotas
    del crédito: se deja una nota en Credito.observaciones)
    =====================================================
    */

    if (saldoAFavor > 0) {

      const notaSaldoAFavor =
        `[${fechaMovimiento}] Pago registrado con saldo a favor del cliente de $${saldoAFavor.toLocaleString('es-AR')} (excedente sobre el total de cuotas del crédito).`;

      credito.observaciones =
        credito.observaciones
          ? `${credito.observaciones}\n${notaSaldoAFavor}`
          : notaSaldoAFavor;
    }

    const totalCuotas =
      await CreditoDetalle.count({
        where: {
          creditoId:
            credito.id
        },
        transaction
      });

    const cuotasPagadas =
      await CreditoDetalle.count({
        where: {
          creditoId:
            credito.id,
          estado:
            'PAGADA'
        },
        transaction
      });

    credito.estado =
      cuotasPagadas ===
      totalCuotas
        ? 'FINALIZADO'
        : 'EN_CURSO';

    await credito.save({
      transaction
    });

    /*
    =====================================================
    COMMIT
    =====================================================
    */

    await transaction.commit();

    /*
    =====================================================
    RESPONSE
    =====================================================
    */

    return res.json({
      success: true,

      message:
        afectaVariasCuotas
          ? `Pago registrado correctamente. Se aplicó a ${cuotasObjetivo.length} cuotas.`
          : 'Pago registrado correctamente.',

      data: {

        pago: {
          fecha:
            fechaMovimiento,

          monto:
            montoIngresado,

          montoEfectivo:
            efectivo,

          montoTransferencia:
            transferencia
        },

        cuota: {
          id:
            cuota.id,

          estado:
            cuota.estado,

          monto:
            Number(cuota.monto),

          montoPago:
            Number(cuota.montoPago),

          saldo:
            Number(cuota.monto) -
            Number(cuota.montoPago)
        },

        cuotasAfectadas:
          cuotasObjetivo.map(
            ({ cuota: c, aPagar }) => ({
              id: c.id,
              numeroCuota: c.numeroCuota,
              monto: aPagar,
              estado: c.estado
            })
          ),

        saldoAFavor,

        credito: {
          id:
            credito.id,

          estado:
            credito.estado,

          observaciones:
            credito.observaciones
        }
      }
    });

  } catch (error) {

    /*
    Puede ocurrir que el error aparezca
    después de haber realizado rollback.
    */

    if (
      !transaction.finished
    ) {

      await transaction.rollback();
    }

    next(error);
  }
};

export const listCuotas = async (
  req,
  res,
  next
) => {

  try {

 await actualizarCuotasVencidas();

    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      parseInt(req.query.limit) || 20,
      100
    );

    const offset =
      (page - 1) * limit;

    const where = {};

    if (
      req.query.estado &&
      req.query.estado !== 'TODAS'
    ) {

      where.estado =
        req.query.estado;
    }

    const whereCredito = {};

    if (!canViewAllOwners(req.user)) {
      whereCredito.ownerId = req.user.ownerId;
    } else if (req.query.ownerId) {
      whereCredito.ownerId = req.query.ownerId;
    }

    const zoneIds = req.query.zoneIds
      ? req.query.zoneIds
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

    const cobradorIncludeConteos = zoneIds.length
      ? [
          {
            association: 'cobrador',
            attributes: [],
            where: {
              zoneId: {
                [Op.in]: zoneIds
              }
            },
            required: true
          }
        ]
      : [];

    const estadosPosibles = [
      'PENDIENTE',
      'PARCIAL',
      'VENCIDA',
      'PAGADA'
    ];

    const conteosPorEstado =
      await Promise.all(
        estadosPosibles.map(
          (estadoItem) =>
            CreditoDetalle.count({
              where: {
                estado: estadoItem
              },
              include: [
                {
                  model: Credito,
                  as: 'credito',
                  where: whereCredito,
                  required: true,
                  include: cobradorIncludeConteos
                }
              ]
            })
        )
      );

    const counts =
      estadosPosibles.reduce(
        (acc, estadoItem, index) => {
          acc[estadoItem] =
            conteosPorEstado[index];
          return acc;
        },
        {}
      );

    const { count, rows } =
      await CreditoDetalle.findAndCountAll({

        where,

        include: [
          {
            model: Credito,
            as: 'credito',

            where: whereCredito,
            required: true,

            attributes: [
              'id',
              'numeroCredito',
              'cantidadCuotas',
              'observaciones'
            ],

            include: [
              {
                model: Client,
                as: 'cliente',

                attributes: [
                  'id',
                  'nombre',
                  'apellido',
                  'dni',
                  'celular'
                ]
              },
              {
                association: 'cobrador',

                attributes: [
                  'id',
                  'nombre',
                  'apellido'
                ],

                where: zoneIds.length
                  ? {
                      zoneId: {
                        [Op.in]: zoneIds
                      }
                    }
                  : undefined,

                required: zoneIds.length > 0
              }
            ]
          }
        ],

        limit,
        offset,

        order: [
          ['fechaVencimiento', 'ASC']
        ]
      });

    const hoy = new Date();

    const cuotas =
      rows.map((cuota) => {

        const saldo =
          Number(cuota.monto) -
          Number(cuota.montoPago);

        const fechaVencimiento =
          new Date(
            cuota.fechaVencimiento
          );

        const diasAtraso =
          Math.max(
            0,
            Math.floor(
              (
                hoy -
                fechaVencimiento
              ) / 86400000
            )
          );

        return {

          ...cuota.toJSON(),

          saldo,

          diasAtraso
        };
      });

    res.json({
      success: true,

      data: {
        total: count,
        page,
        limit,
        counts,
        cuotas
      }
    });

  } catch (error) {

    next(error);

  }
};