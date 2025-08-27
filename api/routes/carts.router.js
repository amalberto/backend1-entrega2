const { Router } = require('express');
const path = require('path');
const CartManager = require('../managers/CartManager');

const router = Router();
const cartsPath = path.resolve(__dirname, '..', 'data', 'carts.json');
const productsPath = path.resolve(__dirname, '..', 'data', 'products.json');
CartManager.init(cartsPath, productsPath);

const toNum = v => Number(v);
const isNum = v => Number.isFinite(v);

router.post('/', async (req, res, next) => {
  try {
    const cart = await CartManager.createCart();
    res.status(201).json(cart);
  } catch (e) { next(e); }
});

router.get('/:cid', async (req, res, next) => {
  try {
    const cid = toNum(req.params.cid);
    if (!isNum(cid)) return res.status(400).json({ error: 'El cid debe ser numérico' });

    const cart = await CartManager.getCartById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart.products);
  } catch (e) { next(e); }
});

router.post('/:cid/product/:pid', async (req, res, next) => {
  try {
    const cid = toNum(req.params.cid);
    const pid = toNum(req.params.pid);
    if (!isNum(cid) || !isNum(pid)) {
      return res.status(400).json({ error: 'El cid y pid deben ser numéricos' });
    }
    const result = await CartManager.addProduct(cid, pid);
    if (!result) return res.status(404).json({ error: 'Carrito no encontrado' });
    if (result.error === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result);
  } catch (e) { next(e); }
});

module.exports = router;
