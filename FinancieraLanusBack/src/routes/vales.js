import { Router } from 'express';
import { body, param } from 'express-validator';

import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

import {
  createVale,
  listVales,
  anularVale
} from '../controllers/valeController.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize('VALES_VIEW'),
  listVales
);

router.post(
  '/',
  authorize('VALES_CREATE'),
  body('fecha').isDate(),
  body('tipo').isIn(['ADELANTO', 'COMBUSTIBLE', 'GASTOS', 'OTROS']),
  body('monto').isFloat({ min: 0.01 }),
  body('observaciones').optional().isString(),
  body('collectorId').optional().isUUID(),
  body('supervisorId').optional().isUUID(),
  validateRequest,
  createVale
);

router.put(
  '/:id/anular',
  authorize('VALES_DELETE'),
  param('id').isUUID(),
  validateRequest,
  anularVale
);

export default router;
