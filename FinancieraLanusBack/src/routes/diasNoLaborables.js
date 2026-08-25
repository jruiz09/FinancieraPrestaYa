import { Router } from 'express';
import { body, param, query } from 'express-validator';

import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

import {
  listDiasNoLaborables,
  getDiaNoLaborable,
  createDiaNoLaborable,
  updateDiaNoLaborable,
  deleteDiaNoLaborable
} from '../controllers/diaNoLaborableController.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize('HOLIDAYS_VIEW'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validateRequest,
  listDiasNoLaborables
);

router.get(
  '/:id',
  authorize('HOLIDAYS_VIEW'),
  param('id').isUUID(),
  validateRequest,
  getDiaNoLaborable
);

router.post(
  '/',
  authorize('HOLIDAYS_CREATE'),
  body('fecha')
    .notEmpty()
    .withMessage('La fecha es requerida')
    .isDate()
    .withMessage('Fecha inválida'),

  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es requerida'),

  validateRequest,
  createDiaNoLaborable
);

router.put(
  '/:id',

  authorize('HOLIDAYS_EDIT'),

  param('id').isUUID(),

  body('fecha')
    .optional()
    .isDate()
    .withMessage('Fecha inválida'),

  body('descripcion')
    .optional()
    .notEmpty(),

  validateRequest,
  updateDiaNoLaborable
);

router.delete(
  '/:id',
  authorize('HOLIDAYS_DELETE'),
  param('id').isUUID(),
  validateRequest,
  deleteDiaNoLaborable
);

export default router;