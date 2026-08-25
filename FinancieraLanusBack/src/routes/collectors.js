import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import {
  listCollectors,
  getCollector,
  createCollector,
  updateCollector,
  deleteCollector,
} from '../controllers/collectorController.js';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  authorize('COLLECTORS_VIEW'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('ownerId').optional().isUUID(),
  validateRequest,
  listCollectors
);

router.get('/:id', authorize('COLLECTORS_VIEW'), param('id').isUUID(), validateRequest, getCollector);

router.post(
  '/',
  authorize('COLLECTORS_CREATE'),
  body('nombre').notEmpty().withMessage('Nombre es requerido'),
  body('apellido').notEmpty().withMessage('Apellido es requerido'),
  body('dni').notEmpty().withMessage('DNI es requerido'),
  body('celular').optional().isMobilePhone('any'),
  body('zoneId')
  .optional()
  .isUUID(),
  body('supervisorId')
  .optional()
  .isUUID(),
  body('ownerId').optional().isUUID(),
  validateRequest,
  createCollector
);

router.put('/:id', authorize('COLLECTORS_EDIT'), param('id').isUUID(), validateRequest, updateCollector);

router.delete('/:id', authorize('COLLECTORS_DELETE'), param('id').isUUID(), validateRequest, deleteCollector);

export default router;
