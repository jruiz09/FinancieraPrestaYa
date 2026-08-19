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
  authenticate
}
from '../middleware/authMiddleware.js'

const router = Router()

router.use(
  authenticate
)

router.get(
  '/',
  listAyudas
)

router.post(
  '/',
  createAyuda
)

router.put(
  '/:id/aceptar',
  aceptarAyuda
)

router.put(
  '/:id/rechazar',
  rechazarAyuda
)

router.delete(
  '/:id',
  deleteAyuda
)

export default router