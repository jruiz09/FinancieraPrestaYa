import { Router }
  from 'express'

import {
  listZones,
  getZone,
  createZone,
  updateZone,
  deleteZone
} from '../controllers/zone.controller.js'

import {
  authenticate,
  authorize
} from '../middleware/authMiddleware.js'

const router = Router()

router.use(authenticate)

router.get(
  '/',
  authorize('ZONES_VIEW'),
  listZones
)

router.get(
  '/:id',
  authorize('ZONES_VIEW'),
  getZone
)

router.post(
  '/',
  authorize('ZONES_CREATE'),
  createZone
)

router.put(
  '/:id',
  authorize('ZONES_EDIT'),
  updateZone
)

router.delete(
  '/:id',
  authorize('ZONES_DELETE'),
  deleteZone
)

export default router