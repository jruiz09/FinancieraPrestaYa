import express
from 'express';

import { query, body } from 'express-validator';

import {
  getResumenRecaudacion
} from '../controllers/reporteController.js';

import {
  getInformeDiario,
  getInformeSemanal,
  guardarInformeDiario
} from '../controllers/informeDiarioController.js';

import {
  authenticate,
  authorize
}
from '../middleware/authMiddleware.js';

import {
  validateRequest
} from '../middleware/validationMiddleware.js';


const router =
  express.Router();


router.get(
  '/recaudacion',
  authenticate,
  getResumenRecaudacion
);


router.get(
  '/informe-diario',
  authenticate,
  query('fecha').isDate(),
  validateRequest,
  getInformeDiario
);


router.get(
  '/informe-semanal',
  authenticate,
  authorize('INFORME_SEMANAL_VIEW'),
  query('lunes').isDate(),
  validateRequest,
  getInformeSemanal
);


router.put(
  '/informe-diario',
  authenticate,
  body('zoneId').isUUID(),
  body('fecha').isDate(),
  body('pr').optional().isFloat({ min: 0 }),
  body('mpOverride')
    .optional({ nullable: true })
    .isFloat({ min: 0 }),
  body('dejaOverride')
    .optional({ nullable: true })
    .isFloat(),
  body('entregasOverride')
    .optional({ nullable: true })
    .isFloat({ min: 0 }),
  body('ecuOverride')
    .optional({ nullable: true })
    .isFloat(),
  body('recaudacionDiaSigOverride')
    .optional({ nullable: true })
    .isFloat({ min: 0 }),
  validateRequest,
  guardarInformeDiario
);


export default router;