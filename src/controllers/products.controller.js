const service = require('../services/products.service');

exports.getAll = async (req, res, next) => {
  try {
    const data = await service.getAll();
    res.json(data);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const id = Number(req.params.pid);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'El parámetro pid debe ser numérico' });
    const item = await service.getById(id);
    if (!item) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(item);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const created = await service.create(req.body);

    // emitir realtime
    const io = req.app.get('io');
    if (io) {
      const list = await service.getAll();
      io.emit('products:updated', list);
    }

    res.status(201).json(created);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.pid);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'El parámetro pid debe ser numérico' });

    const updated = await service.update(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });

    const io = req.app.get('io');
    if (io) {
      const list = await service.getAll();
      io.emit('products:updated', list);
    }

    res.json(updated);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.pid);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'El parámetro pid debe ser numérico' });

    const removedId = await service.remove(id);
    if (!removedId) return res.status(404).json({ error: 'Producto no encontrado' });

    const io = req.app.get('io');
    if (io) {
      const list = await service.getAll();
      io.emit('products:updated', list);
    }

    res.json({ id: removedId, message: 'Producto eliminado' });
  } catch (err) { next(err); }
};
