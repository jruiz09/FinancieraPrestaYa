import { Router } from 'express';
import { query } from 'express-validator';

import {
  getResumenDashboard,
  getResumenPorZona
}
from '../controllers/dashboardController.js';

import {
  authenticate,
  authorize
}
from '../middleware/authMiddleware.js';

import { validateRequest } from '../middleware/validationMiddleware.js';

const router =
  Router();

router.use(
  authenticate
);

router.get(
  '/resumen',
  authorize('DASHBOARD_VIEW'),
  query('zoneIds').optional().isString(),
  validateRequest,
  getResumenDashboard
);

router.get(
  '/zonas-resumen',
  authorize('DASHBOARD_VIEW'),
  query('zoneIds').optional().isString(),
  validateRequest,
  getResumenPorZona
);

export default router;