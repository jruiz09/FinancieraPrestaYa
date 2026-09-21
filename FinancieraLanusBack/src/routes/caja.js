import { Router } from 'express';
import { body, param, query } from 'express-validator';

import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

import {
  createMovimiento,
  listMovimientos,
  anularMovimiento,
  getResumenCaja
} from '../controllers/cajaController.js';

const router = Router();

router.use(authenticate);

router.get(
  '/movimientos',
  authorize('CAJA_VIEW'),
  query('zoneIds').optional().isString(),
  query('fechaDesde').optional().isDate(),
  query('fechaHasta').optional().isDate(),
  validateRequest,
  listMovimientos
);

router.post(
  '/movimientos',
  authorize('CAJA_CREATE'),
  body('zoneId').notEmpty().withMessage('Zona es requerida').isUUID(),
  body('tipo').isIn(['INGRESO', 'EGRESO']),
  body('medioPago').isIn(['EFECTIVO', 'TRANSFERENCIA']),
  body('monto').isFloat({ min: 0.01 }),
  body('concepto').notEmpty().isString(),
  body('fecha').isDate(),
  validateRequest,
  createMovimiento
);

router.put(
  '/movimientos/:id/anular',
  authorize('CAJA_DELETE'),
  param('id').isUUID(),
  validateRequest,
  anularMovimiento
);

router.get(
  '/resumen',
  authorize('CAJA_VIEW'),
  query('fechaDesde').optional().isDate(),
  query('fechaHasta').optional().isDate(),
  validateRequest,
  getResumenCaja
);

export default router;
