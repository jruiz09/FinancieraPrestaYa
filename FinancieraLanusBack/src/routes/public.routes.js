import { Router }
from 'express';

import {
  getCreditoPublico
}
from '../controllers/creditoPublicController.js';

const router =
  Router();

router.get(
  '/credito/:token',
  getCreditoPublico
);

export default router;