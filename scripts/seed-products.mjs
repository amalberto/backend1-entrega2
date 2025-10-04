/**
 * Script para cargar productos de ejemplo desde seed/products.json
 * Uso: node scripts/seed-products-new.mjs
 */

import mongoose from 'mongoose';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoConfig from '../src/config/mongo.js';
import productModel from '../src/models/product.model.js';

const { connectMongo } = mongoConfig;
const { ProductModel } = productModel;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seedProducts() {
  try {
    console.log('🚀 Iniciando carga de productos...');
    console.log('📁 Directorio actual:', process.cwd());
    
    // Conectar a MongoDB
    await connectMongo();
    console.log('✅ Conectado a MongoDB');

    // Leer productos desde el archivo seed/products.json
    const seedPath = join(__dirname, '../seed/products.json');
    const seedData = await readFile(seedPath, 'utf-8');
    const products = JSON.parse(seedData);
    
    console.log(`📦 Cargados ${products.length} productos desde seed/products.json`);

    // Limpiar productos existentes
    await ProductModel.deleteMany({});
    console.log('🧹 Productos existentes eliminados');

    // Insertar nuevos productos
    const insertedProducts = await ProductModel.insertMany(products);
    console.log(`✅ ${insertedProducts.length} productos insertados exitosamente`);

    // Mostrar resumen por categoría
    const categories = {};
    insertedProducts.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });

    console.log('\n📊 Resumen por categorías:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} productos`);
    });

    console.log('\n🎉 Carga de productos completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la carga de productos:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProducts();
}

export default seedProducts;