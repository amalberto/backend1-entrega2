const { Router } = require('express');
const adminController = require('../../controllers/admin.controller');

const router = Router();

// Cargar productos de ejemplo
router.post('/seed-products', adminController.loadSeedProducts);

// Migración de datos
router.post('/migrate/fs-to-mongo', adminController.migrateToMongo);
router.post('/migrate/mongo-to-fs', adminController.migrateToFS);

module.exports = router;