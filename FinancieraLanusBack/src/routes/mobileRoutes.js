import { Router }
from 'express'

import {
  authenticate
}
from '../middleware/authMiddleware.js'

import {

  dashboardMobile,

  cuotasHoyMobile,

  cuotasAtrasadasMobile,

  busquedaMobile,

  pagarCuotaMobile,

  getCreditoMobile,
  recorridoMobile,
  perfilMobile,
  ayudasMobile,
  crearAyudaMobile,
  aceptarAyudaMobile,
  rechazarAyudaMobile,
  valesMobile

}
from '../controllers/mobileController.js'

const router =
  Router()

router.use(
  authenticate
)

router.get(
  '/dashboard',
  dashboardMobile
)

router.get(
  '/cuotas-hoy',
  cuotasHoyMobile
)

router.get(
  '/cuotas-atrasadas',
  cuotasAtrasadasMobile
)

router.get(
  '/buscar',
  busquedaMobile
)

router.post(
  '/cuotas/:id/pagar',
  pagarCuotaMobile
)

router.get(
  '/credito/:id',
  getCreditoMobile
)

router.get(
  '/recorrido',
  authenticate,
  recorridoMobile
)

router.get(
  '/perfil',
  authenticate,
  perfilMobile
)


router.get(
  '/ayudas',
  ayudasMobile
)

router.post(
  '/ayudas',
  crearAyudaMobile
)

router.put(
  '/ayudas/:id/aceptar',
  aceptarAyudaMobile
)

router.put(
  '/ayudas/:id/rechazar',
  rechazarAyudaMobile
)

router.get(
  '/vales',
  valesMobile
)

export default router