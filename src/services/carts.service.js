const { carts: dao, products: productsDao } = require('../dao/factory');

// Importar Counter solo si estamos usando MongoDB
let Counter = null;
if (process.env.PERSISTENCE === 'mongo') {
  Counter = require('../models/counter.model').Counter;
}

exports.createCart = async () => dao.createCart();
exports.getAllCarts = async () => dao.getAll();
exports.getAll = async () => dao.getAll();

exports.getCartProducts = async (cid) => {
  const cart = await dao.getById(cid);
  if (!cart) return null;
  return cart.products;
};

exports.addProductToCart = async (cid, pid, quantity = 1) => {
  const product = await productsDao.getById(pid);
  if (!product) return { error: 'PRODUCT_NOT_FOUND' };
  if (!product.status) return { error: 'PRODUCT_NOT_AVAILABLE' };
  return await dao.addProduct(cid, pid, quantity);
};

exports.getCartWithPopulate = async (cid) => dao.getByIdPopulated(cid);
exports.deleteProduct = async (cid, pid) => dao.deleteProduct(cid, pid);
exports.replaceAllProducts = async (cid, arr) => dao.replaceAllProducts(cid, arr);
exports.setProductQuantity = async (cid, pid, quantity) => dao.setProductQuantity(cid, pid, quantity);
exports.clearCart = async (cid) => dao.clearCart(cid);
exports.deleteCart = async (cid) => dao.deleteCart(cid);
exports.deleteAllCarts = async (resetCounter = false) => dao.deleteAllCarts(resetCounter);

exports.getStats = async () => {
  const carts = await dao.getAll();
  const total = carts.length;
  const withProducts = carts.filter(cart => cart.products && cart.products.length > 0).length;
  const empty = total - withProducts;
  
  let currentCounter = 0;
  
  if (process.env.PERSISTENCE === 'mongo' && Counter) {
    try {
      const counter = await Counter.findById('carts');
      currentCounter = counter ? counter.seq : 0;
    } catch (error) {
      console.warn('Error obteniendo contador de carritos:', error);
    }
  } else {
    // Para File System, usar el contador persistente
    try {
      // Necesitamos acceder directamente al DAO para obtener el contador actual
      const path = require('path');
      const fs = require('fs/promises');
      const { paths } = require('../config/environment');
      const counterFile = path.join(paths.data, 'counters.json');
      
      try {
        const raw = await fs.readFile(counterFile, 'utf-8');
        const counters = JSON.parse(raw);
        currentCounter = counters.carts || 0;
      } catch (error) {
        // Si no existe el archivo, usar 0
        currentCounter = 0;
      }
    } catch (error) {
      console.warn('Error obteniendo contador FS:', error);
      currentCounter = 0;
    }
  }
  
  return {
    total,
    withProducts,
    empty,
    currentCounter
  };
};
