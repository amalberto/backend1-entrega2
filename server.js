const express = require('express');
const cors = require('cors');
const productsRouter = require('./src/routes/products.router');
const cartsRouter = require('./src/routes/carts.router');

const app = express();
const PORT = 8080;

// Hardening 
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

// Logger 
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rutas
app.use('/products', productsRouter);
app.use('/carts', cartsRouter);

// Home
app.get('/', (req, res) => {
  res.json({
    message: 'API con FileSystem - Node.js + Express',
    endpoints: { products: '/products', carts: '/carts' }
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
