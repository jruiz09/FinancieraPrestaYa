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
  authenticate
} from '../middleware/authMiddleware.js'

const router = Router()

router.use(authenticate)

router.get(
  '/',
  listZones
)

router.get(
  '/:id',
  getZone
)

router.post(
  '/',
  createZone
)

router.put(
  '/:id',
  updateZone
)

router.delete(
  '/:id',
  deleteZone
)

export default router