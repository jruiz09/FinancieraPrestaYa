import { Router } from 'express';
import { param } from 'express-validator';

import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

import {
  listNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas
} from '../controllers/notificacionController.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize('DASHBOARD_VIEW'),
  listNotificaciones
);

router.put(
  '/leer-todas',
  authorize('DASHBOARD_VIEW'),
  marcarTodasLeidas
);

router.put(
  '/:id/leer',
  authorize('DASHBOARD_VIEW'),
  param('id').isUUID(),
  validateRequest,
  marcarNotificacionLeida
);

export default router;
