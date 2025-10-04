const { Router } = require('express');
const adminController = require('../../controllers/admin.controller');

const router = Router();

// Cargar productos de ejemplo
router.post('/seed-products', adminController.loadSeedProducts);

// Exportar/Importar datos
router.post('/export', adminController.exportData);
router.post('/import', adminController.importData);

// Migración de datos
router.post('/migrate/fs-to-mongo', adminController.migrateToMongo);
router.post('/migrate/mongo-to-fs', adminController.migrateToFS);

// Configuración automática
router.post('/smart-setup', adminController.smartSetup);

module.exports = router;