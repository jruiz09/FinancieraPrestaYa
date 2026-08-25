import { Router } from 'express';

import {
  getResumenDashboard
}
from '../controllers/dashboardController.js';

import {
  authenticate,
  authorize
}
from '../middleware/authMiddleware.js';

const router =
  Router();

router.use(
  authenticate
);

router.get(
  '/resumen',
  authorize('DASHBOARD_VIEW'),
  getResumenDashboard
);

export default router;