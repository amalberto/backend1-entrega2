const { exec } = require('child_process');
const path = require('path');
const fs = require('fs/promises');

/**
 * Controlador para funciones administrativas del sistema
 */

// Endpoint para cargar productos de ejemplo
exports.loadSeedProducts = async (req, res, next) => {
  try {
    // Ejecutar el script de seed
    const scriptPath = path.join(__dirname, '../../scripts/seed-products.js');
    
    exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error ejecutando seed:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Error al cargar productos de ejemplo',
          details: error.message 
        });
      }
      
      if (stderr) {
        console.warn('Advertencias:', stderr);
      }
      
      console.log('Seed ejecutado exitosamente:', stdout);
      res.json({ 
        success: true, 
        message: 'Productos de ejemplo cargados correctamente',
        output: stdout 
      });
    });
  } catch (error) {
    console.error('Error en loadSeedProducts:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

// Endpoint para exportar datos
exports.exportData = async (req, res, next) => {
  try {
    const scriptPath = path.join(__dirname, '../../scripts/export-database.js');
    
    exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error exportando:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Error al exportar datos',
          details: error.message 
        });
      }
      
      if (stderr) {
        console.warn('Advertencias en exportación:', stderr);
      }
      
      console.log('Exportación exitosa:', stdout);
      res.json({ 
        success: true, 
        message: 'Datos exportados correctamente',
        output: stdout 
      });
    });
  } catch (error) {
    console.error('Error en exportData:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

// Endpoint para importar datos
exports.importData = async (req, res, next) => {
  try {
    const scriptPath = path.join(__dirname, '../../scripts/import-database.js');
    
    return new Promise((resolve, reject) => {
      exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('Error importando:', error);
          return res.status(500).json({ 
            success: false, 
            error: 'Error al importar datos' 
          });
        }
        
        res.json({ 
          success: true, 
          message: 'Datos importados correctamente',
          output: stdout 
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

// Endpoint para migrar de FS a MongoDB
exports.migrateToMongo = async (req, res, next) => {
  try {
    const scriptPath = path.join(__dirname, '../../scripts/migrate-data.js');
    
    exec(`node "${scriptPath}" fs-to-mongo`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error migrando a MongoDB:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Error al migrar a MongoDB',
          details: error.message 
        });
      }
      
      if (stderr) {
        console.warn('Advertencias en migración:', stderr);
      }
      
      console.log('Migración a MongoDB exitosa:', stdout);
      res.json({ 
        success: true, 
        message: 'Datos migrados a MongoDB correctamente',
        output: stdout 
      });
    });
  } catch (error) {
    console.error('Error en migrateToMongo:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

// Endpoint para migrar de MongoDB a FS
exports.migrateToFS = async (req, res, next) => {
  try {
    const scriptPath = path.join(__dirname, '../../scripts/migrate-data.js');
    
    exec(`node "${scriptPath}" mongo-to-fs`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error migrando a FS:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Error al migrar a File System',
          details: error.message 
        });
      }
      
      if (stderr) {
        console.warn('Advertencias en migración a FS:', stderr);
      }
      
      console.log('Migración a FS exitosa:', stdout);
      res.json({ 
        success: true, 
        message: 'Datos migrado a File System correctamente',
        output: stdout 
      });
    });
  } catch (error) {
    console.error('Error en migrateToFS:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

// Endpoint para configuración automática
exports.smartSetup = async (req, res, next) => {
  try {
    const scriptPath = path.join(__dirname, '../../scripts/smart-setup.js');
    
    exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error en smart setup:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Error en configuración automática',
          details: error.message 
        });
      }
      
      if (stderr) {
        console.warn('Advertencias en smart setup:', stderr);
      }
      
      console.log('Smart setup exitoso:', stdout);
      res.json({ 
        success: true, 
        message: 'Configuración automática completada',
        output: stdout 
      });
    });
  } catch (error) {
    console.error('Error en smartSetup:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};