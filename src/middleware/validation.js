exports.ensureNumericParam = (paramName) => (req, res, next) => {
  const val = Number(req.params[paramName]);
  if (!Number.isFinite(val)) return res.status(400).json({ error: `${paramName} debe ser numérico` });
  return next();
};
