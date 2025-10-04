const { Router } = require('express');
const { renderHome, renderRealtime, renderProducts, renderProductDetail, renderCart } = require('../../controllers/indexController');

const router = Router();

router.get('/', renderHome);
router.get('/realtimeproducts', renderRealtime);
router.get('/products', renderProducts);
router.get('/products/:pid', renderProductDetail);
router.get('/carts/:cid', renderCart);

module.exports = router;
