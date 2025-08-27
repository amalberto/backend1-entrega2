const { Router } = require('express');
const path = require('path');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const productsPath = path.resolve(__dirname, '..', 'data', 'products.json');
ProductManager.init(productsPath);

const toNum = v => Number(v);
const isNum = v => Number.isFinite(v);

router.get('/', async (req, res, next) => {
  try {
    const items = await ProductManager.getProducts();
    res.json(items);
  } catch (e) { next(e); }
});

router.get('/:pid', async (req, res, next) => {
  try {
    const id = toNum(req.params.pid);
    if (!isNum(id)) return res.status(400).json({ error: 'El pid debe ser numérico' });
    const found = await ProductManager.getProductById(id);
    if (!found) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(found);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const b = req.body;
    if ('id' in b) return res.status(400).json({ error: 'El id se genera automáticamente' });

    const code = b.code;
    const missing = [];
    if (!b.title) missing.push('title');
    if (!b.description) missing.push('description');
    if (!code) missing.push('code');
    if (b.price === undefined) missing.push('price');
    if (b.stock === undefined) missing.push('stock');
    if (!b.category) missing.push('category');
    if (missing.length) return res.status(400).json({ error: `Faltan campos: ${missing.join(', ')}` });

    const price = toNum(b.price);
    const stock = toNum(b.stock);
    if (!isNum(price) || !isNum(stock)) {
      return res.status(400).json({ error: 'El price y stock deben ser numéricos' });
    }

    let thumbnails = [];
    if (Array.isArray(b.thumbnails)) thumbnails = b.thumbnails.map(String);

    const all = await ProductManager.getProducts();
    if (all.some(p => String(p.code) === String(code))) {
      return res.status(400).json({ error: 'El código ya existe' });
    }

    const product = {
      title: String(b.title),
      description: String(b.description),
      code: String(code),
      price,
      status: b.status === undefined ? true : Boolean(b.status),
      stock,
      category: String(b.category),
      thumbnails
    };

    const created = await ProductManager.addProduct(product);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.put('/:pid', async (req, res, next) => {
  try {
    const id = toNum(req.params.pid);
    if (!isNum(id)) return res.status(400).json({ error: 'El pid debe ser numérico' });

    const updates = { ...req.body };
    if ('id' in updates) return res.status(400).json({ error: 'El id no puede modificarse' });

    if ('status' in updates) updates.status = Boolean(updates.status);
    if ('price' in updates) { const n = toNum(updates.price); if (!isNum(n)) return res.status(400).json({ error: 'El price debe ser numérico' }); updates.price = n; }
    if ('stock' in updates) { const n = toNum(updates.stock); if (!isNum(n)) return res.status(400).json({ error: 'El stock debe ser numérico' }); updates.stock = n; }

    if ('code' in updates) {
      const all = await ProductManager.getProducts();
      const conflict = all.some(p => p.id !== id && String(p.code) === String(updates.code));
      if (conflict) {
        return res.status(400).json({ error: 'El código ya existe' });
      }
    }

    const updated = await ProductManager.updateProduct(id, updates);
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:pid', async (req, res, next) => {
  try {
    const id = toNum(req.params.pid);
    if (!isNum(id)) return res.status(400).json({ error: 'El pid debe ser numérico' });
    const removed = await ProductManager.deleteProduct(id);
    if (!removed) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ id: removed, message: 'Producto eliminado' });
  } catch (e) { next(e); }
});

module.exports = router;
