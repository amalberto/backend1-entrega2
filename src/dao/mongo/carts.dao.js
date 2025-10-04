const { CartModel } = require('../../models/cart.model');
const { ProductModel } = require('../../models/product.model');
const { getNextSequence } = require('../../models/counter.model');

exports.getAll = async () => {
  try {
    return await CartModel.find().lean();
  } catch (err) {
    throw new Error(`Mongo(getAll carts): ${err.message}`);
  }
};

exports.createCart = async () => {
  try {
    const id = await getNextSequence('carts');
    const doc = await CartModel.create({ id, products: [] });
    return doc.toObject();
  } catch (err) {
    throw new Error(`Mongo(create cart): ${err.message}`);
  }
};

exports.getById = async (cid) => {
  try {
    return await CartModel.findOne({ id: Number(cid) }).lean();
  } catch (err) {
    throw new Error(`Mongo(getById cart): ${err.message}`);
  }
};

// GET /carts/:cid (populate)
exports.getByIdPopulated = async (cid) => {
  try {
    const cart = await CartModel
      .findOne({ id: Number(cid) })
      .populate({
        path: 'products.product',
        select: '_id id title description code price status stock category thumbnails'
      })
      .lean();
    
    if (!cart) return null;
    
    // Filtrar productos que no existen (populate falló)
    cart.products = cart.products.filter(item => item.product && item.product._id);
    
    return cart;
  } catch (err) { 
    throw new Error(`Mongo(getByIdPopulated cart): ${err.message}`); 
  }
};

exports.addProduct = async (cid, pid, quantity = 1) => {
  try {
    const prod = await ProductModel.findOne({ id: Number(pid) }, { _id: 1 }).lean();
    if (!prod) return { error: 'PRODUCT_NOT_FOUND' };

    const cart = await CartModel.findOne({ id: Number(cid) });
    if (!cart) return null;

    const quantityToAdd = Math.max(1, Number(quantity));
    const line = cart.products.find(p => String(p.product) === String(prod._id));
    if (line) {
      line.quantity += quantityToAdd;
    } else {
      cart.products.push({ product: prod._id, quantity: quantityToAdd });
    }

    await cart.save();
    return cart.toObject();
  } catch (err) {
    throw new Error(`Mongo(addProduct cart): ${err.message}`);
  }
};

// DELETE /carts/:cid/products/:pid
exports.deleteProduct = async (cid, pid) => {
  try {
    const prod = await ProductModel.findOne({ id: Number(pid) }, { _id: 1 }).lean();
    if (!prod) return { error: 'PRODUCT_NOT_FOUND' };

    const cart = await CartModel.findOne({ id: Number(cid) });
    if (!cart) return null;

    cart.products = cart.products.filter(p => String(p.product) !== String(prod._id));
    await cart.save();
    return cart.toObject();
  } catch (err) { 
    throw new Error(`Mongo(deleteProduct cart): ${err.message}`); 
  }
};

// PUT /carts/:cid  (reemplaza todo el arreglo de products)
exports.replaceAllProducts = async (cid, productsArr) => {
  try {
    const cart = await CartModel.findOne({ id: Number(cid) });
    if (!cart) return null;

    const next = [];
    for (const it of productsArr || []) {
      const qty = Math.max(1, Number(it.quantity) || 1);
      const prod = await ProductModel.findOne({ id: Number(it.product) }, { _id: 1 }).lean();
      if (prod) next.push({ product: prod._id, quantity: qty });
    }
    cart.products = next;
    await cart.save();
    return cart.toObject();
  } catch (err) { 
    throw new Error(`Mongo(replaceAllProducts): ${err.message}`); 
  }
};

// PUT /carts/:cid/products/:pid  (setea quantity)
exports.setProductQuantity = async (cid, pid, quantity) => {
  try {
    const prod = await ProductModel.findOne({ id: Number(pid) }, { _id: 1 }).lean();
    if (!prod) return { error: 'PRODUCT_NOT_FOUND' };

    const cart = await CartModel.findOne({ id: Number(cid) });
    if (!cart) return null;

    const qty = Math.max(1, Number(quantity) || 1);
    const line = cart.products.find(p => String(p.product) === String(prod._id));
    if (line) line.quantity = qty;
    else cart.products.push({ product: prod._id, quantity: qty });

    await cart.save();
    return cart.toObject();
  } catch (err) { 
    throw new Error(`Mongo(setProductQuantity): ${err.message}`); 
  }
};

// DELETE /carts/:cid (vacía el carrito)
exports.clearCart = async (cid) => {
  try {
    const cart = await CartModel.findOne({ id: Number(cid) });
    if (!cart) return null;
    cart.products = [];
    await cart.save();
    return cart.toObject();
  } catch (err) { 
    throw new Error(`Mongo(clearCart): ${err.message}`); 
  }
};

// DELETE /carts/:cid/delete (elimina el carrito completo)
exports.deleteCart = async (cid) => {
  try {
    const result = await CartModel.findOneAndDelete({ id: Number(cid) });
    return result ? result.toObject() : null;
  } catch (err) { 
    throw new Error(`Mongo(deleteCart): ${err.message}`); 
  }
};

// DELETE ALL CARTS (elimina todos los carritos)
exports.deleteAllCarts = async (resetCounter = false) => {
  try {
    const deletedCount = await CartModel.countDocuments();
    await CartModel.deleteMany({});
    
    if (resetCounter) {
      const { Counter } = require('../../models/counter.model');
      await Counter.findByIdAndUpdate(
        'carts',
        { seq: 0 },
        { upsert: true }
      );
    }
    
    return { deletedCount, counterReset: resetCounter };
  } catch (err) { 
    throw new Error(`Mongo(deleteAllCarts): ${err.message}`); 
  }
};