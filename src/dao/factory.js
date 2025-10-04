const PERSISTENCE = (process.env.PERSISTENCE || 'fs').toLowerCase();

let products, carts;

if (PERSISTENCE === 'mongo') {
  products = require('./mongo/products.dao');
  carts    = require('./mongo/carts.dao');
} else {
  products = require('./fs/products.dao');
  carts    = require('./fs/carts.dao');
}

module.exports = { products, carts, PERSISTENCE };