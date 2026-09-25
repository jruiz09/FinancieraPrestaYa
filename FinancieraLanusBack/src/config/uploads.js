import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';

/*
=====================================================
Almacenamiento de archivos subidos en el filesystem del server.
Las imágenes se guardan en <root>/uploads/... y se sirven de
forma estática en /uploads (ver app.js). En la base solo se
guarda la URL pública (/uploads/...).
=====================================================
*/

export const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const CLIENTES_DIR = path.join(UPLOADS_DIR, 'clientes');

// Se asegura que las carpetas existan al iniciar.
fs.mkdirSync(CLIENTES_DIR, { recursive: true });

const IMAGENES_PERMITIDAS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

const storageClientes = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, CLIENTES_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  }
});

const fileFilterImagenes = (req, file, cb) => {
  if (IMAGENES_PERMITIDAS.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagen no permitido'));
  }
};

/*
Middleware para subir hasta 10 fotos de cliente por request bajo
el campo 'fotos'. Límite de 8MB por archivo.
*/
export const uploadClientFotos = multer({
  storage: storageClientes,
  fileFilter: fileFilterImagenes,
  limits: { fileSize: 8 * 1024 * 1024 }
}).array('fotos', 10);

// URL pública a partir del nombre de archivo guardado en /clientes.
export const urlPublicaClienteFoto = (filename) =>
  `/uploads/clientes/${filename}`;

// Ruta absoluta en disco a partir de una URL pública guardada.
export const rutaAbsolutaDesdeUrl = (url) =>
  path.join(process.cwd(), url.replace(/^\//, ''));
