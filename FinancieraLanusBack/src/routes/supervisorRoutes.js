import { Router }
from 'express';

import {
  body,
  param,
  query
}
from 'express-validator';

import {
  authenticate
}
from '../middleware/authMiddleware.js';

import {
  validateRequest
}
from '../middleware/validationMiddleware.js';

import {
  listSupervisores,
  getSupervisor,
  createSupervisor,
  updateSupervisor,
  deleteSupervisor
}
from '../controllers/supervisorController.js';

const router = Router();

router.use(
  authenticate
);

router.get(
  '/',
  query('page')
    .optional()
    .isInt({ min: 1 })
    .toInt(),

  query('limit')
    .optional()
    .isInt({
      min: 1,
      max: 100
    })
    .toInt(),

  query('ownerId')
    .optional()
    .isUUID(),

  validateRequest,

  listSupervisores
);

router.get(
  '/:id',

  param('id')
    .isUUID(),

  validateRequest,

  getSupervisor
);

router.post(
  '/',

  body('nombre')
    .notEmpty(),

  body('apellido')
    .notEmpty(),

  body('celular')
    .optional(),

  body('email')
    .optional()
    .isEmail(),

  body('ownerId')
    .optional()
    .isUUID(),

  validateRequest,

  createSupervisor
);

router.put(
  '/:id',

  param('id')
    .isUUID(),

  validateRequest,

  updateSupervisor
);

router.delete(
  '/:id',

  param('id')
    .isUUID(),

  validateRequest,

  deleteSupervisor
);

export default router;