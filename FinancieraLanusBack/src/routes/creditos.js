import { Router } from 'express';
import { body, param, query } from 'express-validator';

import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

import {
  listCreditos,
  getCredito,
  createCredito,
  deleteCredito,
  simularCredito,
  registrarPagoCuota,
  listCuotas
} from '../controllers/creditoController.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize('CREDITS_VIEW'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1 }),
  validateRequest,
  listCreditos
);

router.get(
  '/cuotas/list',

  authorize('CREDITS_VIEW'),

  query('estado')
    .optional(),

  validateRequest,

  listCuotas
);

router.get(
  '/:id',
  authorize('CREDITS_VIEW'),
  param('id').isUUID(),
  validateRequest,
  getCredito
);

router.post(
  '/',
  authorize('CREDITS_CREATE'),
  body('clienteId').isUUID(),
  body('tipoPlanId').isUUID(),
  body('cantidadCuotas').isInt({ min: 1 }),
  body('montoCredito').isFloat({ min: 1 }),
  body('interes').isFloat({ min: 0 }),
  body('diasGracia').optional().isInt({ min: 0 }),
  body('tipoTransaccion').notEmpty(),
  body('fechaOtorgamiento').isDate(),
  validateRequest,
  createCredito
);

router.delete(
  '/:id',
  authorize('CREDITS_DELETE'),
  param('id').isUUID(),
  validateRequest,
  deleteCredito
);


router.post(
  '/simular',

  authorize('CREDITS_CREATE'),

  body('tipoPlanId').isUUID(),

  body('cantidadCuotas')
    .isInt({ min: 1 }),

  body('montoCredito')
    .isFloat({ min: 1 }),

  body('interes')
    .isFloat({ min: 0 }),

  body('fechaOtorgamiento')
    .isDate(),

  validateRequest,

  simularCredito
);

router.post(
  '/cuotas/:id/pago',

  authorize('CREDITS_EDIT'),

  param('id').isUUID(),

  body('montoPago')
    .isFloat({ min: 0.01 }),

  body('tipoTransaccion')
    .notEmpty(),

  body('confirmado')
    .optional()
    .isBoolean(),

  validateRequest,

  registrarPagoCuota
);

export default router;