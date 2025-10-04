require('dotenv').config();
const fs = require('fs/promises');
const mongoose = require('mongoose');
const path = require('path');
const { ProductModel } = require('../src/models/product.model');
const { CartModel } = require('../src/models/cart.model');
const { Counter, getNextSequence } = require('../src/models/counter.model');
const { paths } = require('../src/config/environment');

/**
 * Script para migración bidireccional de datos entre FileSystem y MongoDB
 * Uso:
 * - node scripts/migrate-data.js fs-to-mongo
 * - node scripts/migrate-data.js mongo-to-fs
 */

async function connectMongo() {
  const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/backend1';
  await mongoose.connect(MONGO_URL);
  console.log('🔗 Conectado a MongoDB');
}

async function readFSData() {
  const productsPath = path.join(paths.data, 'products.json');
  const cartsPath = path.join(paths.data, 'carts.json');
  
  let products = [], carts = [];
  
  try {
    const productsData = await fs.readFile(productsPath, 'utf-8');
    products = JSON.parse(productsData);
    console.log(`📦 Leídos ${products.length} productos de FS`);
  } catch (error) {
    console.log('⚠️ No se encontraron productos en FS');
  }
  
  try {
    const cartsData = await fs.readFile(cartsPath, 'utf-8');
    carts = JSON.parse(cartsData);
    console.log(`🛒 Leídos ${carts.length} carritos de FS`);
  } catch (error) {
    console.log('⚠️ No se encontraron carritos en FS');
  }
  
  return { products, carts };
}

async function writeFSData(products, carts) {
  const productsPath = path.join(paths.data, 'products.json');
  const cartsPath = path.join(paths.data, 'carts.json');
  
  // Asegurar directorio
  await fs.mkdir(paths.data, { recursive: true });
  
  await fs.writeFile(productsPath, JSON.stringify(products, null, 2));
  await fs.writeFile(cartsPath, JSON.stringify(carts, null, 2));
  
  console.log(`📦 Guardados ${products.length} productos en FS`);
  console.log(`🛒 Guardados ${carts.length} carritos en FS`);
}

async function fsToMongo() {
  console.log('🔄 Migrando de FileSystem a MongoDB...');
  
  await connectMongo();
  const { products, carts } = await readFSData();
  
  if (products.length === 0 && carts.length === 0) {
    console.log('⚠️ No hay datos para migrar');
    return;
  }
  
  // Limpiar MongoDB
  await ProductModel.deleteMany({});
  await CartModel.deleteMany({});
  await Counter.deleteMany({});
  console.log('🧹 MongoDB limpiado');
  
  // Migrar productos
  if (products.length > 0) {
    for (const product of products) {
      await ProductModel.create(product);
    }
    // Actualizar contador
    await Counter.findByIdAndUpdate('products', 
      { seq: Math.max(...products.map(p => p.id)) }, 
      { upsert: true }
    );
  }
  
  // Migrar carritos
  if (carts.length > 0) {
    for (const cart of carts) {
      // Convertir product IDs a ObjectIds
      const cartDoc = {
        id: cart.id,
        products: []
      };
      
      for (const item of cart.products) {
        const product = await ProductModel.findOne({ id: item.product });
        if (product) {
          cartDoc.products.push({
            product: product._id,
            quantity: item.quantity
          });
        }
      }
      
      await CartModel.create(cartDoc);
    }
    // Actualizar contador
    await Counter.findByIdAndUpdate('carts', 
      { seq: Math.max(...carts.map(c => c.id)) }, 
      { upsert: true }
    );
  }
  
  console.log('✅ Migración de FS a MongoDB completada');
}

async function mongoToFs() {
  console.log('🔄 Migrando de MongoDB a FileSystem...');
  
  await connectMongo();
  
  // Obtener datos de MongoDB
  const products = await ProductModel.find({}).lean();
  const carts = await CartModel.find({}).populate('products.product').lean();
  
  console.log(`📦 Obtenidos ${products.length} productos de MongoDB`);
  console.log(`🛒 Obtenidos ${carts.length} carritos de MongoDB`);
  
  if (products.length === 0 && carts.length === 0) {
    console.log('⚠️ No hay datos para migrar');
    return;
  }
  
  // Convertir carritos al formato FS
  const fsCartFormat = carts.map(cart => ({
    id: cart.id,
    products: cart.products.map(item => ({
      product: item.product.id, // Usar ID numérico
      quantity: item.quantity
    }))
  }));
  
  await writeFSData(products, fsCartFormat);
  
  // Actualizar contadores en FS
  const countersPath = path.join(paths.data, 'counters.json');
  const counters = {
    products: products.length > 0 ? Math.max(...products.map(p => p.id)) : 0,
    carts: carts.length > 0 ? Math.max(...carts.map(c => c.id)) : 0
  };
  
  await fs.writeFile(countersPath, JSON.stringify(counters, null, 2));
  console.log('📊 Contadores actualizados en FS');
  
  console.log('✅ Migración de MongoDB a FS completada');
}

async function main() {
  const action = process.argv[2];
  
  try {
    switch(action) {
      case 'fs-to-mongo':
        await fsToMongo();
        break;
      case 'mongo-to-fs':
        await mongoToFs();
        break;
      default:
        console.log(`
📋 Uso del script de migración:

  node scripts/migrate-data.js fs-to-mongo    # Migrar de FileSystem a MongoDB
  node scripts/migrate-data.js mongo-to-fs    # Migrar de MongoDB a FileSystem

🔹 El script preserva los IDs y relaciones entre productos y carritos
🔹 Los contadores se actualizan automáticamente
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

main();