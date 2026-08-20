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

const ROLES_QUE_EDITAN = [
  ROLES.ADMIN,
  ROLES.ADMINISTRATIVO
];

const numero = value => Number(value || 0);

const porcentaje = (recaudado, aRecaudar) => {

  if (!aRecaudar) {
    return null;
  }

  return Number(
    ((recaudado / aRecaudar) * 100).toFixed(2)
  );
};

const diaAnterior = fecha => {

  const [anio, mes, dia] = fecha.split('-').map(Number);

  const date = new Date(anio, mes - 1, dia);

  date.setDate(date.getDate() - 1);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
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

    const fechaAyer = diaAnterior(fecha);

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
    REGISTROS MANUALES (hoy y ayer)
    =================================================
    */

    const zonaIds = zonas.map(z => z.id);

    const registrosHoy = await RegistroDiarioZona.findAll({
      where: {
        zoneId: zonaIds,
        fecha
      }
    });

    const registrosAyer = await RegistroDiarioZona.findAll({
      where: {
        zoneId: zonaIds,
        fecha: fechaAyer
      }
    });

    const registroHoyMap = new Map(
      registrosHoy.map(r => [r.zoneId, r])
    );

    const registroAyerMap = new Map(
      registrosAyer.map(r => [r.zoneId, r])
    );

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
      const registroAyer = registroAyerMap.get(zona.id);

      const sinDatoAnterior = registroAyer?.recaudacionDiaSig == null;

      const aRecaudar = sinDatoAnterior
        ? (
            registroHoy?.aRecaudarManual != null
              ? numero(registroHoy.aRecaudarManual)
              : null
          )
        : numero(registroAyer.recaudacionDiaSig);

      const recaudado = numero(recaudadoPorZona.get(zona.id));
      const ayuda = numero(ayudaPorZona.get(zona.id));
      const ayudaA = numero(ayudaAPorZona.get(zona.id));
      const vale = numero(valePorZona.get(zona.id));
      const valeSup = numero(valeSupPorZona.get(zona.id));
      const entregas = numero(registroHoy?.entregas);
      const pr = numero(registroHoy?.pr);
      const mp = numero(registroHoy?.mp);
      const ecu = numero(registroHoy?.ecu);

      const deja =
        recaudado + ayuda + pr - entregas - ayudaA - vale - valeSup - mp;

      return {
        zoneId: zona.id,
        zona: zona.nombre,
        aRecaudar,
        aRecaudarEditable: sinDatoAnterior,
        porcentajeCobranza: porcentaje(recaudado, aRecaudar),
        recaudado,
        entregas,
        ayuda,
        ayudaA,
        vale,
        valeSup,
        pr,
        mp,
        deja,
        ecu,
        recaudacionDiaSig:
          registroHoy?.recaudacionDiaSig != null
            ? numero(registroHoy.recaudacionDiaSig)
            : null
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
      entregas,
      pr,
      mp,
      ecu,
      recaudacionDiaSig,
      aRecaudarManual
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
      entregas,
      pr,
      mp,
      ecu,
      recaudacionDiaSig,
      aRecaudarManual
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
