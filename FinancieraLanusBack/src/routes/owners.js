import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getOwners, getOwnerById, createOwner, updateOwner, deleteOwner } from '../controllers/ownerController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize('OWNERS_VIEW'), getOwners);
router.get('/:id', authorize('OWNERS_VIEW'), getOwnerById);
router.post(
  '/',
  authorize('OWNERS_EDIT'),
  body('fullName').notEmpty().withMessage('Nombre completo es requerido'),
  body('documentNumber').notEmpty().withMessage('Documento es requerido'),
  validateRequest,
  createOwner
);
router.put('/:id', authorize('OWNERS_EDIT'), updateOwner);
router.delete('/:id', authorize('OWNERS_EDIT'), deleteOwner);

export default router;
