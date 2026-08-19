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

    const { count, rows } =
      await Credito.findAndCountAll({
        where: {
          activo: true
        },

        include: [
          'cliente',
          'cobrador',
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
        creditos
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
      montoPago,
      tipoTransaccion,
      observaciones,
      fechaPago
    } = req.body;

    /*
    =====================================================
    VALIDAR MONTO
    =====================================================
    */

    const montoIngresado =
      Number(montoPago);

    if (
      !Number.isFinite(montoIngresado) ||
      montoIngresado <= 0
    ) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          'El monto debe ser mayor a cero.'
      });
    }

    /*
    =====================================================
    VALIDAR TIPO DE TRANSACCION
    =====================================================
    */

    const tiposPermitidos = [
      'EFECTIVO',
      'TRANSFERENCIA'
    ];

    const tipoPago =
      tipoTransaccion ||
      'EFECTIVO';

    if (
      !tiposPermitidos.includes(
        tipoPago
      )
    ) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          'Tipo de transacción inválido.'
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

    if (
      montoIngresado >
      saldoPendiente
    ) {

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          `El pago supera el saldo pendiente de $${saldoPendiente.toLocaleString('es-AR')}`
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
    CREAR MOVIMIENTO DE PAGO
    =====================================================
    */

    const pago =
      await PagoCuota.create(
        {
          cuotaId:
            cuota.id,

          fecha:
            fechaMovimiento,

          monto:
            montoIngresado,

          tipoTransaccion:
            tipoPago,

          observaciones:
            observaciones || null,

          activo:
            true
        },
        {
          transaction
        }
      );

    /*
    =====================================================
    ACTUALIZAR ACUMULADO DE LA CUOTA
    =====================================================
    */

    const nuevoMontoPago =
      montoPagadoActual +
      montoIngresado;

    cuota.montoPago =
      nuevoMontoPago;

    /*
    Estos campos quedan por compatibilidad
    con el sistema actual.

    Representan el ULTIMO pago realizado.
    */

    cuota.tipoTransaccion =
      tipoPago;

    cuota.observaciones =
      observaciones || null;

    cuota.fechaPago =
      fechaMovimiento;

    /*
    =====================================================
    ESTADO DE LA CUOTA
    =====================================================
    */

    if (
      nuevoMontoPago >=
      montoCuota
    ) {

      cuota.estado =
        'PAGADA';

    } else {

      cuota.estado =
        'PARCIAL';
    }

    await cuota.save({
      transaction
    });

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
        'Pago registrado correctamente.',

      data: {

        pago: {
          id:
            pago.id,

          fecha:
            pago.fecha,

          monto:
            Number(pago.monto),

          tipoTransaccion:
            pago.tipoTransaccion
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

        credito: {
          id:
            credito.id,

          estado:
            credito.estado
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

    const { count, rows } =
      await CreditoDetalle.findAndCountAll({

        where,

        include: [
          {
            model: Credito,
            as: 'credito',

            attributes: [
              'id',
              'numeroCredito',
              'cantidadCuotas'
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
        cuotas
      }
    });

  } catch (error) {

    next(error);

  }
};