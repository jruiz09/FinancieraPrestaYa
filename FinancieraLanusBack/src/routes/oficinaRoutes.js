import { Router }
from 'express';

import {
  body,
  param
}
from 'express-validator';

import {
  authenticate,
  authorize
}
from '../middleware/authMiddleware.js';

import {
  validateRequest
}
from '../middleware/validationMiddleware.js';

import {
  listOficinas,
  getOficina,
  createOficina,
  updateOficina,
  deleteOficina
}
from '../controllers/oficinaController.js';

const router = Router();

router.use(
  authenticate
);

router.get(
  '/',

  authorize('OFICINAS_VIEW'),

  listOficinas
);

router.get(
  '/:id',

  authorize('OFICINAS_VIEW'),

  param('id')
    .isUUID(),

  validateRequest,

  getOficina
);

router.post(
  '/',

  authorize('OFICINAS_CREATE'),

  body('nombre')
    .notEmpty(),

  body('zoneIds')
    .optional()
    .isArray(),

  validateRequest,

  createOficina
);

router.put(
  '/:id',

  authorize('OFICINAS_EDIT'),

  param('id')
    .isUUID(),

  body('zoneIds')
    .optional()
    .isArray(),

  validateRequest,

  updateOficina
);

router.delete(
  '/:id',

  authorize('OFICINAS_DELETE'),

  param('id')
    .isUUID(),

  validateRequest,

  deleteOficina
);

export default router;
