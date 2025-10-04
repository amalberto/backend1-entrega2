const productsService = require('../services/products.service');

function registerSocket(io) {
  io.on('connection', async (socket) => {
    try {
      const products = await productsService.getAll();
      socket.emit('products:updated', products);
    } catch (_) {}

    socket.on('product:create', async (payload, cb) => {
      try {
        await productsService.create(payload);
        const updated = await productsService.getAll();
        io.emit('products:updated', updated);
        cb && cb({ ok: true });
      } catch (err) {
        cb && cb({ ok: false, error: err.message });
      }
    });

    socket.on('product:delete', async (pid, cb) => {
      try {
        await productsService.remove(Number(pid));
        const updated = await productsService.getAll();
        io.emit('products:updated', updated);
        cb && cb({ ok: true });
      } catch (err) {
        cb && cb({ ok: false, error: err.message });
      }
    });

    socket.on('products:deleteAll', async (payload, cb) => {
      try {
        await productsService.removeAll();
        const updated = await productsService.getAll();
        io.emit('products:updated', updated);
        cb && cb({ ok: true });
      } catch (err) {
        cb && cb({ ok: false, error: err.message });
      }
    });

    socket.on('product:updateStock', async (payload, cb) => {
      try {
        const { id, change } = payload;
        
        // Obtener el producto actual
        const product = await productsService.getById(id);
        
        if (!product) {
          return cb && cb({ ok: false, error: 'Producto no encontrado' });
        }
        
        // Calcular nuevo stock
        const newStock = Math.max(0, product.stock + change);
        
        // Validaciones
        if (change < 0 && Math.abs(change) > product.stock) {
          return cb && cb({ ok: false, error: `No puedes restar ${Math.abs(change)} unidades. Stock actual: ${product.stock}` });
        }
        
        // Actualizar el producto
        const updated = await productsService.update(id, { stock: newStock });
        
        // Emitir actualización
        const allProducts = await productsService.getAll();
        io.emit('products:updated', allProducts);
        
        cb && cb({ ok: true, newStock, change });
      } catch (err) {
        console.error('Error updating stock:', err);
        cb && cb({ ok: false, error: err.message });
      }
    });
  });
}

module.exports = { registerSocket };
