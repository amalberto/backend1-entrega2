const fs = require('fs');
const path = require('path');

// Cambiar el tipo de persistencia
exports.changePersistence = async (req, res, next) => {
  try {
    const { persistence } = req.body;
    
    if (!persistence || !['fs', 'mongo'].includes(persistence.toLowerCase())) {
      return res.status(400).json({
        error: 'Tipo de persistencia inválido. Debe ser "fs" o "mongo"'
      });
    }
    
    const envPath = path.join(__dirname, '..', '..', '.env');
    
    // Leer archivo .env actual
    let envContent = '';
    try {
      envContent = fs.readFileSync(envPath, 'utf-8');
    } catch (error) {
      return res.status(500).json({
        error: 'No se pudo leer el archivo .env'
      });
    }
    
    // Actualizar la línea de PERSISTENCE
    const newPersistence = persistence.toLowerCase();
    const lines = envContent.split('\n');
    let updated = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('PERSISTENCE=')) {
        lines[i] = `PERSISTENCE=${newPersistence}`;
        updated = true;
        break;
      }
    }
    
    // Si no existe la línea, agregarla
    if (!updated) {
      lines.push(`PERSISTENCE=${newPersistence}`);
    }
    
    const newContent = lines.join('\n');
    
    // Escribir el archivo actualizado
    try {
      fs.writeFileSync(envPath, newContent);
    } catch (error) {
      return res.status(500).json({
        error: 'No se pudo actualizar el archivo .env'
      });
    }
    
    // Actualizar la variable de entorno en el proceso actual
    const oldPersistence = process.env.PERSISTENCE;
    process.env.PERSISTENCE = newPersistence;
    
    res.json({
      success: true,
      message: `Persistencia cambiada a ${newPersistence.toUpperCase()}`,
      currentPersistence: newPersistence,
      previousPersistence: oldPersistence,
      requiresRestart: true,
      dataCleared: true
    });
    
  } catch (error) {
    next(error);
  }
};

// Obtener el tipo de persistencia actual
exports.getCurrentPersistence = async (req, res, next) => {
  try {
    const currentPersistence = (process.env.PERSISTENCE || 'fs').toLowerCase();
    
    res.json({
      success: true,
      persistence: currentPersistence
    });
    
  } catch (error) {
    next(error);
  }
};