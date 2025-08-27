const express = require('express');
const CartManager = require('../managers/CartManager');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const carrito = await CartManager.addCarrito();
    res.status(201).json(carrito);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:cid', async (req, res) => {
  try {
    const idCarrito = Number(req.params.cid);
    if (isNaN(idCarrito)) return res.status(400).json({ error: 'ID de carrito inválido' });

    const carrito = await CartManager.getCarritoPorId(idCarrito);
    if (!carrito) return res.status(404).json({ error: 'Carrito no encontrado' });

    res.json(carrito.products);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const idCarrito = Number(req.params.cid);
    const idProducto = Number(req.params.pid);
    if (isNaN(idCarrito) || isNaN(idProducto)) {
      return res.status(400).json({ error: 'ID de carrito o producto inválido' });
    }

    const carrito = await CartManager.addProductoAlCarrito(idCarrito, idProducto);
    res.json(carrito);
  } catch (error) {
    if (error.message === 'Carrito no encontrado' || error.message === 'Producto no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
