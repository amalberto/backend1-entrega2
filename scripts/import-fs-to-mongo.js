require('dotenv').config();
const fs = require('fs/promises');
const mongoose = require('mongoose');
const path = require('path');
const { ProductModel } = require('../src/models/product.model');
const { CartModel } = require('../src/models/cart.model');
const { Counter } = require('../src/models/counter.model');
const { paths } = require('../src/config/environment');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, { });
    console.log('Mongo conectado');

    // importa products
    const pRaw = await fs.readFile(paths.productsFile, 'utf-8').catch(()=>'[]');
    const products = pRaw.trim()? JSON.parse(pRaw) : [];
    if (products.length) {
      await ProductModel.insertMany(products, { ordered: false });
      await Counter.findByIdAndUpdate('products', { $set: { _id:'products', seq: Math.max(...products.map(p=>p.id)) } }, { upsert: true });
      console.log(`Importados ${products.length} productos`);
    }

    // importa carts
    const cRaw = await fs.readFile(paths.cartsFile, 'utf-8').catch(()=>'[]');
    const carts = cRaw.trim()? JSON.parse(cRaw) : [];
    if (carts.length) {
      await CartModel.insertMany(carts, { ordered: false });
      await Counter.findByIdAndUpdate('carts', { $set: { _id:'carts', seq: Math.max(...carts.map(c=>c.id)) } }, { upsert: true });
      console.log(`Importados ${carts.length} carritos`);
    }

    console.log('OK');
    process.exit(0);
  } catch (e) {
    console.error('Error de importación:', e.message);
    process.exit(1);
  }
})();
