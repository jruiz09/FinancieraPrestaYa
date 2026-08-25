import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  geolocalizarDireccion
} from '../controllers/clientController.js';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  authorize('CLIENTS_VIEW'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('ownerId').optional().isUUID(),
  query('cobradorId').optional().isUUID(),
  validateRequest,
  listClients
);

router.get('/:id', authorize('CLIENTS_VIEW'), param('id').isUUID(), validateRequest, getClient);

router.post(
  '/',
  authorize('CLIENTS_CREATE'),
  body('nombre').notEmpty().withMessage('Nombre es requerido'),
  body('apellido').notEmpty().withMessage('Apellido es requerido'),
  body('dni').notEmpty().withMessage('DNI es requerido'),
  body('celular').optional().isMobilePhone('any'),
  body('direccion').optional().isString(),
  body('latitud')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }),
  body('longitud')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }),
  body('foto').optional().isString(),
  body('ownerId').optional().isUUID(),
  body('cobradorId').optional().isUUID(),
  validateRequest,
  createClient
);

router.put(
  '/:id',
  authorize('CLIENTS_EDIT'),
  param('id').isUUID(),
  body('latitud')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }),
  body('longitud')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }),
  validateRequest,
  updateClient
);

router.delete('/:id', authorize('CLIENTS_DELETE'), param('id').isUUID(), validateRequest, deleteClient);

router.post(
  '/geolocalizar',
  authenticate,
  geolocalizarDireccion
);

export default router;
