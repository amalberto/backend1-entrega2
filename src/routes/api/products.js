const { Router } = require('express');
const ctrl = require('../../controllers/products.controller');

const router = Router();

router.get('/', ctrl.getAll);
router.get('/:pid', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:pid', ctrl.update);
router.delete('/:pid', ctrl.remove);

module.exports = router;
