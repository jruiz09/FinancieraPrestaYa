import { Router } from 'express'
import { body, param } from 'express-validator'

import {
  authenticate,
  authorize
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
  authorize('ROLES_VIEW'),
  getRoles
)

router.get(
  '/:id',

  authorize('ROLES_VIEW'),

  param('id').isUUID(),

  validateRequest,

  getRoleById
)

router.post(
  '/',

  authorize('ROLES_CREATE'),

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

  authorize('ROLES_EDIT'),

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

  authorize('ROLES_EDIT'),

  param('id').isUUID(),

  body('permissions')
    .isArray(),

  validateRequest,

  updateRolePermissions
)

router.delete(
  '/:id',

  authorize('ROLES_DELETE'),

  param('id').isUUID(),

  validateRequest,

  deleteRole
)

export default router