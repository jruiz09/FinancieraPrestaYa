import express
from 'express';

import {
  getResumenRecaudacion
} from '../controllers/reporteController.js';

import {
  authenticate
}
from '../middleware/authMiddleware.js';


const router =
  express.Router();


router.get(
  '/recaudacion',
  authenticate,
  getResumenRecaudacion
);


export default router;