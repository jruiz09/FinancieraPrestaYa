import { Op } from 'sequelize';

import {
  Zone,
  Collector,
  Credito,
  CreditoDetalle,
  PagoCuota,
  Ayuda,
  Vale,
  RegistroDiarioZona
} from '../models/index.js';

import { ROLES } from '../config/auth.js';

import { obtenerProximoDiaHabil } from '../utils/creditoUtils.js';

const ROLES_QUE_EDITAN = [
  ROLES.ADMIN,
  ROLES.ADMINISTRATIVO
];

const numero = value => Number(value || 0);

const parseFechaLocal = fecha => {

  const [anio, mes, dia] = fecha.split('-').map(Number);

  return new Date(anio, mes - 1, dia);
};

const formatFechaLocal = date => {

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
};

const sumarDias = (fecha, dias) => {

  const date = parseFechaLocal(fecha);

  date.setDate(date.getDate() + dias);

  return formatFechaLocal(date);
};

/*
Próximo día HÁBIL posterior a `fecha` (nunca el mismo día),
salteando fines de semana y Días no laborables.
*/

const diaHabilSiguiente = async fecha => {

  const base = parseFechaLocal(fecha);

  base.setDate(base.getDate() + 1);

  const habil = await obtenerProximoDiaHabil(base);

  return formatFechaLocal(habil);
};

/*
Si `fecha` cae sábado o domingo, devuelve el viernes de esa
misma semana. Se usa para que un cobro/crédito/ayuda/vale
cargado en fin de semana sume en la semana (Lunes-Viernes)
que terminó ese viernes, en vez de la semana siguiente.
*/

const fechaEfectivaSemana = fecha => {

  const date = parseFechaLocal(fecha);
  const dia = date.getDay();

  if (dia === 6) {
    date.setDate(date.getDate() - 1);
  } else if (dia === 0) {
    date.setDate(date.getDate() - 2);
  }

  return formatFechaLocal(date);
};

/*
=====================================================
ZONAS + COBRADORES DEL OWNER
=====================================================
*/

export const obtenerZonasYCobradores = async ownerId => {

  const zonas = await Zone.findAll({
    where: {
      ownerId,
      activa: true
    },
    include: [
      {
        model: Collector,
        as: 'collectors',
        attributes: ['id', 'supervisorId'],
        where: { activo: true },
        required: false
      }
    ],
    order: [['nombre', 'ASC']]
  });

  const collectorZonaMap = new Map();
  const supervisorZonasMap = new Map();
  const todosLosCollectorIds = [];

  for (const zona of zonas) {

    for (const collector of zona.collectors) {

      collectorZonaMap.set(collector.id, zona.id);
      todosLosCollectorIds.push(collector.id);

      if (collector.supervisorId) {

        if (!supervisorZonasMap.has(collector.supervisorId)) {
          supervisorZonasMap.set(collector.supervisorId, new Set());
        }

        supervisorZonasMap.get(collector.supervisorId).add(zona.id);
      }
    }
  }

  return {
    zonas,
    collectorZonaMap,
    supervisorZonasMap,
    todosLosCollectorIds
  };
};

/*
=====================================================
A RECAUDAR (cuotas que vencen en [fechaInicio, fechaFin],
via Credito.cobradorId -> zona). Con fechaInicio = fechaFin
cubre el caso de un solo día.
=====================================================
*/

export const calcularVencimientosPorZona = async (
  todosLosCollectorIds,
  collectorZonaMap,
  fechaInicio,
  fechaFin
) => {

  const porZona = new Map();
  const cuotasDetalle = [];

  if (todosLosCollectorIds.length === 0) {
    return { porZona, cuotasDetalle };
  }

  const cuotas = await CreditoDetalle.findAll({
    where: {
      activo: true,
      fechaVencimiento: { [Op.between]: [fechaInicio, fechaFin] }
    },
    attributes: ['id', 'monto', 'fechaVencimiento'],
    include: [
      {
        model: Credito,
        as: 'credito',
        required: true,
        attributes: ['id', 'cobradorId'],
        where: {
          activo: true,
          cobradorId: todosLosCollectorIds
        }
      }
    ]
  });

  for (const cuota of cuotas) {

    const zonaId = collectorZonaMap.get(cuota.credito.cobradorId);

    if (!zonaId) continue;

    porZona.set(
      zonaId,
      numero(porZona.get(zonaId)) + numero(cuota.monto)
    );

    cuotasDetalle.push({
      id: cuota.id,
      monto: numero(cuota.monto),
      fechaVencimiento: cuota.fechaVencimiento,
      zonaId
    });
  }

  return { porZona, cuotasDetalle };
};

/*
=====================================================
% COBRANZA: promedio por cliente (punto = min(1,
pagado_acumulado_a_la_fecha_de_vencimiento / monto_cuota)),
sobre los clientes con cuota venciendo en el rango, en la zona.
Cada cuota usa SU PROPIO vencimiento como corte ("en la fecha
o antes"), no un corte único — así funciona igual para un
solo día que para un rango de varios días.
=====================================================
*/

export const calcularCobranzaPorZona = async cuotasDelRango => {

  const puntosPorZona = new Map();
  const clientesConCuotaPorZona = new Map();

  if (cuotasDelRango.length === 0) {
    return { puntosPorZona, clientesConCuotaPorZona };
  }

  const cuotaIds = cuotasDelRango.map(c => c.id);

  const pagos = await PagoCuota.findAll({
    where: {
      activo: true,
      cuotaId: cuotaIds
    },
    attributes: ['cuotaId', 'monto', 'fecha']
  });

  const pagosPorCuota = new Map();

  for (const pago of pagos) {

    if (!pagosPorCuota.has(pago.cuotaId)) {
      pagosPorCuota.set(pago.cuotaId, []);
    }

    pagosPorCuota.get(pago.cuotaId).push(pago);
  }

  for (const cuota of cuotasDelRango) {

    const pagosDeEstaCuota = pagosPorCuota.get(cuota.id) || [];

    const pagado = pagosDeEstaCuota
      .filter(pago => pago.fecha <= cuota.fechaVencimiento)
      .reduce((total, pago) => total + numero(pago.monto), 0);

    const punto = cuota.monto > 0
      ? Math.min(1, pagado / cuota.monto)
      : 1;

    puntosPorZona.set(
      cuota.zonaId,
      numero(puntosPorZona.get(cuota.zonaId)) + punto
    );

    clientesConCuotaPorZona.set(
      cuota.zonaId,
      numero(clientesConCuotaPorZona.get(cuota.zonaId)) + 1
    );
  }

  return { puntosPorZona, clientesConCuotaPorZona };
};

/*
=====================================================
ENTREGAS (creditos otorgados en el rango) por capital
otorgado (montoCredito, sin intereses). Devuelve tanto el
total por zona como el detalle por zona+día (con los
otorgados en fin de semana ya "sumados al viernes" de esa
semana), para poder mostrar el desglose día por día.
=====================================================
*/

const calcularEntregasPorZonaYDia = async (
  todosLosCollectorIds,
  collectorZonaMap,
  fechaInicio,
  fechaFin
) => {

  const porZonaYDia = new Map();

  if (todosLosCollectorIds.length === 0) {
    return porZonaYDia;
  }

  const creditos = await Credito.findAll({
    where: {
      activo: true,
      fechaOtorgamiento: { [Op.between]: [fechaInicio, fechaFin] },
      cobradorId: todosLosCollectorIds
    },
    attributes: ['id', 'cobradorId', 'montoCredito', 'fechaOtorgamiento']
  });

  for (const credito of creditos) {

    const zonaId = collectorZonaMap.get(credito.cobradorId);

    if (!zonaId) continue;

    const dia = fechaEfectivaSemana(credito.fechaOtorgamiento);

    if (!porZonaYDia.has(zonaId)) {
      porZonaYDia.set(zonaId, new Map());
    }

    const porDia = porZonaYDia.get(zonaId);

    porDia.set(dia, numero(porDia.get(dia)) + numero(credito.montoCredito));
  }

  return porZonaYDia;
};

/*
=====================================================
CREDITOS TERMINADOS en el rango (última cuota pagada en
el rango), por capital otorgado. Mismo desglose por día
que Entregas, con la misma regla de "fin de semana suma
al viernes".
=====================================================
*/

const calcularTerminadosPorZonaYDia = async (
  todosLosCollectorIds,
  collectorZonaMap,
  fechaInicio,
  fechaFin
) => {

  const porZonaYDia = new Map();

  if (todosLosCollectorIds.length === 0) {
    return porZonaYDia;
  }

  const creditosFinalizados = await Credito.findAll({
    where: {
      activo: true,
      estado: 'FINALIZADO',
      cobradorId: todosLosCollectorIds
    },
    attributes: ['id', 'cobradorId', 'montoCredito', 'cantidadCuotas']
  });

  if (creditosFinalizados.length === 0) {
    return porZonaYDia;
  }

  const ultimasCuotasPagadasEnRango = await CreditoDetalle.findAll({
    where: {
      activo: true,
      creditoId: creditosFinalizados.map(c => c.id),
      estado: 'PAGADA',
      fechaPago: { [Op.between]: [fechaInicio, fechaFin] }
    },
    attributes: ['creditoId', 'numeroCuota', 'fechaPago']
  });

  const ultimaCuotaPorCredito = new Map(
    ultimasCuotasPagadasEnRango.map(c => [c.creditoId, c])
  );

  for (const credito of creditosFinalizados) {

    const ultimaCuota = ultimaCuotaPorCredito.get(credito.id);

    if (!ultimaCuota) continue;
    if (ultimaCuota.numeroCuota !== credito.cantidadCuotas) continue;

    const zonaId = collectorZonaMap.get(credito.cobradorId);

    if (!zonaId) continue;

    const dia = fechaEfectivaSemana(ultimaCuota.fechaPago);

    if (!porZonaYDia.has(zonaId)) {
      porZonaYDia.set(zonaId, new Map());
    }

    const porDia = porZonaYDia.get(zonaId);

    porDia.set(dia, numero(porDia.get(dia)) + numero(credito.montoCredito));
  }

  return porZonaYDia;
};

const totalPorZona = porZonaYDia => {

  const totales = new Map();

  for (const [zonaId, porDia] of porZonaYDia.entries()) {

    let total = 0;

    for (const monto of porDia.values()) {
      total += monto;
    }

    totales.set(zonaId, total);
  }

  return totales;
};

/*
=====================================================
RECAUDADO (PagoCuota en el rango, via cobradorId)
=====================================================
*/

const calcularRecaudadoPorZona = async (
  todosLosCollectorIds,
  collectorZonaMap,
  fechaInicio,
  fechaFin
) => {

  const porZona = new Map();
  const mpPorZona = new Map();
  const dejaPorZona = new Map();

  if (todosLosCollectorIds.length === 0) {
    return { porZona, mpPorZona, dejaPorZona };
  }

  const pagos = await PagoCuota.findAll({
    where: {
      activo: true,
      fecha: { [Op.between]: [fechaInicio, fechaFin] }
    },
    attributes: ['id', 'monto', 'tipoTransaccion'],
    include: [
      {
        model: CreditoDetalle,
        as: 'cuota',
        required: true,
        attributes: ['id'],
        include: [
          {
            model: Credito,
            as: 'credito',
            required: true,
            attributes: ['id', 'cobradorId'],
            where: {
              activo: true,
              cobradorId: todosLosCollectorIds
            }
          }
        ]
      }
    ]
  });

  for (const pago of pagos) {

    const cobradorId = pago.cuota.credito.cobradorId;
    const zonaId = collectorZonaMap.get(cobradorId);

    if (!zonaId) continue;

    porZona.set(
      zonaId,
      numero(porZona.get(zonaId)) + numero(pago.monto)
    );

    /*
    MP = transferencia, DEJA = efectivo (ver Cambio 2:
    cada fila PagoCuota tiene un unico medio de pago,
    el split se traduce en dos filas separadas).
    */

    if (pago.tipoTransaccion === 'TRANSFERENCIA') {

      mpPorZona.set(
        zonaId,
        numero(mpPorZona.get(zonaId)) + numero(pago.monto)
      );

    } else if (pago.tipoTransaccion === 'EFECTIVO') {

      dejaPorZona.set(
        zonaId,
        numero(dejaPorZona.get(zonaId)) + numero(pago.monto)
      );

    }
  }

  return { porZona, mpPorZona, dejaPorZona };
};

/*
=====================================================
MP (transferencia) / DEJA (efectivo) por zona y día,
con el mismo "fin de semana suma al viernes" que ya usan
Entregas/Terminados. Se usa solo en el informe semanal
para el desglose dia por dia; el diario usa el total del
rango de calcularRecaudadoPorZona (un unico dia, sin
necesidad de plegar fin de semana).
=====================================================
*/

const calcularMpDejaPorZonaYDia = async (
  todosLosCollectorIds,
  collectorZonaMap,
  fechaInicio,
  fechaFin
) => {

  const mpPorZonaYDia = new Map();
  const dejaPorZonaYDia = new Map();

  if (todosLosCollectorIds.length === 0) {
    return { mpPorZonaYDia, dejaPorZonaYDia };
  }

  const pagos = await PagoCuota.findAll({
    where: {
      activo: true,
      fecha: { [Op.between]: [fechaInicio, fechaFin] }
    },
    attributes: ['id', 'monto', 'tipoTransaccion', 'fecha'],
    include: [
      {
        model: CreditoDetalle,
        as: 'cuota',
        required: true,
        attributes: ['id'],
        include: [
          {
            model: Credito,
            as: 'credito',
            required: true,
            attributes: ['id', 'cobradorId'],
            where: {
              activo: true,
              cobradorId: todosLosCollectorIds
            }
          }
        ]
      }
    ]
  });

  for (const pago of pagos) {

    const cobradorId = pago.cuota.credito.cobradorId;
    const zonaId = collectorZonaMap.get(cobradorId);

    if (!zonaId) continue;

    if (
      pago.tipoTransaccion !== 'TRANSFERENCIA' &&
      pago.tipoTransaccion !== 'EFECTIVO'
    ) continue;

    const destino =
      pago.tipoTransaccion === 'TRANSFERENCIA'
        ? mpPorZonaYDia
        : dejaPorZonaYDia;

    const dia = fechaEfectivaSemana(pago.fecha);

    if (!destino.has(zonaId)) {
      destino.set(zonaId, new Map());
    }

    const porDia = destino.get(zonaId);

    porDia.set(dia, numero(porDia.get(dia)) + numero(pago.monto));
  }

  return { mpPorZonaYDia, dejaPorZonaYDia };
};

/*
=====================================================
AYUDA recibida / AYUDA A dada (cobradores) en el rango
=====================================================
*/

const calcularAyudaPorZona = async (
  todosLosCollectorIds,
  collectorZonaMap,
  fechaInicio,
  fechaFin
) => {

  const ayudaPorZona = new Map();
  const ayudaAPorZona = new Map();

  if (todosLosCollectorIds.length === 0) {
    return { ayudaPorZona, ayudaAPorZona };
  }

  const ayudasRecibidas = await Ayuda.findAll({
    where: {
      activo: true,
      fecha: { [Op.between]: [fechaInicio, fechaFin] },
      estado: 'ACEPTADA',
      destinoTipo: 'COBRADOR',
      destinoId: todosLosCollectorIds
    },
    attributes: ['destinoId', 'monto']
  });

  for (const ayuda of ayudasRecibidas) {

    const zonaId = collectorZonaMap.get(ayuda.destinoId);

    if (!zonaId) continue;

    ayudaPorZona.set(
      zonaId,
      numero(ayudaPorZona.get(zonaId)) + numero(ayuda.monto)
    );
  }

  const ayudasDadas = await Ayuda.findAll({
    where: {
      activo: true,
      fecha: { [Op.between]: [fechaInicio, fechaFin] },
      estado: 'ACEPTADA',
      origenTipo: 'COBRADOR',
      origenId: todosLosCollectorIds
    },
    attributes: ['origenId', 'monto']
  });

  for (const ayuda of ayudasDadas) {

    const zonaId = collectorZonaMap.get(ayuda.origenId);

    if (!zonaId) continue;

    ayudaAPorZona.set(
      zonaId,
      numero(ayudaAPorZona.get(zonaId)) + numero(ayuda.monto)
    );
  }

  return { ayudaPorZona, ayudaAPorZona };
};

/*
=====================================================
VALE (cobrador) / VALE SUP. (supervisor) en el rango
=====================================================
*/

const calcularValePorZona = async (
  todosLosCollectorIds,
  collectorZonaMap,
  supervisorZonasMap,
  fechaInicio,
  fechaFin
) => {

  const valePorZona = new Map();
  const valeSupPorZona = new Map();

  if (todosLosCollectorIds.length > 0) {

    const valesCobrador = await Vale.findAll({
      where: {
        activo: true,
        fecha: { [Op.between]: [fechaInicio, fechaFin] },
        estado: { [Op.ne]: 'ANULADO' },
        collectorId: todosLosCollectorIds
      },
      attributes: ['collectorId', 'monto']
    });

    for (const vale of valesCobrador) {

      const zonaId = collectorZonaMap.get(vale.collectorId);

      if (!zonaId) continue;

      valePorZona.set(
        zonaId,
        numero(valePorZona.get(zonaId)) + numero(vale.monto)
      );
    }
  }

  const supervisorIds = Array.from(supervisorZonasMap.keys());

  if (supervisorIds.length > 0) {

    const valesSupervisor = await Vale.findAll({
      where: {
        activo: true,
        fecha: { [Op.between]: [fechaInicio, fechaFin] },
        estado: { [Op.ne]: 'ANULADO' },
        supervisorId: supervisorIds
      },
      attributes: ['supervisorId', 'monto']
    });

    for (const vale of valesSupervisor) {

      const zonasDelSupervisor = supervisorZonasMap.get(vale.supervisorId);

      /*
      Solo se atribuye si el supervisor tiene cobradores
      en UNA UNICA zona. Si administra varias, este vale
      no suma en ninguna (no hay forma correcta de repartirlo).
      */

      if (!zonasDelSupervisor || zonasDelSupervisor.size !== 1) {
        continue;
      }

      const [zonaId] = zonasDelSupervisor;

      valeSupPorZona.set(
        zonaId,
        numero(valeSupPorZona.get(zonaId)) + numero(vale.monto)
      );
    }
  }

  return { valePorZona, valeSupPorZona };
};

/*
=====================================================
GET /api/reportes/informe-diario?fecha=YYYY-MM-DD
=====================================================
*/

export const getInformeDiario = async (req, res, next) => {

  try {

    const { fecha } = req.query;

    if (!fecha) {

      return res.status(400).json({
        success: false,
        message: 'Debe indicar la fecha.'
      });
    }

    const fechaManana = await diaHabilSiguiente(fecha);

    const {
      zonas,
      collectorZonaMap,
      supervisorZonasMap,
      todosLosCollectorIds
    } = await obtenerZonasYCobradores(req.user.ownerId);

    const zonaIds = zonas.map(z => z.id);

    const registrosHoy = await RegistroDiarioZona.findAll({
      where: {
        zoneId: zonaIds,
        fecha
      }
    });

    const registroHoyMap = new Map(
      registrosHoy.map(r => [r.zoneId, r])
    );

    const {
      porZona: aRecaudarPorZona,
      cuotasDetalle: cuotasVencenHoy
    } = await calcularVencimientosPorZona(
      todosLosCollectorIds,
      collectorZonaMap,
      fecha,
      fecha
    );

    const {
      porZona: recaudacionDiaSigCalculadaPorZona
    } = await calcularVencimientosPorZona(
      todosLosCollectorIds,
      collectorZonaMap,
      fechaManana,
      fechaManana
    );

    const {
      puntosPorZona: puntosCobranzaPorZona,
      clientesConCuotaPorZona
    } = await calcularCobranzaPorZona(cuotasVencenHoy);

    const entregasPorZonaYDia = await calcularEntregasPorZonaYDia(
      todosLosCollectorIds,
      collectorZonaMap,
      fecha,
      fecha
    );

    const terminadosPorZonaYDia = await calcularTerminadosPorZonaYDia(
      todosLosCollectorIds,
      collectorZonaMap,
      fecha,
      fecha
    );

    const entregasCalculadoPorZona = totalPorZona(entregasPorZonaYDia);
    const terminadosCalculadoPorZona = totalPorZona(terminadosPorZonaYDia);

    const {
      porZona: recaudadoPorZona,
      mpPorZona: mpCalculadoPorZona,
      dejaPorZona: dejaCalculadoPorZona
    } = await calcularRecaudadoPorZona(
      todosLosCollectorIds,
      collectorZonaMap,
      fecha,
      fecha
    );

    const { ayudaPorZona, ayudaAPorZona } = await calcularAyudaPorZona(
      todosLosCollectorIds,
      collectorZonaMap,
      fecha,
      fecha
    );

    const { valePorZona, valeSupPorZona } = await calcularValePorZona(
      todosLosCollectorIds,
      collectorZonaMap,
      supervisorZonasMap,
      fecha,
      fecha
    );

    const data = zonas.map(zona => {

      const registroHoy = registroHoyMap.get(zona.id);

      const aRecaudar = numero(aRecaudarPorZona.get(zona.id));

      const recaudacionDiaSigCalculado =
        numero(recaudacionDiaSigCalculadaPorZona.get(zona.id));

      const tieneOverride =
        registroHoy?.recaudacionDiaSigOverride != null;

      const recaudacionDiaSig = tieneOverride
        ? numero(registroHoy.recaudacionDiaSigOverride)
        : recaudacionDiaSigCalculado;

      const recaudado = numero(recaudadoPorZona.get(zona.id));
      const ayuda = numero(ayudaPorZona.get(zona.id));
      const ayudaA = numero(ayudaAPorZona.get(zona.id));
      const vale = numero(valePorZona.get(zona.id));
      const valeSup = numero(valeSupPorZona.get(zona.id));
      const pr = numero(registroHoy?.pr);

      const mpCalculado = numero(mpCalculadoPorZona.get(zona.id));
      const mpTieneOverride = registroHoy?.mpOverride != null;
      const mp = mpTieneOverride
        ? numero(registroHoy.mpOverride)
        : mpCalculado;

      const dejaCalculado = numero(dejaCalculadoPorZona.get(zona.id));
      const dejaTieneOverride = registroHoy?.dejaOverride != null;
      const deja = dejaTieneOverride
        ? numero(registroHoy.dejaOverride)
        : dejaCalculado;

      const puntos = numero(puntosCobranzaPorZona.get(zona.id));
      const clientesConCuota = numero(clientesConCuotaPorZona.get(zona.id));

      const porcentajeCobranza = clientesConCuota > 0
        ? Number(((puntos / clientesConCuota) * 100).toFixed(2))
        : null;

      const entregasCalculado = numero(entregasCalculadoPorZona.get(zona.id));
      const entregasTieneOverride = registroHoy?.entregasOverride != null;
      const entregas = entregasTieneOverride
        ? numero(registroHoy.entregasOverride)
        : entregasCalculado;

      const terminadosCalculado = numero(terminadosCalculadoPorZona.get(zona.id));
      const ecuCalculado = entregasCalculado - terminadosCalculado;
      const ecuTieneOverride = registroHoy?.ecuOverride != null;
      const ecu = ecuTieneOverride
        ? numero(registroHoy.ecuOverride)
        : ecuCalculado;

      return {
        zoneId: zona.id,
        zona: zona.nombre,
        aRecaudar,
        porcentajeCobranza,
        recaudado,
        entregas,
        entregasEsOverride: entregasTieneOverride,
        ayuda,
        ayudaA,
        vale,
        valeSup,
        pr,
        mp,
        mpEsOverride: mpTieneOverride,
        deja,
        dejaEsOverride: dejaTieneOverride,
        ecu,
        ecuEsOverride: ecuTieneOverride,
        recaudacionDiaSig,
        recaudacionDiaSigEsOverride: tieneOverride
      };
    });

    return res.json({
      success: true,
      data: {
        fecha,
        zonas: data
      }
    });

  } catch (error) {

    next(error);
  }
};

/*
=====================================================
GET /api/reportes/informe-semanal?lunes=YYYY-MM-DD

Semana fija Lunes-Viernes. A Recaudar/% Cobranza usan el
rango exacto Lunes-Viernes (las cuotas nunca vencen en fin
de semana). Recaudado/Entregas/ECU/Ayuda/Vale usan Lunes a
Domingo, para que un movimiento cargado en fin de semana
sume en la semana que terminó ese viernes. Recaudación
semana sig. usa la semana calendario siguiente (Lunes+7 a
Viernes+11), sin lógica de día hábil.
=====================================================
*/

export const getInformeSemanal = async (req, res, next) => {

  try {

    const { lunes } = req.query;

    if (!lunes) {

      return res.status(400).json({
        success: false,
        message: 'Debe indicar el lunes de la semana.'
      });
    }

    const diaSemana = parseFechaLocal(lunes).getDay();

    if (diaSemana !== 1) {

      return res.status(400).json({
        success: false,
        message: 'El parámetro lunes debe ser un lunes.'
      });
    }

    const diasSemana = [0, 1, 2, 3, 4].map(offset => sumarDias(lunes, offset));
    const [
      fechaLunes,
      ,
      ,
      ,
      fechaViernes
    ] = diasSemana;

    const fechaDomingo = sumarDias(fechaLunes, 6);

    const lunesSig = sumarDias(fechaLunes, 7);
    const viernesSig = sumarDias(fechaLunes, 11);

    const {
      zonas,
      collectorZonaMap,
      supervisorZonasMap,
      todosLosCollectorIds
    } = await obtenerZonasYCobradores(req.user.ownerId);

    const zonaIds = zonas.map(z => z.id);

    const registrosSemana = await RegistroDiarioZona.findAll({
      where: {
        zoneId: zonaIds,
        fecha: { [Op.in]: diasSemana }
      }
    });

    /*
    Mapa zonaId -> fecha -> registro, para el desglose
    editable día por día.
    */

    const registroPorZonaYDia = new Map();

    for (const registro of registrosSemana) {

      if (!registroPorZonaYDia.has(registro.zoneId)) {
        registroPorZonaYDia.set(registro.zoneId, new Map());
      }

      registroPorZonaYDia.get(registro.zoneId).set(registro.fecha, registro);
    }

    /*
    ===============================================
    TOTALES SEMANALES DE SOLO LECTURA
    ===============================================
    */

    const {
      porZona: aRecaudarPorZona,
      cuotasDetalle: cuotasVencenSemana
    } = await calcularVencimientosPorZona(
      todosLosCollectorIds,
      collectorZonaMap,
      fechaLunes,
      fechaViernes
    );

    const {
      porZona: aRecaudarSemanaSigPorZona
    } = await calcularVencimientosPorZona(
      todosLosCollectorIds,
      collectorZonaMap,
      lunesSig,
      viernesSig
    );

    const {
      puntosPorZona: puntosCobranzaPorZona,
      clientesConCuotaPorZona
    } = await calcularCobranzaPorZona(cuotasVencenSemana);

    const { porZona: recaudadoPorZona } = await calcularRecaudadoPorZona(
      todosLosCollectorIds,
      collectorZonaMap,
      fechaLunes,
      fechaDomingo
    );

    const { ayudaPorZona, ayudaAPorZona } = await calcularAyudaPorZona(
      todosLosCollectorIds,
      collectorZonaMap,
      fechaLunes,
      fechaDomingo
    );

    const { valePorZona, valeSupPorZona } = await calcularValePorZona(
      todosLosCollectorIds,
      collectorZonaMap,
      supervisorZonasMap,
      fechaLunes,
      fechaDomingo
    );

    /*
    ===============================================
    ENTREGAS / ECU: desglose por día (Lunes-Viernes,
    con fin de semana ya sumado al viernes) + total
    semanal, respetando overrides de cada día.
    ===============================================
    */

    const entregasPorZonaYDia = await calcularEntregasPorZonaYDia(
      todosLosCollectorIds,
      collectorZonaMap,
      fechaLunes,
      fechaDomingo
    );

    const terminadosPorZonaYDia = await calcularTerminadosPorZonaYDia(
      todosLosCollectorIds,
      collectorZonaMap,
      fechaLunes,
      fechaDomingo
    );

    const { mpPorZonaYDia, dejaPorZonaYDia } = await calcularMpDejaPorZonaYDia(
      todosLosCollectorIds,
      collectorZonaMap,
      fechaLunes,
      fechaDomingo
    );

    const data = zonas.map(zona => {

      const registrosDeLaZona =
        registroPorZonaYDia.get(zona.id) || new Map();

      const entregasCalculadoPorDia = entregasPorZonaYDia.get(zona.id) || new Map();
      const terminadosCalculadoPorDia = terminadosPorZonaYDia.get(zona.id) || new Map();
      const mpCalculadoPorDia = mpPorZonaYDia.get(zona.id) || new Map();
      const dejaCalculadoPorDia = dejaPorZonaYDia.get(zona.id) || new Map();

      let entregasSemanaTotal = 0;
      let ecuSemanaTotal = 0;
      let prSemanaTotal = 0;
      let mpSemanaTotal = 0;
      let dejaSemanaTotal = 0;

      const dias = diasSemana.map(fechaDia => {

        const registroDia = registrosDeLaZona.get(fechaDia);

        const entregasCalculado = numero(entregasCalculadoPorDia.get(fechaDia));
        const entregasTieneOverride = registroDia?.entregasOverride != null;
        const entregas = entregasTieneOverride
          ? numero(registroDia.entregasOverride)
          : entregasCalculado;

        const terminadosCalculado = numero(terminadosCalculadoPorDia.get(fechaDia));
        const ecuCalculado = entregasCalculado - terminadosCalculado;
        const ecuTieneOverride = registroDia?.ecuOverride != null;
        const ecu = ecuTieneOverride
          ? numero(registroDia.ecuOverride)
          : ecuCalculado;

        const pr = numero(registroDia?.pr);

        const mpCalculado = numero(mpCalculadoPorDia.get(fechaDia));
        const mpTieneOverride = registroDia?.mpOverride != null;
        const mp = mpTieneOverride
          ? numero(registroDia.mpOverride)
          : mpCalculado;

        const dejaCalculado = numero(dejaCalculadoPorDia.get(fechaDia));
        const dejaTieneOverride = registroDia?.dejaOverride != null;
        const deja = dejaTieneOverride
          ? numero(registroDia.dejaOverride)
          : dejaCalculado;

        entregasSemanaTotal += entregas;
        ecuSemanaTotal += ecu;
        prSemanaTotal += pr;
        mpSemanaTotal += mp;
        dejaSemanaTotal += deja;

        return {
          fecha: fechaDia,
          entregas,
          entregasEsOverride: entregasTieneOverride,
          ecu,
          ecuEsOverride: ecuTieneOverride,
          pr,
          mp,
          mpEsOverride: mpTieneOverride,
          deja,
          dejaEsOverride: dejaTieneOverride
        };
      });

      const aRecaudar = numero(aRecaudarPorZona.get(zona.id));
      const aRecaudarSemanaSig = numero(aRecaudarSemanaSigPorZona.get(zona.id));

      const puntos = numero(puntosCobranzaPorZona.get(zona.id));
      const clientesConCuota = numero(clientesConCuotaPorZona.get(zona.id));

      const porcentajeCobranza = clientesConCuota > 0
        ? Number(((puntos / clientesConCuota) * 100).toFixed(2))
        : null;

      return {
        zoneId: zona.id,
        zona: zona.nombre,
        aRecaudar,
        porcentajeCobranza,
        recaudado: numero(recaudadoPorZona.get(zona.id)),
        ayuda: numero(ayudaPorZona.get(zona.id)),
        ayudaA: numero(ayudaAPorZona.get(zona.id)),
        vale: numero(valePorZona.get(zona.id)),
        valeSup: numero(valeSupPorZona.get(zona.id)),
        aRecaudarSemanaSig,
        entregasSemanaTotal,
        ecuSemanaTotal,
        prSemanaTotal,
        mpSemanaTotal,
        dejaSemanaTotal,
        dias
      };
    });

    return res.json({
      success: true,
      data: {
        lunes: fechaLunes,
        viernes: fechaViernes,
        zonas: data
      }
    });

  } catch (error) {

    next(error);
  }
};

/*
=====================================================
PUT /api/reportes/informe-diario
=====================================================
*/

export const guardarInformeDiario = async (req, res, next) => {

  try {

    const rolUsuario = req.user.role?.name;

    if (!ROLES_QUE_EDITAN.includes(rolUsuario)) {

      return res.status(403).json({
        success: false,
        message: 'No tenés permiso para editar el informe diario.'
      });
    }

    const {
      zoneId,
      fecha,
      pr,
      mpOverride,
      dejaOverride,
      entregasOverride,
      ecuOverride,
      recaudacionDiaSigOverride
    } = req.body;

    const zona = await Zone.findOne({
      where: {
        id: zoneId,
        ownerId: req.user.ownerId
      }
    });

    if (!zona) {

      return res.status(400).json({
        success: false,
        message: 'Zona inválida.'
      });
    }

    const [registro] = await RegistroDiarioZona.findOrCreate({
      where: {
        zoneId,
        fecha
      },
      defaults: {
        ownerId: req.user.ownerId,
        zoneId,
        fecha
      }
    });

    const campos = {
      pr,
      mpOverride,
      dejaOverride,
      entregasOverride,
      ecuOverride,
      recaudacionDiaSigOverride
    };

    for (const [campo, valor] of Object.entries(campos)) {

      if (valor !== undefined) {
        registro[campo] = valor;
      }
    }

    await registro.save();

    return res.json({
      success: true,
      data: registro
    });

  } catch (error) {

    next(error);
  }
};
