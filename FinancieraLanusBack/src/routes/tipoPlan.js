import { Router } from 'express';
import { body, param, query } from 'express-validator';

import { authenticate } from '../middleware/authMiddleware.js';
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
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validateRequest,
  listTiposPlan
);

router.get(
  '/:id',
  param('id').isUUID(),
  validateRequest,
  getTipoPlan
);

router.post(
  '/',
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
  param('id').isUUID(),
  validateRequest,
  deleteTipoPlan
);

export default router;