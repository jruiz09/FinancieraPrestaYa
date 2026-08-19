import { Router } from 'express';
import { body, param, query } from 'express-validator';

import { authenticate } from '../middleware/authMiddleware.js';
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
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validateRequest,
  listDiasNoLaborables
);

router.get(
  '/:id',
  param('id').isUUID(),
  validateRequest,
  getDiaNoLaborable
);

router.post(
  '/',
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
  param('id').isUUID(),
  validateRequest,
  deleteDiaNoLaborable
);

export default router;