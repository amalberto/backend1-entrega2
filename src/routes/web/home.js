const { Router } = require('express');
const { renderHome, renderRealtime } = require('../../controllers/indexController');

const router = Router();

router.get('/', renderHome);
router.get('/realtimeproducts', renderRealtime);

module.exports = router;
