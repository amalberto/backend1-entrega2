const dao = require('../dao/fs/carts.dao');
const productsDao = require('../dao/fs/products.dao');

exports.createCart = async () => dao.createCart();

exports.getCartProducts = async (cid) => {
  const cart = await dao.getById(cid);
  if (!cart) return null;
  return cart.products;
};

exports.addProductToCart = async (cid, pid) => {
  const product = await productsDao.getById(pid);
  if (!product) return { error: 'PRODUCT_NOT_FOUND' };
  return await dao.addProduct(cid, pid);
};
