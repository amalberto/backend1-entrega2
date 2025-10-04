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
    const newPersistence = persistence.toLowerCase();
    
    // Verificar si el archivo .env existe, si no crearlo con configuración predeterminada
    let envContent = '';
    let envExists = true;
    
    try {
      envContent = fs.readFileSync(envPath, 'utf-8');
    } catch (error) {
      // El archivo .env no existe, crear uno nuevo con configuración predeterminada
      envExists = false;
      envContent = `NODE_ENV=development
PORT=8080
DB_NAME=backend1
PERSISTENCE=${newPersistence}
MONGO_URL=mongodb://localhost:27017/backend1`;
      
      console.log('⚠️  Archivo .env no encontrado, creando uno nuevo con configuración predeterminada');
    }
    
    // Si el archivo ya existía, actualizar la línea de PERSISTENCE
    let newContent = envContent;
    
    if (envExists) {
      const lines = envContent.split('\n');
      let persistenceUpdated = false;
      let mongoUrlExists = false;
      
      // Buscar y actualizar PERSISTENCE
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('PERSISTENCE=')) {
          lines[i] = `PERSISTENCE=${newPersistence}`;
          persistenceUpdated = true;
        } else if (lines[i].startsWith('MONGO_URL=')) {
          mongoUrlExists = true;
        }
      }
      
      // Si no existe la línea PERSISTENCE, agregarla
      if (!persistenceUpdated) {
        lines.push(`PERSISTENCE=${newPersistence}`);
      }
      
      // Si se está cambiando a mongo y no existe MONGO_URL, agregarla
      if (newPersistence === 'mongo' && !mongoUrlExists) {
        lines.push(`MONGO_URL=mongodb://localhost:27017/backend1`);
      }
      
      newContent = lines.join('\n');
    }
    
    // Escribir el archivo actualizado
    try {
      fs.writeFileSync(envPath, newContent);
    } catch (error) {
      return res.status(500).json({
        error: 'No se pudo actualizar el archivo .env'
      });
    }
    
    // Actualizar las variables de entorno en el proceso actual
    const oldPersistence = process.env.PERSISTENCE;
    process.env.PERSISTENCE = newPersistence;
    
    const messageExtra = envExists ? '' : ' (archivo .env creado automáticamente)';
    
    res.json({
      success: true,
      message: `Persistencia cambiada a ${newPersistence.toUpperCase()}${messageExtra}`,
      currentPersistence: newPersistence,
      previousPersistence: oldPersistence,
      requiresRestart: true,
      dataCleared: true,
      envFileCreated: !envExists
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