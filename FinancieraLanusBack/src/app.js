import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';
import publicRoutes from './routes/public.routes.js';
import { UPLOADS_DIR } from './config/uploads.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
/*
crossOriginResourcePolicy en 'cross-origin' para que el panel
(otro origen en dev) pueda cargar las imágenes servidas desde
/uploads. El resto de helmet queda con sus defaults.
*/
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(morgan('dev'));

// Archivos subidos (fotos de clientes, etc.)
app.use('/uploads', express.static(UPLOADS_DIR));

app.use(
  '/api/public',
  publicRoutes
);
app.use('/api', routes);


// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
