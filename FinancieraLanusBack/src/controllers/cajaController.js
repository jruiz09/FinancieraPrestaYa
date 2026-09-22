import { Op } from 'sequelize';

import {
  MovimientoCaja,
  Zone,
  User
} from '../models/index.js';

import {
  obtenerZonasYCobradores,
  calcularRecaudadoPorZona,
  calcularEntregasMedioPagoPorZona
} from './informeDiarioController.js';

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

    const zoneIds = req.query.zoneIds
      ? req.query.zoneIds
          .split(',')
          .map(id => id.trim())
          .filter(Boolean)
      : [];

    if (zoneIds.length) {
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
movimientos manuales de ingreso/egreso y el capital
entregado en créditos nuevos (egreso, discriminado por
montoEfectivo/montoTransferencia), para un rango de fechas
(por defecto: hoy). Al ser todo cálculo en vivo sobre
Credito.activo, una baja por ERROR revierte automáticamente
su efecto en el saldo sin necesidad de un ajuste manual.
=====================================================
*/
export const getResumenCaja = async (req, res, next) => {

  try {

    const hoy =
      new Date().toISOString().split('T')[0];

    const fechaDesde = req.query.fechaDesde || hoy;
    const fechaHasta = req.query.fechaHasta || hoy;

    const {
      zonas,
      collectorZonaMap,
      todosLosCollectorIds
    } = await obtenerZonasYCobradores(req.user.ownerId);

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

      return {
        zoneId: zona.id,
        zona: zona.nombre,
        recaudado: numero(recaudadoPorZona.get(zona.id)),
        recaudadoEfectivo,
        recaudadoTransferencia,
        entregasEfectivo,
        entregasTransferencia,
        ingresosManuales,
        egresosManuales,
        saldoCaja:
          recaudadoEfectivo +
          recaudadoTransferencia +
          ingresosManuales -
          egresosManuales -
          entregasEfectivo -
          entregasTransferencia
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
