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
  query('zoneIds').optional().isString(),
  validateRequest,
  listCreditos
);

router.get(
  '/cuotas/list',

  authorize('CREDITS_VIEW'),

  query('estado')
    .optional(),

  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1 }),

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

  body('montoEfectivo')
    .optional()
    .isFloat({ min: 0 }),

  body('montoTransferencia')
    .optional()
    .isFloat({ min: 0 }),

  body().custom((value) => {

    const efectivo =
      Number(value.montoEfectivo || 0);

    const transferencia =
      Number(value.montoTransferencia || 0);

    if (efectivo + transferencia <= 0) {

      throw new Error(
        'La suma de montoEfectivo y montoTransferencia debe ser mayor a cero.'
      );
    }

    return true;

  }),

  body('confirmado')
    .optional()
    .isBoolean(),

  validateRequest,

  registrarPagoCuota
);

export default router;