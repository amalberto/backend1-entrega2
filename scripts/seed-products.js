/**
 * Script para cargar productos de ejemplo desde seed/products.json
 * Uso: node scripts/seed-products.js
 */

// Cargar variables de entorno
require('dotenv').config();

const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');
const { connectMongo } = require('../src/config/mongo.js');
const { ProductModel } = require('../src/models/product.model.js');
const { paths } = require('../src/config/environment.js');

async function seedProducts() {
  const persistence = process.env.PERSISTENCE || 'mongo';
  
  try {
    console.log('Iniciando carga de productos...');
    console.log('Directorio actual:', process.cwd());
    console.log('Sistema de persistencia:', persistence);
    
    if (persistence === 'mongo') {
      // Conectar a MongoDB
      await connectMongo();
      console.log('Conectado a MongoDB');
    }

    // Leer productos desde el archivo seed/products.json
    const seedPath = path.join(__dirname, '../seed/products.json');
    console.log('📂 Leyendo archivo:', seedPath);
    
    const seedData = await fs.readFile(seedPath, 'utf-8');
    const products = JSON.parse(seedData);
    
    console.log(`Cargados ${products.length} productos desde seed/products.json`);

    // Agregar IDs únicos a los productos
    const productsWithIds = products.map((product, index) => ({
      ...product,
      id: index + 1
    }));

    let insertedProducts = [];
    const categories = {};

    if (persistence === 'mongo') {
      // MongoDB: Limpiar e insertar
      const deletedCount = await ProductModel.deleteMany({});
      console.log(`${deletedCount.deletedCount} productos existentes eliminados`);

      insertedProducts = await ProductModel.insertMany(productsWithIds);
      console.log(`${insertedProducts.length} productos insertados exitosamente en MongoDB`);
      
      insertedProducts.forEach(product => {
        categories[product.category] = (categories[product.category] || 0) + 1;
      });
    } else {
      // File System: Escribir directamente
      await fs.mkdir(paths.data, { recursive: true });
      const productsPath = path.join(paths.data, 'products.json');
      
      await fs.writeFile(productsPath, JSON.stringify(productsWithIds, null, 2));
      console.log(`${productsWithIds.length} productos guardados exitosamente en File System`);
      
      productsWithIds.forEach(product => {
        categories[product.category] = (categories[product.category] || 0) + 1;
      });
      insertedProducts = productsWithIds;
    }

    console.log('\nResumen por categorías:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} productos`);
    });

    console.log('\nCarga de productos completada exitosamente');
    
  } catch (error) {
    console.error('Error en la carga de productos:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    if (persistence === 'mongo') {
      await mongoose.connection.close();
      console.log('Conexión cerrada');
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedProducts();
}

module.exports = seedProducts;