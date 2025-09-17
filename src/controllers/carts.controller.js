const service = require('../services/carts.service');

exports.createCart = async (req, res, next) => {
  try {
    const cart = await service.createCart();
    res.status(201).json(cart);
  } catch (err) { next(err); }
};

exports.getProducts = async (req, res, next) => {
  try {
    const cid = Number(req.params.cid);
    if (!Number.isFinite(cid)) return res.status(400).json({ error: 'El parámetro cid debe ser numérico' });
    const list = await service.getCartProducts(cid);
    if (!list) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(list);
  } catch (err) { next(err); }
};

exports.addProduct = async (req, res, next) => {
  try {
    const cid = Number(req.params.cid);
    const pid = Number(req.params.pid);
    if (!Number.isFinite(cid) || !Number.isFinite(pid)) {
      return res.status(400).json({ error: 'Los parámetros cid y pid deben ser numéricos' });
    }
    const result = await service.addProductToCart(cid, pid);
    if (result?.error === 'PRODUCT_NOT_FOUND') return res.status(404).json({ error: 'Producto no encontrado' });
    if (!result) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(result);
  } catch (err) { next(err); }
};
