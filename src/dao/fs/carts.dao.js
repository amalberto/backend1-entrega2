const fs = require('fs/promises');
const path = require('path');
const { paths } = require('../../config/environment');

// Archivo para el contador de carritos
const COUNTER_FILE = path.join(paths.data, 'counters.json');

async function readFile() {
  try {
    const raw = await fs.readFile(paths.cartsFile, 'utf-8');
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(paths.cartsFile, '[]');
      return [];
    }
    throw new Error(`Error leyendo carritos: ${err.message}`);
  }
}

async function writeFile(data) {
  try {
    await fs.writeFile(paths.cartsFile, JSON.stringify(data, null, 2));
  } catch (err) {
    throw new Error(`Error escribiendo carritos: ${err.message}`);
  }
}

// Funciones para manejar contador persistente en FS
async function readCounter() {
  try {
    const raw = await fs.readFile(COUNTER_FILE, 'utf-8');
    if (!raw.trim()) return { carts: 0 };
    const data = JSON.parse(raw);
    return data;
  } catch (err) {
    if (err.code === 'ENOENT') {
      const defaultCounters = { carts: 0 };
      await fs.writeFile(COUNTER_FILE, JSON.stringify(defaultCounters, null, 2));
      return defaultCounters;
    }
    throw new Error(`Error leyendo contador: ${err.message}`);
  }
}

async function writeCounter(counters) {
  try {
    await fs.writeFile(COUNTER_FILE, JSON.stringify(counters, null, 2));
  } catch (err) {
    throw new Error(`Error escribiendo contador: ${err.message}`);
  }
}

async function getNextSequence() {
  const counters = await readCounter();
  counters.carts = counters.carts + 1;
  await writeCounter(counters);
  return counters.carts;
}

async function resetCounter() {
  const counters = await readCounter();
  counters.carts = 0;
  await writeCounter(counters);
}

async function getCurrentCounter() {
  const counters = await readCounter();
  return counters.carts;
}

exports.getAll = async () => {
  return await readFile();
};

exports.createCart = async () => {
  try {
    const data = await readFile();
    // Usar contador persistente para mantener secuencia
    const id = await getNextSequence();
    const cart = { id, products: [] };
    data.push(cart);
    await writeFile(data);
    return cart;
  } catch (err) { throw err; }
};

exports.getById = async (cid) => {
  try {
    const data = await readFile();
    return data.find(c => Number(c.id) === Number(cid)) || null;
  } catch (err) { throw err; }
};

exports.addProduct = async (cid, pid, quantity = 1) => {
  try {
    const data = await readFile();
    const idx = data.findIndex(c => Number(c.id) === Number(cid));
    if (idx === -1) return null;

    const cart = data[idx];
    const quantityToAdd = Math.max(1, Number(quantity));
    const line = cart.products.find(p => Number(p.product) === Number(pid));
    if (line) {
      line.quantity += quantityToAdd;
    } else {
      cart.products.push({ product: Number(pid), quantity: quantityToAdd });
    }

    data[idx] = cart;
    await writeFile(data);
    return cart;
  } catch (err) { throw err; }
};

exports.deleteCart = async (cid) => {
  try {
    const data = await readFile();
    const idx = data.findIndex(c => Number(c.id) === Number(cid));
    if (idx === -1) return null;
    
    const deletedCart = data[idx];
    data.splice(idx, 1);
    await writeFile(data);
    return deletedCart;
  } catch (err) { throw err; }
};

// GET /carts/:cid (populate)
exports.getByIdPopulated = async (cid) => {
  try {
    const { products: productsDao } = require('../factory');
    const data = await readFile();
    const cart = data.find(c => Number(c.id) === Number(cid));
    if (!cart) return null;
    
    // Populamos manualmente los productos
    const populatedCart = { ...cart };
    populatedCart.products = [];
    
    for (const item of cart.products) {
      const product = await productsDao.getById(item.product);
      if (product) {
        populatedCart.products.push({
          product: product,
          quantity: item.quantity
        });
      }
    }
    
    return populatedCart;
  } catch (err) { throw err; }
};

// DELETE /carts/:cid/products/:pid
exports.deleteProduct = async (cid, pid) => {
  try {
    const data = await readFile();
    const idx = data.findIndex(c => Number(c.id) === Number(cid));
    if (idx === -1) return null;

    const cart = data[idx];
    cart.products = cart.products.filter(p => Number(p.product) !== Number(pid));
    
    data[idx] = cart;
    await writeFile(data);
    return cart;
  } catch (err) { throw err; }
};

// PUT /carts/:cid (reemplaza todo el arreglo de products)
exports.replaceAllProducts = async (cid, productsArr) => {
  try {
    const { products: productsDao } = require('../factory');
    const data = await readFile();
    const idx = data.findIndex(c => Number(c.id) === Number(cid));
    if (idx === -1) return null;

    const cart = data[idx];
    const next = [];
    
    for (const it of productsArr || []) {
      const qty = Math.max(1, Number(it.quantity) || 1);
      const product = await productsDao.getById(it.product);
      if (product) {
        next.push({ product: Number(it.product), quantity: qty });
      }
    }
    
    cart.products = next;
    data[idx] = cart;
    await writeFile(data);
    return cart;
  } catch (err) { throw err; }
};

// PUT /carts/:cid/products/:pid (setea quantity)
exports.setProductQuantity = async (cid, pid, quantity) => {
  try {
    const { products: productsDao } = require('../factory');
    const product = await productsDao.getById(pid);
    if (!product) return { error: 'PRODUCT_NOT_FOUND' };

    const data = await readFile();
    const idx = data.findIndex(c => Number(c.id) === Number(cid));
    if (idx === -1) return null;

    const cart = data[idx];
    const qty = Math.max(1, Number(quantity) || 1);
    const line = cart.products.find(p => Number(p.product) === Number(pid));
    
    if (line) {
      line.quantity = qty;
    } else {
      cart.products.push({ product: Number(pid), quantity: qty });
    }

    data[idx] = cart;
    await writeFile(data);
    return cart;
  } catch (err) { throw err; }
};

// DELETE /carts/:cid (vacía el carrito)
exports.clearCart = async (cid) => {
  try {
    const data = await readFile();
    const idx = data.findIndex(c => Number(c.id) === Number(cid));
    if (idx === -1) return null;

    const cart = data[idx];
    cart.products = [];
    data[idx] = cart;
    await writeFile(data);
    return cart;
  } catch (err) { throw err; }
};

exports.deleteAllCarts = async (resetCounterFlag = false) => {
  try {
    const data = await readFile();
    const deletedCount = data.length;
    await writeFile([]);
    
    // Si se solicita reiniciar contador, hacerlo
    if (resetCounterFlag) {
      await resetCounter();
    }
    
    return { deletedCount, counterReset: resetCounterFlag };
  } catch (err) { throw err; }
};
