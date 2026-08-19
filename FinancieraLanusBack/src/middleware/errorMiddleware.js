export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Recurso no encontrado',
  });
};

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    details: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
