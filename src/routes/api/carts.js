const { Router } = require('express');
const ctrl = require('../../controllers/carts.controller');

const router = Router();

router.post('/', ctrl.createCart);
router.get('/', ctrl.getAllCarts); // Nuevo endpoint para listar carritos
router.delete('/__delete-all__', ctrl.deleteAllCarts); // Ruta más específica
router.get('/:cid', ctrl.getProducts);
router.post('/:cid/product/:pid', ctrl.addProduct);

// NUEVAS:
router.delete('/:cid/products/:pid', ctrl.removeProduct);
router.put('/:cid', ctrl.replaceAll);
router.put('/:cid/products/:pid', ctrl.setQuantity);
router.delete('/:cid', ctrl.clear);
router.delete('/:cid/delete', ctrl.deleteCart);

module.exports = router;
