/**
 * Script para configurar el sistema de persistencia a MongoDB
 * Uso: npm run use:mongo
 */

const fs = require('fs');
const path = require('path');

function useMongo() {
  try {
    console.log('🔧 Configurando sistema de persistencia a MongoDB...\n');
    
    const envPath = path.join(__dirname, '..', '.env');
    
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
PERSISTENCE=mongo
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
          lines[i] = `PERSISTENCE=mongo`;
          persistenceUpdated = true;
        } else if (lines[i].startsWith('MONGO_URL=')) {
          mongoUrlExists = true;
        }
      }
      
      // Si no existe la línea PERSISTENCE, agregarla
      if (!persistenceUpdated) {
        lines.push(`PERSISTENCE=mongo`);
      }
      
      // Si no existe MONGO_URL, agregarla
      if (!mongoUrlExists) {
        lines.push(`MONGO_URL=mongodb://localhost:27017/backend1`);
      }
      
      newContent = lines.join('\n');
    }
    
    // Escribir el archivo actualizado
    try {
      fs.writeFileSync(envPath, newContent);
    } catch (error) {
      console.error('❌ No se pudo actualizar el archivo .env:', error.message);
      process.exit(1);
    }
    
    const messageExtra = envExists ? '' : ' (archivo .env creado automáticamente)';
    
    console.log(`✅ Persistencia configurada a MONGODB${messageExtra}`);
    console.log('📝 Archivo .env actualizado con:');
    console.log('   - PERSISTENCE=mongo');
    console.log('   - MONGO_URL=mongodb://localhost:27017/backend1');
    console.log('\n💡 Ahora puedes:');
    console.log('   1. Cargar productos de ejemplo: npm run db:seed');
    console.log('   2. Iniciar el servidor: npm start');
    console.log('\n⚠️  Asegúrate de tener MongoDB ejecutándose en tu sistema');
    
  } catch (error) {
    console.error('❌ Error configurando MongoDB:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  useMongo();
}

module.exports = useMongo;