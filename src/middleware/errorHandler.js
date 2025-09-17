exports.errorHandler = (err, req, res, next) => {
  console.error('ERROR:', err);
  const status = err.status || 500;
  const msg = err.message || 'Error interno del servidor';
  res.status(status).json({ error: msg });
};
