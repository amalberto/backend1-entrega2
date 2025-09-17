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
  });
}

module.exports = { registerSocket };
