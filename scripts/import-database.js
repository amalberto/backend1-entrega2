require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function importDatabase() {
  try {
    console.log('=== IMPORTANDO BASE DE DATOS ===');
    
    // Verificar que existan los archivos
    const exportDir = path.join(__dirname, '..', 'database-export');
    const productsFile = path.join(exportDir, 'products.json');
    const cartsFile = path.join(exportDir, 'carts.json');
    const countersFile = path.join(exportDir, 'counters.json');
    
    if (!fs.existsSync(productsFile)) {
      console.error('❌ No se encontró products.json');
      console.log('💡 Primero ejecuta: npm run db:export');
      return;
    }
    
    // Conectar
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/backend1');
    console.log('✅ Conectado a MongoDB');
    
    // Limpiar colecciones existentes
    console.log('🧹 Limpiando base de datos...');
    await mongoose.connection.db.collection('products').deleteMany({});
    await mongoose.connection.db.collection('carts').deleteMany({});
    await mongoose.connection.db.collection('counters').deleteMany({});
    console.log('✅ Base de datos limpiada');
    
    // Importar productos
    const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    if (products.length > 0) {
      await mongoose.connection.db.collection('products').insertMany(products);
      console.log(`✅ Importados ${products.length} productos`);
    }
    
    // Importar carritos
    if (fs.existsSync(cartsFile)) {
      const carts = JSON.parse(fs.readFileSync(cartsFile, 'utf8'));
      if (carts.length > 0) {
        await mongoose.connection.db.collection('carts').insertMany(carts);
        console.log(`✅ Importados ${carts.length} carritos`);
      }
    }
    
    // Importar contadores
    if (fs.existsSync(countersFile)) {
      const counters = JSON.parse(fs.readFileSync(countersFile, 'utf8'));
      if (counters.length > 0) {
        await mongoose.connection.db.collection('counters').insertMany(counters);
        console.log(`✅ Importados ${counters.length} contadores`);
      }
    }
    
    console.log('🎉 Base de datos importada completamente!');
    console.log('🚀 Ahora puedes ejecutar: npm run dev');
    
  } catch (error) {
    console.error('❌ Error importando:', error);
  } finally {
    await mongoose.disconnect();
  }
}

importDatabase();