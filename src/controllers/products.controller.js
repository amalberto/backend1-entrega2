const service = require('../services/products.service');

exports.getAll = async (req, res, next) => {
  try {
    const { limit, page, sort, query, category, status } = req.query;

    const wantsPaging =
      typeof limit !== 'undefined' ||
      typeof page  !== 'undefined' ||
      typeof sort  !== 'undefined' ||
      typeof query !== 'undefined' ||
      typeof category !== 'undefined' ||
      typeof status   !== 'undefined';

    if (!wantsPaging) {
      const data = await service.getAll();
      return res.json(data);
    }

    const result = await service.listPaginated({ limit, page, sort, query, category, status });

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const makeLink = (p) => {
      if (!p) return null;
      const params = new URLSearchParams({ ...req.query, page: String(p), limit: String(result.limit) });
      return `${baseUrl}?${params.toString()}`;
    };

    return res.json({
      status: 'success',
      payload: result.payload,
      total: result.total,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: makeLink(result.prevPage),
      nextLink: makeLink(result.nextPage)
    });
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

// Endpoint especial para cargar productos de ejemplo
exports.loadSeed = async (req, res, next) => {
  try {
    // Importar dinámicamente el módulo de seed
    const seedModule = await import('../../scripts/seed-products.mjs');
    const { products } = seedModule;
    
    let createdCount = 0;
    let errors = [];
    
    for (const productData of products) {
      try {
        await service.create(productData);
        createdCount++;
      } catch (error) {
        errors.push({ product: productData.title, error: error.message });
      }
    }
    
    // Emitir actualización si hay WebSocket
    const io = req.app.get('io');
    if (io) {
      const list = await service.getAll();
      io.emit('products:updated', list);
    }
    
    res.json({
      success: true,
      message: `Se cargaron ${createdCount} productos de ejemplo`,
      created: createdCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) { 
    next(err); 
  }
};
