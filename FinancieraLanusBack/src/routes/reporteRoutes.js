import express
from 'express';

import { query, body } from 'express-validator';

import {
  getResumenRecaudacion
} from '../controllers/reporteController.js';

import {
  getInformeDiario,
  guardarInformeDiario
} from '../controllers/informeDiarioController.js';

import {
  authenticate
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


router.put(
  '/informe-diario',
  authenticate,
  body('zoneId').isUUID(),
  body('fecha').isDate(),
  body('entregas').optional().isFloat({ min: 0 }),
  body('pr').optional().isFloat({ min: 0 }),
  body('mp').optional().isFloat({ min: 0 }),
  body('ecu').optional().isFloat({ min: 0 }),
  body('recaudacionDiaSigOverride')
    .optional({ nullable: true })
    .isFloat({ min: 0 }),
  validateRequest,
  guardarInformeDiario
);


export default router;