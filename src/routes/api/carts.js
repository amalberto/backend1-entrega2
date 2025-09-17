const { Router } = require('express');
const ctrl = require('../../controllers/carts.controller');

const router = Router();

router.post('/', ctrl.createCart);
router.get('/:cid', ctrl.getProducts);
router.post('/:cid/product/:pid', ctrl.addProduct);

module.exports = router;
