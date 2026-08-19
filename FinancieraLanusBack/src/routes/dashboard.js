import { Router } from 'express';

import {
  getResumenDashboard
}
from '../controllers/dashboardController.js';

import {
  authenticate
}
from '../middleware/authMiddleware.js';

const router =
  Router();

router.use(
  authenticate
);

router.get(
  '/resumen',
  getResumenDashboard
);

export default router;