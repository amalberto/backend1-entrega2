const { Router } = require('express');
const webHome = require('./web/home');
const apiProducts = require('./api/products');
const apiCarts = require('./api/carts');
const apiConfig = require('./api/config');
const apiAdmin = require('./api/admin');
const { renderProducts, renderProductDetail, renderCarts, renderCart } = require('../controllers/indexController');

const router = Router();

// Vistas
router.use('/', webHome);
router.get('/products', renderProducts);
router.get('/products/:pid', renderProductDetail);
router.get('/carts', renderCarts);
router.get('/carts/:cid', renderCart);

// API
router.use('/api/products', apiProducts);
router.use('/api/carts', apiCarts);
router.use('/api/config', apiConfig);
router.use('/api/admin', apiAdmin);

module.exports = router;
