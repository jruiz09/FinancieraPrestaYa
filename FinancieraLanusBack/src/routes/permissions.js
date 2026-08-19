import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getPermissions } from '../controllers/permissionController.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize('ROLES_VIEW'), getPermissions);

export default router;
