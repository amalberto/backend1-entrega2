const express = require('express');
const ProductManager = require('../managers/ProductManager');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const productos = await ProductManager.getProductos();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:pid', async (req, res) => {
  try {
    const id = Number(req.params.pid);
    if (isNaN(id)) return res.status(400).json({ error: 'ID de producto inválido' });

    const producto = await ProductManager.getProductoPorId(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', async (req, res) => {
  try {
    const creado = await ProductManager.addProducto(req.body);
    res.status(201).json(creado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const id = Number(req.params.pid);
    if (isNaN(id)) return res.status(400).json({ error: 'ID de producto inválido' });

    const actualizado = await ProductManager.setProducto(id, req.body);
    if (!actualizado) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    const id = Number(req.params.pid);
    if (isNaN(id)) return res.status(400).json({ error: 'ID de producto inválido' });

    const ok = await ProductManager.delProducto(id);
    if (!ok) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
