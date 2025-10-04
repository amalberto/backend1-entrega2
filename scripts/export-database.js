require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function exportDatabase() {
  try {
    console.log('=== EXPORTANDO BASE DE DATOS ===');
    
    // Conectar
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/backend1');
    console.log('✅ Conectado a MongoDB');
    
    // Crear directorio de exportación
    const exportDir = path.join(__dirname, '..', 'database-export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }
    
    // Exportar productos
    const Product = mongoose.connection.db.collection('products');
    const products = await Product.find({}).toArray();
    fs.writeFileSync(
      path.join(exportDir, 'products.json'), 
      JSON.stringify(products, null, 2)
    );
    console.log(`✅ Exportados ${products.length} productos`);
    
    // Exportar carritos
    const Cart = mongoose.connection.db.collection('carts');
    const carts = await Cart.find({}).toArray();
    fs.writeFileSync(
      path.join(exportDir, 'carts.json'), 
      JSON.stringify(carts, null, 2)
    );
    console.log(`✅ Exportados ${carts.length} carritos`);
    
    // Exportar contadores
    const Counter = mongoose.connection.db.collection('counters');
    const counters = await Counter.find({}).toArray();
    fs.writeFileSync(
      path.join(exportDir, 'counters.json'), 
      JSON.stringify(counters, null, 2)
    );
    console.log(`✅ Exportados ${counters.length} contadores`);
    
    console.log('🎉 Base de datos exportada completamente en:', exportDir);
    console.log('💡 Ahora otros pueden usar: npm run db:import');
    
  } catch (error) {
    console.error('❌ Error exportando:', error);
  } finally {
    await mongoose.disconnect();
  }
}

exportDatabase();