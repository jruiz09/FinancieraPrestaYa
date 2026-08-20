import { Router } from 'express';
import { body, param } from 'express-validator';

import { authenticate } from '../middleware/authMiddleware.js';
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
  listVales
);

router.post(
  '/',
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
  param('id').isUUID(),
  validateRequest,
  anularVale
);

export default router;
