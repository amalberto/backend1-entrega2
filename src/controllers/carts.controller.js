const service = require('../services/carts.service');

exports.createCart = async (req, res, next) => {
  try {
    const cart = await service.createCart();
    res.status(201).json({ status: 'success', payload: cart });
  } catch (err) { next(err); }
};

exports.getAllCarts = async (req, res, next) => {
  try {
    const carts = await service.getAllCarts();
    res.json({ status: 'success', payload: carts });
  } catch (err) { next(err); }
};

exports.getProducts = async (req, res, next) => {
  try {
    const cid = Number(req.params.cid);
    if (!Number.isFinite(cid)) return res.status(400).json({ error: 'El parámetro cid debe ser numérico' });

    // ahora con populate:
    const cart = await service.getCartWithPopulate(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    // devolvés SOLO los productos (como pide la consigna)
    res.json(cart.products);
  } catch (err) { next(err); }
};

exports.addProduct = async (req, res, next) => {
  try {
    const cid = Number(req.params.cid);
    const pid = Number(req.params.pid);
    const quantity = Number(req.body?.quantity) || 1; // Default 1 if not provided
    
    if (!Number.isFinite(cid) || !Number.isFinite(pid)) {
      return res.status(400).json({ error: 'Los parámetros cid y pid deben ser numéricos' });
    }
    
    if (!Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'quantity debe ser un número >= 1' });
    }
    
    const result = await service.addProductToCart(cid, pid, quantity);
    if (result?.error === 'PRODUCT_NOT_FOUND') return res.status(404).json({ error: 'Producto no encontrado' });
    if (result?.error === 'PRODUCT_NOT_AVAILABLE') return res.status(400).json({ error: 'Producto no disponible' });
    if (!result) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(result);
  } catch (err) { next(err); }
};

// DELETE /carts/:cid/products/:pid
exports.removeProduct = async (req, res, next) => {
  try {
    const cid = Number(req.params.cid), pid = Number(req.params.pid);
    if (!Number.isFinite(cid) || !Number.isFinite(pid)) {
      return res.status(400).json({ error: 'Los parámetros cid y pid deben ser numéricos' });
    }
    const out = await service.deleteProduct(cid, pid);
    if (!out) return res.status(404).json({ error: 'Carrito no encontrado' });
    if (out?.error === 'PRODUCT_NOT_FOUND') return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(out);
  } catch (err) { next(err); }
};

// PUT /carts/:cid   body: [{ product, quantity }, ...]
exports.replaceAll = async (req, res, next) => {
  try {
    const cid = Number(req.params.cid);
    if (!Number.isFinite(cid)) return res.status(400).json({ error: 'El parámetro cid debe ser numérico' });
    const out = await service.replaceAllProducts(cid, req.body);
    if (!out) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(out);
  } catch (err) { next(err); }
};

// PUT /carts/:cid/products/:pid   body: { quantity }
exports.setQuantity = async (req, res, next) => {
  try {
    const cid = Number(req.params.cid), pid = Number(req.params.pid);
    const quantity = Number(req.body?.quantity);
    if (!Number.isFinite(cid) || !Number.isFinite(pid)) {
      return res.status(400).json({ error: 'Los parámetros cid y pid deben ser numéricos' });
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'quantity debe ser un número >= 1' });
    }
    const out = await service.setProductQuantity(cid, pid, quantity);
    if (!out) return res.status(404).json({ error: 'Carrito no encontrado' });
    if (out?.error === 'PRODUCT_NOT_FOUND') return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(out);
  } catch (err) { next(err); }
};

// DELETE /carts/:cid  (vaciar)
exports.clear = async (req, res, next) => {
  try {
    const cid = Number(req.params.cid);
    if (!Number.isFinite(cid)) return res.status(400).json({ error: 'El parámetro cid debe ser numérico' });
    const out = await service.clearCart(cid);
    if (!out) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(out);
  } catch (err) { next(err); }
};

// DELETE /carts/:cid/delete (eliminar carrito completo)
exports.deleteCart = async (req, res, next) => {
  try {
    const cid = Number(req.params.cid);
    if (!Number.isFinite(cid)) return res.status(400).json({ error: 'El parámetro cid debe ser numérico' });
    const deletedCart = await service.deleteCart(cid);
    if (!deletedCart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json({ message: 'Carrito eliminado exitosamente', payload: deletedCart });
  } catch (err) { next(err); }
};

// DELETE /carts/delete-all (eliminar todos los carritos)
exports.deleteAllCarts = async (req, res, next) => {
  try {
    const resetCounter = req.body?.resetCounter === true;
    const result = await service.deleteAllCarts(resetCounter);
    res.json({ 
      message: `Se eliminaron ${result.deletedCount} carritos exitosamente`, 
      payload: result 
    });
  } catch (err) { next(err); }
};
