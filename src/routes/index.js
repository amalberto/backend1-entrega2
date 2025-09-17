const { Router } = require('express');
const webHome = require('./web/home');
const apiProducts = require('./api/products');
const apiCarts = require('./api/carts');

const router = Router();

// Vistas
router.use('/', webHome);

// API
router.use('/products', apiProducts);
router.use('/carts', apiCarts);

module.exports = router;
