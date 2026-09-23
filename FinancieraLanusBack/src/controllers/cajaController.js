import { Op } from 'sequelize';

import {
  MovimientoCaja,
  Zone,
  User,
  PagoCuota,
  CreditoDetalle,
  Credito,
  Client,
  Ayuda,
  Vale
} from '../models/index.js';

import {
  obtenerZonasYCobradores,
  calcularRecaudadoPorZona,
  calcularEntregasMedioPagoPorZona,
  calcularAyudaPorZona,
  calcularValePorZona
} from './informeDiarioController.js';

import {
  obtenerZoneIdsPermitidos,
  resolverZoneIdsEfectivos
} from '../utils/oficinaScope.js';

const numero = value => Number(value || 0);

/*
=====================================================
CREAR MOVIMIENTO MANUAL DE CAJA
Zona siempre obligatoria (mismo criterio que Collector.zoneId):
ya la valida express-validator en la ruta, acá además se
confirma que la zona sea del mismo owner del usuario.
=====================================================
*/
export const createMovimiento = async (req, res, next) => {

  try {

    const {
      zoneId,
      tipo,
      medioPago,
      monto,
      concepto,
      fecha
    } = req.body;

    const zona =
      await Zone.findOne({
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

    const zoneIdsPermitidos =
      await obtenerZoneIdsPermitidos(req.user);

    if (
      zoneIdsPermitidos !== null &&
      !zoneIdsPermitidos.includes(zona.id)
    ) {

      return res.status(403).json({
        success: false,
        message: 'No tenés acceso a esa zona.'
      });
    }

    const movimiento =
      await MovimientoCaja.create({
        ownerId: req.user.ownerId,
        zoneId: zona.id,
        usuarioId: req.user.id,
        tipo,
        medioPago,
        monto,
        concepto,
        fecha
      });

    return res.status(201).json({
      success: true,
      data: movimiento
    });

  } catch (error) {

    next(error);
  }

};

/*
=====================================================
LISTAR MOVIMIENTOS MANUALES
Filtra por owner (siempre) y opcionalmente por zona(s) y
rango de fechas.
=====================================================
*/
export const listMovimientos = async (req, res, next) => {

  try {

    const where = {
      ownerId: req.user.ownerId,
      activo: true
    };

    const zoneIdsSolicitados = req.query.zoneIds
      ? req.query.zoneIds
          .split(',')
          .map(id => id.trim())
          .filter(Boolean)
      : [];

    const { zoneIds, restringido } =
      await resolverZoneIdsEfectivos(req.user, zoneIdsSolicitados);

    if (restringido) {
      where.zoneId = { [Op.in]: zoneIds };
    }

    if (req.query.fechaDesde && req.query.fechaHasta) {
      where.fecha = {
        [Op.between]: [req.query.fechaDesde, req.query.fechaHasta]
      };
    } else if (req.query.fechaDesde) {
      where.fecha = { [Op.gte]: req.query.fechaDesde };
    } else if (req.query.fechaHasta) {
      where.fecha = { [Op.lte]: req.query.fechaHasta };
    }

    const movimientos =
      await MovimientoCaja.findAll({
        where,

        include: [
          {
            model: Zone,
            as: 'zone',
            attributes: ['id', 'nombre']
          },
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'name']
          }
        ],

        order: [
          ['fecha', 'DESC'],
          ['createdAt', 'DESC']
        ]
      });

    return res.json({
      success: true,
      data: movimientos
    });

  } catch (error) {

    next(error);
  }

};

/*
=====================================================
ANULAR MOVIMIENTO
No se borra físicamente (misma lógica que Vale.anular):
queda en el historial pero deja de sumar en los totales.
=====================================================
*/
export const anularMovimiento = async (req, res, next) => {

  try {

    const movimiento =
      await MovimientoCaja.findOne({
        where: {
          id: req.params.id,
          ownerId: req.user.ownerId
        }
      });

    if (!movimiento) {

      return res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado.'
      });
    }

    const zoneIdsPermitidos =
      await obtenerZoneIdsPermitidos(req.user);

    if (
      zoneIdsPermitidos !== null &&
      !zoneIdsPermitidos.includes(movimiento.zoneId)
    ) {

      return res.status(403).json({
        success: false,
        message: 'No tenés acceso a esa zona.'
      });
    }

    if (!movimiento.activo) {

      return res.status(400).json({
        success: false,
        message: 'El movimiento ya está anulado.'
      });
    }

    movimiento.activo = false;

    await movimiento.save();

    return res.json({
      success: true,
      data: movimiento
    });

  } catch (error) {

    next(error);
  }

};

/*
=====================================================
RESUMEN DE CAJA POR ZONA
Combina lo cobrado a clientes (recaudado, ya discriminado
efectivo/transferencia via calcularRecaudadoPorZona, la
misma función que usa el informe diario/semanal) con los
movimientos manuales de ingreso/egreso, el capital entregado
en créditos nuevos (egreso, discriminado por
montoEfectivo/montoTransferencia) y las ayudas/vales
aceptados (ayuda recibida = ingreso, ayuda dada y vale =
egreso; sin discriminar medio de pago porque esos modelos no
lo registran), para un rango de fechas (por defecto: hoy).
Al ser todo cálculo en vivo sobre Credito.activo, una baja
por ERROR revierte automáticamente su efecto en el saldo sin
necesidad de un ajuste manual.
=====================================================
*/
export const getResumenCaja = async (req, res, next) => {

  try {

    const hoy =
      new Date().toISOString().split('T')[0];

    const fechaDesde = req.query.fechaDesde || hoy;
    const fechaHasta = req.query.fechaHasta || hoy;

    const {
      zonas: todasLasZonas,
      collectorZonaMap,
      supervisorZonasMap,
      todosLosCollectorIds
    } = await obtenerZonasYCobradores(req.user.ownerId);

    const zoneIdsPermitidos =
      await obtenerZoneIdsPermitidos(req.user);

    const zonas =
      zoneIdsPermitidos === null
        ? todasLasZonas
        : todasLasZonas.filter(
            zona => zoneIdsPermitidos.includes(zona.id)
          );

    const {
      porZona: recaudadoPorZona,
      mpPorZona: transferenciaPorZona,
      dejaPorZona: efectivoPorZona
    } = await calcularRecaudadoPorZona(
      todosLosCollectorIds,
      collectorZonaMap,
      fechaDesde,
      fechaHasta
    );

    const {
      efectivoPorZona: entregasEfectivoPorZona,
      transferenciaPorZona: entregasTransferenciaPorZona
    } = await calcularEntregasMedioPagoPorZona(
      todosLosCollectorIds,
      collectorZonaMap,
      fechaDesde,
      fechaHasta
    );

    const { ayudaPorZona, ayudaAPorZona } = await calcularAyudaPorZona(
      todosLosCollectorIds,
      collectorZonaMap,
      fechaDesde,
      fechaHasta
    );

    const { valePorZona, valeSupPorZona } = await calcularValePorZona(
      todosLosCollectorIds,
      collectorZonaMap,
      supervisorZonasMap,
      fechaDesde,
      fechaHasta
    );

    const movimientosManuales =
      await MovimientoCaja.findAll({
        where: {
          ownerId: req.user.ownerId,
          activo: true,
          fecha: { [Op.between]: [fechaDesde, fechaHasta] }
        }
      });

    const ingresosManualesPorZona = new Map();
    const egresosManualesPorZona = new Map();

    for (const movimiento of movimientosManuales) {

      const mapaDestino =
        movimiento.tipo === 'INGRESO'
          ? ingresosManualesPorZona
          : egresosManualesPorZona;

      mapaDestino.set(
        movimiento.zoneId,
        numero(mapaDestino.get(movimiento.zoneId)) +
          numero(movimiento.monto)
      );
    }

    const data = zonas.map(zona => {

      const recaudadoEfectivo = numero(efectivoPorZona.get(zona.id));
      const recaudadoTransferencia = numero(transferenciaPorZona.get(zona.id));
      const ingresosManuales = numero(ingresosManualesPorZona.get(zona.id));
      const egresosManuales = numero(egresosManualesPorZona.get(zona.id));
      const entregasEfectivo = numero(entregasEfectivoPorZona.get(zona.id));
      const entregasTransferencia = numero(entregasTransferenciaPorZona.get(zona.id));
      const ayudaRecibida = numero(ayudaPorZona.get(zona.id));
      const ayudaDada = numero(ayudaAPorZona.get(zona.id));
      const vale =
        numero(valePorZona.get(zona.id)) +
        numero(valeSupPorZona.get(zona.id));

      return {
        zoneId: zona.id,
        zona: zona.nombre,
        recaudado: numero(recaudadoPorZona.get(zona.id)),
        recaudadoEfectivo,
        recaudadoTransferencia,
        entregasEfectivo,
        entregasTransferencia,
        ayudaRecibida,
        ayudaDada,
        vale,
        ingresosManuales,
        egresosManuales,
        saldoCaja:
          recaudadoEfectivo +
          recaudadoTransferencia +
          ingresosManuales +
          ayudaRecibida -
          egresosManuales -
          entregasEfectivo -
          entregasTransferencia -
          ayudaDada -
          vale
      };
    });

    return res.json({
      success: true,
      data: {
        fechaDesde,
        fechaHasta,
        zonas: data
      }
    });

  } catch (error) {

    next(error);
  }

};

/*
=====================================================
LISTADO DE MOVIMIENTOS AUTOMÁTICOS (no manuales): el
detalle fila por fila de todo lo que ya suma/resta en
getResumenCaja (cobros de cuotas, créditos entregados,
ayudas aceptadas, vales), para poder auditarlo igual que
los movimientos manuales. Mismo criterio de zona/alcance
que las funciones de cálculo que usa el resumen.
=====================================================
*/
export const listMovimientosAutomaticos = async (req, res, next) => {

  try {

    const hoy =
      new Date().toISOString().split('T')[0];

    const fechaDesde = req.query.fechaDesde || hoy;
    const fechaHasta = req.query.fechaHasta || hoy;

    const zoneIdsFiltroSolicitado = req.query.zoneIds
      ? req.query.zoneIds
          .split(',')
          .map(id => id.trim())
          .filter(Boolean)
      : [];

    const { zoneIds: zoneIdsFiltro, restringido } =
      await resolverZoneIdsEfectivos(req.user, zoneIdsFiltroSolicitado);

    const {
      zonas,
      collectorZonaMap,
      supervisorZonasMap,
      todosLosCollectorIds
    } = await obtenerZonasYCobradores(req.user.ownerId);

    const nombreZona = new Map(
      zonas.map(zona => [zona.id, zona.nombre])
    );

    const movimientos = [];

    if (todosLosCollectorIds.length > 0) {

      const pagos = await PagoCuota.findAll({
        where: {
          activo: true,
          fecha: { [Op.between]: [fechaDesde, fechaHasta] }
        },
        attributes: ['id', 'fecha', 'monto', 'tipoTransaccion'],
        include: [
          {
            model: CreditoDetalle,
            as: 'cuota',
            required: true,
            attributes: ['numeroCuota'],
            include: [
              {
                model: Credito,
                as: 'credito',
                required: true,
                attributes: ['cobradorId', 'numeroCredito'],
                where: {
                  activo: true,
                  cobradorId: todosLosCollectorIds
                },
                include: [
                  {
                    model: Client,
                    as: 'cliente',
                    attributes: ['nombre', 'apellido']
                  }
                ]
              }
            ]
          }
        ]
      });

      for (const pago of pagos) {

        if (
          pago.tipoTransaccion !== 'EFECTIVO' &&
          pago.tipoTransaccion !== 'TRANSFERENCIA'
        ) continue;

        const zoneId = collectorZonaMap.get(pago.cuota.credito.cobradorId);

        if (!zoneId) continue;

        const cliente = pago.cuota.credito.cliente;

        movimientos.push({
          id: `pago-${pago.id}`,
          fecha: pago.fecha,
          zoneId,
          zona: nombreZona.get(zoneId) || '-',
          tipo: 'INGRESO',
          medioPago: pago.tipoTransaccion,
          concepto:
            `Cobro cuota #${pago.cuota.numeroCuota} · crédito #${pago.cuota.credito.numeroCredito}` +
            (cliente ? ` · ${cliente.apellido}, ${cliente.nombre}` : ''),
          monto: numero(pago.monto),
          origen: 'COBRO_CUOTA'
        });
      }

      const creditos = await Credito.findAll({
        where: {
          activo: true,
          fechaOtorgamiento: { [Op.between]: [fechaDesde, fechaHasta] },
          cobradorId: todosLosCollectorIds
        },
        attributes: [
          'id', 'numeroCredito', 'cobradorId',
          'montoEfectivo', 'montoTransferencia', 'fechaOtorgamiento'
        ],
        include: [
          {
            model: Client,
            as: 'cliente',
            attributes: ['nombre', 'apellido']
          }
        ]
      });

      for (const credito of creditos) {

        const zoneId = collectorZonaMap.get(credito.cobradorId);

        if (!zoneId) continue;

        const cliente = credito.cliente;
        const concepto =
          `Crédito otorgado #${credito.numeroCredito}` +
          (cliente ? ` · ${cliente.apellido}, ${cliente.nombre}` : '');

        if (numero(credito.montoEfectivo) > 0) {

          movimientos.push({
            id: `credito-efectivo-${credito.id}`,
            fecha: credito.fechaOtorgamiento,
            zoneId,
            zona: nombreZona.get(zoneId) || '-',
            tipo: 'EGRESO',
            medioPago: 'EFECTIVO',
            concepto,
            monto: numero(credito.montoEfectivo),
            origen: 'CREDITO_ENTREGADO'
          });
        }

        if (numero(credito.montoTransferencia) > 0) {

          movimientos.push({
            id: `credito-transferencia-${credito.id}`,
            fecha: credito.fechaOtorgamiento,
            zoneId,
            zona: nombreZona.get(zoneId) || '-',
            tipo: 'EGRESO',
            medioPago: 'TRANSFERENCIA',
            concepto,
            monto: numero(credito.montoTransferencia),
            origen: 'CREDITO_ENTREGADO'
          });
        }
      }

      const ayudasRecibidas = await Ayuda.findAll({
        where: {
          activo: true,
          fecha: { [Op.between]: [fechaDesde, fechaHasta] },
          estado: 'ACEPTADA',
          destinoTipo: 'COBRADOR',
          destinoId: todosLosCollectorIds
        },
        attributes: ['id', 'numeroAyuda', 'fecha', 'destinoId', 'origenTipo', 'monto']
      });

      for (const ayuda of ayudasRecibidas) {

        const zoneId = collectorZonaMap.get(ayuda.destinoId);

        if (!zoneId) continue;

        movimientos.push({
          id: `ayuda-recibida-${ayuda.id}`,
          fecha: ayuda.fecha,
          zoneId,
          zona: nombreZona.get(zoneId) || '-',
          tipo: 'INGRESO',
          medioPago: null,
          concepto: `Ayuda recibida #${ayuda.numeroAyuda || '-'} (desde ${ayuda.origenTipo})`,
          monto: numero(ayuda.monto),
          origen: 'AYUDA_RECIBIDA'
        });
      }

      const ayudasDadas = await Ayuda.findAll({
        where: {
          activo: true,
          fecha: { [Op.between]: [fechaDesde, fechaHasta] },
          estado: 'ACEPTADA',
          origenTipo: 'COBRADOR',
          origenId: todosLosCollectorIds
        },
        attributes: ['id', 'numeroAyuda', 'fecha', 'origenId', 'destinoTipo', 'monto']
      });

      for (const ayuda of ayudasDadas) {

        const zoneId = collectorZonaMap.get(ayuda.origenId);

        if (!zoneId) continue;

        movimientos.push({
          id: `ayuda-dada-${ayuda.id}`,
          fecha: ayuda.fecha,
          zoneId,
          zona: nombreZona.get(zoneId) || '-',
          tipo: 'EGRESO',
          medioPago: null,
          concepto: `Ayuda dada #${ayuda.numeroAyuda || '-'} (a ${ayuda.destinoTipo})`,
          monto: numero(ayuda.monto),
          origen: 'AYUDA_DADA'
        });
      }

      const valesCobrador = await Vale.findAll({
        where: {
          activo: true,
          fecha: { [Op.between]: [fechaDesde, fechaHasta] },
          collectorId: todosLosCollectorIds
        },
        attributes: ['id', 'numero', 'fecha', 'collectorId', 'tipo', 'monto']
      });

      for (const vale of valesCobrador) {

        const zoneId = collectorZonaMap.get(vale.collectorId);

        if (!zoneId) continue;

        movimientos.push({
          id: `vale-cobrador-${vale.id}`,
          fecha: vale.fecha,
          zoneId,
          zona: nombreZona.get(zoneId) || '-',
          tipo: 'EGRESO',
          medioPago: null,
          concepto: `Vale ${vale.numero} (${vale.tipo})`,
          monto: numero(vale.monto),
          origen: 'VALE'
        });
      }
    }

    const supervisorIds = Array.from(supervisorZonasMap.keys());

    if (supervisorIds.length > 0) {

      const valesSupervisor = await Vale.findAll({
        where: {
          activo: true,
          fecha: { [Op.between]: [fechaDesde, fechaHasta] },
          supervisorId: supervisorIds
        },
        attributes: ['id', 'numero', 'fecha', 'supervisorId', 'tipo', 'monto']
      });

      for (const vale of valesSupervisor) {

        const zonasDelSupervisor = supervisorZonasMap.get(vale.supervisorId);

        if (!zonasDelSupervisor || zonasDelSupervisor.size !== 1) continue;

        const [zoneId] = zonasDelSupervisor;

        movimientos.push({
          id: `vale-supervisor-${vale.id}`,
          fecha: vale.fecha,
          zoneId,
          zona: nombreZona.get(zoneId) || '-',
          tipo: 'EGRESO',
          medioPago: null,
          concepto: `Vale supervisor ${vale.numero} (${vale.tipo})`,
          monto: numero(vale.monto),
          origen: 'VALE'
        });
      }
    }

    const movimientosFiltrados = restringido
      ? movimientos.filter(m => zoneIdsFiltro.includes(m.zoneId))
      : movimientos;

    movimientosFiltrados.sort((a, b) => {
      if (a.fecha === b.fecha) return 0;
      return a.fecha < b.fecha ? 1 : -1;
    });

    return res.json({
      success: true,
      data: movimientosFiltrados
    });

  } catch (error) {

    next(error);
  }

};
