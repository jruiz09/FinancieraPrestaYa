import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import ownerRoutes from './owners.js';
import collectorRoutes from './collectors.js';
import clientRoutes from './clients.js';
import tipoPlanRoutes from './tipoPlan.js';
import diaNoLaborableRoutes from './diasNoLaborables.js';
import creditoRoutes from './creditos.js';
import dashboardRoutes from './dashboard.js';
import ayudaRoutes from './ayudaRoutes.js';
import supervisorRoutes from './supervisorRoutes.js';
import zoneRoutes from './zone.routes.js';
import mobileRoutes from './mobileRoutes.js';
import rolesRoutes from './roles.js';
import permissionsRoutes from './permissions.js';
import reporteRoutes
from './reporteRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/collectors', collectorRoutes);
router.use('/clients', clientRoutes);
router.use('/users', userRoutes);
router.use('/owners', ownerRoutes);
router.use('/tipos-plan', tipoPlanRoutes);
router.use('/dias-no-laborables', diaNoLaborableRoutes);
router.use('/creditos', creditoRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ayudas', ayudaRoutes);
router.use('/supervisores', supervisorRoutes);
router.use('/zones', zoneRoutes);
router.use('/roles', rolesRoutes);
router.use('/permissions', permissionsRoutes);
router.use('/mobile', mobileRoutes);
router.use(  '/reportes',
  reporteRoutes);

export default router;
