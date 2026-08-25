import { Router } from 'express'

import {
  createAyuda,
  listAyudas,
  deleteAyuda,
  aceptarAyuda,
  rechazarAyuda
}
from '../controllers/ayudaController.js'

import {
  authenticate,
  authorize
}
from '../middleware/authMiddleware.js'

const router = Router()

router.use(
  authenticate
)

router.get(
  '/',
  authorize('AYUDAS_VIEW'),
  listAyudas
)

router.post(
  '/',
  authorize('AYUDAS_CREATE'),
  createAyuda
)

router.put(
  '/:id/aceptar',
  authorize('AYUDAS_EDIT'),
  aceptarAyuda
)

router.put(
  '/:id/rechazar',
  authorize('AYUDAS_EDIT'),
  rechazarAyuda
)

router.delete(
  '/:id',
  authorize('AYUDAS_DELETE'),
  deleteAyuda
)

export default router