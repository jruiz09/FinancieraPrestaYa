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

    /*
    =================================================
    ZONAS + COBRADORES DEL OWNER
    =================================================
    */

    const zonas = await Zone.findAll({
      where: {
        ownerId: req.user.ownerId,
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

    /*
    =================================================
    REGISTRO MANUAL DEL DIA
    =================================================
    */

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

    /*
    =================================================
    A RECAUDAR (cuotas que vencen fechaObjetivo, via
    Credito.cobradorId -> zona). Se usa tanto para HOY
    (A RECAUDAR) como para MAÑANA (RECAUDACION DIA SIG
    calculado).
    =================================================
    */

    const calcularVencimientosPorZona = async fechaObjetivo => {

      const porZona = new Map();
      const cuotasDetalle = [];

      if (todosLosCollectorIds.length === 0) {
        return { porZona, cuotasDetalle };
      }

      const cuotas = await CreditoDetalle.findAll({
        where: {
          activo: true,
          fechaVencimiento: fechaObjetivo
        },
        attributes: ['id', 'monto'],
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
          zonaId
        });
      }

      return { porZona, cuotasDetalle };
    };

    const {
      porZona: aRecaudarPorZona,
      cuotasDetalle: cuotasVencenHoy
    } = await calcularVencimientosPorZona(fecha);

    const {
      porZona: recaudacionDiaSigCalculadaPorZona
    } = await calcularVencimientosPorZona(fechaManana);

    /*
    =================================================
    % COBRANZA: promedio por cliente (punto = min(1,
    pagado_acumulado_a_la_fecha / monto_cuota)), sobre
    los clientes con cuota venciendo HOY en la zona.
    =================================================
    */

    const puntosCobranzaPorZona = new Map();
    const clientesConCuotaPorZona = new Map();

    if (cuotasVencenHoy.length > 0) {

      const cuotaIds = cuotasVencenHoy.map(c => c.id);

      const pagosDeCuotasHoy = await PagoCuota.findAll({
        where: {
          activo: true,
          cuotaId: cuotaIds,
          fecha: { [Op.lte]: fecha }
        },
        attributes: ['cuotaId', 'monto']
      });

      const pagadoPorCuota = new Map();

      for (const pago of pagosDeCuotasHoy) {

        pagadoPorCuota.set(
          pago.cuotaId,
          numero(pagadoPorCuota.get(pago.cuotaId)) + numero(pago.monto)
        );
      }

      for (const cuota of cuotasVencenHoy) {

        const pagado = numero(pagadoPorCuota.get(cuota.id));

        const punto = cuota.monto > 0
          ? Math.min(1, pagado / cuota.monto)
          : 1;

        puntosCobranzaPorZona.set(
          cuota.zonaId,
          numero(puntosCobranzaPorZona.get(cuota.zonaId)) + punto
        );

        clientesConCuotaPorZona.set(
          cuota.zonaId,
          numero(clientesConCuotaPorZona.get(cuota.zonaId)) + 1
        );
      }
    }

    /*
    =================================================
    ENTREGAS (creditos otorgados HOY) / CREDITOS
    TERMINADOS HOY, ambos por capital otorgado
    (montoCredito, sin intereses)
    =================================================
    */

    const entregasCalculadoPorZona = new Map();

    if (todosLosCollectorIds.length > 0) {

      const creditosOtorgadosHoy = await Credito.findAll({
        where: {
          activo: true,
          fechaOtorgamiento: fecha,
          cobradorId: todosLosCollectorIds
        },
        attributes: ['id', 'cobradorId', 'montoCredito']
      });

      for (const credito of creditosOtorgadosHoy) {

        const zonaId = collectorZonaMap.get(credito.cobradorId);

        if (!zonaId) continue;

        entregasCalculadoPorZona.set(
          zonaId,
          numero(entregasCalculadoPorZona.get(zonaId)) + numero(credito.montoCredito)
        );
      }
    }

    const terminadosCalculadoPorZona = new Map();

    if (todosLosCollectorIds.length > 0) {

      const creditosFinalizados = await Credito.findAll({
        where: {
          activo: true,
          estado: 'FINALIZADO',
          cobradorId: todosLosCollectorIds
        },
        attributes: ['id', 'cobradorId', 'montoCredito', 'cantidadCuotas']
      });

      if (creditosFinalizados.length > 0) {

        const ultimasCuotasPagadasHoy = await CreditoDetalle.findAll({
          where: {
            activo: true,
            creditoId: creditosFinalizados.map(c => c.id),
            estado: 'PAGADA',
            fechaPago: fecha
          },
          attributes: ['creditoId', 'numeroCuota']
        });

        const numeroCuotaPagadaHoyPorCredito = new Map(
          ultimasCuotasPagadasHoy.map(c => [c.creditoId, c.numeroCuota])
        );

        for (const credito of creditosFinalizados) {

          const numeroCuotaPagadaHoy =
            numeroCuotaPagadaHoyPorCredito.get(credito.id);

          if (numeroCuotaPagadaHoy !== credito.cantidadCuotas) continue;

          const zonaId = collectorZonaMap.get(credito.cobradorId);

          if (!zonaId) continue;

          terminadosCalculadoPorZona.set(
            zonaId,
            numero(terminadosCalculadoPorZona.get(zonaId)) + numero(credito.montoCredito)
          );
        }
      }
    }

    /*
    =================================================
    RECAUDADO (PagoCuota del dia, via cobradorId)
    =================================================
    */

    const recaudadoPorZona = new Map();

    if (todosLosCollectorIds.length > 0) {

      const pagos = await PagoCuota.findAll({
        where: {
          activo: true,
          fecha
        },
        attributes: ['id', 'monto'],
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

        recaudadoPorZona.set(
          zonaId,
          numero(recaudadoPorZona.get(zonaId)) + numero(pago.monto)
        );
      }
    }

    /*
    =================================================
    AYUDA recibida / AYUDA A dada (cobradores)
    =================================================
    */

    const ayudaPorZona = new Map();
    const ayudaAPorZona = new Map();

    if (todosLosCollectorIds.length > 0) {

      const ayudasRecibidas = await Ayuda.findAll({
        where: {
          activo: true,
          fecha,
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
          fecha,
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
    }

    /*
    =================================================
    VALE (cobrador) / VALE SUP. (supervisor)
    =================================================
    */

    const valePorZona = new Map();
    const valeSupPorZona = new Map();

    if (todosLosCollectorIds.length > 0) {

      const valesCobrador = await Vale.findAll({
        where: {
          activo: true,
          fecha,
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
          fecha,
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

    /*
    =================================================
    ARMAR RESPUESTA POR ZONA
    =================================================
    */

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
      const mp = numero(registroHoy?.mp);
      const deja = numero(registroHoy?.deja);

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
        deja,
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
      mp,
      deja,
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
      mp,
      deja,
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
