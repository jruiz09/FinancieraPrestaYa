import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = Router();

router.post(
  '/register',
  body('name').notEmpty().withMessage('Nombre es requerido'),
  body('username').notEmpty().withMessage('Username es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Password mínimo 6 caracteres'),
  body('ownerId').optional().isUUID().withMessage('ownerId inválido'),
  validateRequest,
  register
);

router.post(
  '/login',
  body('username').notEmpty().withMessage('Username es requerido'),
  body('password').notEmpty().withMessage('Password es requerido'),
  validateRequest,
  login
);

router.get('/me', authenticate, me);

export default router;
