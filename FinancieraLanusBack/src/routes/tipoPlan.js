import { Router } from 'express';
import { body, param, query } from 'express-validator';

import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

import {
  listTiposPlan,
  getTipoPlan,
  createTipoPlan,
  updateTipoPlan,
  deleteTipoPlan
} from '../controllers/tipoPlanController.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize('PLAN_TYPES_VIEW'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validateRequest,
  listTiposPlan
);

router.get(
  '/:id',
  authorize('PLAN_TYPES_VIEW'),
  param('id').isUUID(),
  validateRequest,
  getTipoPlan
);

router.post(
  '/',
  authorize('PLAN_TYPES_CREATE'),
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es requerida'),

  body('dias')
    .isInt({ min: 1 })
    .withMessage('Los días deben ser mayores a 0'),

  validateRequest,
  createTipoPlan
);

router.put(
  '/:id',
  authorize('PLAN_TYPES_EDIT'),
  param('id').isUUID(),

  body('descripcion')
    .optional()
    .notEmpty(),

  body('dias')
    .optional()
    .isInt({ min: 1 }),

  validateRequest,
  updateTipoPlan
);

router.delete(
  '/:id',
  authorize('PLAN_TYPES_DELETE'),
  param('id').isUUID(),
  validateRequest,
  deleteTipoPlan
);

export default router;