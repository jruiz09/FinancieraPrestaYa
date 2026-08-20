import { Router } from 'express'
import { body, param } from 'express-validator'

import {
  authenticate
} from '../middleware/authMiddleware.js'

import {
  validateRequest
} from '../middleware/validationMiddleware.js'

import {

  getRoles,

  getRoleById,

  createRole,

  updateRole,

  updateRolePermissions,

  deleteRole

} from '../controllers/roleController.js'

const router = Router()

router.use(authenticate)

router.get(
  '/',
  getRoles
)

router.get(
  '/:id',


  param('id').isUUID(),

  validateRequest,

  getRoleById
)

router.post(
  '/',


  body('name')
    .trim()
    .notEmpty(),

  body('description')
    .optional()
    .trim(),

  body('permissions')
    .optional()
    .isArray(),

  validateRequest,

  createRole
)

router.put(
  '/:id',


  param('id').isUUID(),

  body('name')
    .trim()
    .notEmpty(),

  body('description')
    .optional()
    .trim(),

  validateRequest,

  updateRole
)

router.put(
  '/:id/permissions',


  param('id').isUUID(),

  body('permissions')
    .isArray(),

  validateRequest,

  updateRolePermissions
)

router.delete(
  '/:id',

  param('id').isUUID(),

  validateRequest,

  deleteRole
)

export default router