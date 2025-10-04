const { Router } = require('express');
const ctrl = require('../../controllers/config.controller');

const router = Router();

router.get('/persistence', ctrl.getCurrentPersistence);
router.post('/persistence', ctrl.changePersistence);

module.exports = router;