import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize('USERS_VIEW'), getUsers);
router.get('/:id', authorize('USERS_VIEW'), getUserById);
router.post(
  '/',
  authorize('USERS_EDIT'),
  body('name').notEmpty(),
  body('username').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('roleId').notEmpty(),
  body('ownerIds').optional().isArray().withMessage('ownerIds debe ser un array'),
  body('ownerIds.*').isUUID().withMessage('ownerIds debe contener UUIDs válidos'),
  validateRequest,
  createUser
);
router.put(
  '/:id',
  authorize('USERS_EDIT'),
  body('name').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('roleId').optional().notEmpty(),
  body('ownerIds').optional().isArray().withMessage('ownerIds debe ser un array'),
  body('ownerIds.*').isUUID().withMessage('ownerIds debe contener UUIDs válidos'),
  validateRequest,
  updateUser
);
router.delete('/:id', authorize('USERS_EDIT'), deleteUser);

export default router;

