const fs = require('fs');
const ProductManager = require('./ProductManager');

class CartManager {
  static #path;

  static init(cartsFilePath, productsFilePath) {
    this.#path = cartsFilePath;
    ProductManager.init(productsFilePath);
  }

  static async #readFile() {
    try {
      const content = await fs.promises.readFile(this.#path, 'utf-8');
      if (content.trim().length === 0) return [];
      return JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.promises.writeFile(this.#path, JSON.stringify([]));
        return [];
      }
      throw error;
    }
  }

  static async #writeFile(data) {
    await fs.promises.writeFile(this.#path, JSON.stringify(data, null, 2));
  }

  static async #nextId() {
    const carts = await this.#readFile();
    if (carts.length === 0) return 1;
    const maxId = Math.max(...carts.map(c => Number(c.id) || 0));
    return maxId + 1;
  }

  static async createCart() {
    const carts = await this.#readFile();
    const cart = { id: await this.#nextId(), products: [] };
    carts.push(cart);
    await this.#writeFile(carts);
    return cart;
  }

  static async getCartById(cid) {
    const carts = await this.#readFile();
    const idNum = Number(cid);
    return carts.find(c => Number(c.id) === idNum) || null;
  }

  static async addProduct(cid, pid) {
    const carts = await this.#readFile();
    const idNum = Number(cid);
    const cartIdx = carts.findIndex(c => Number(c.id) === idNum);
    if (cartIdx === -1) return null;

    const product = await ProductManager.getProductById(pid);
    if (!product) return { error: 'PRODUCT_NOT_FOUND' };

    const cart = carts[cartIdx];
    const line = cart.products.find(p => Number(p.product) === Number(pid));
    if (line) line.quantity += 1;
    else cart.products.push({ product: Number(pid), quantity: 1 });

    carts[cartIdx] = cart;
    await this.#writeFile(carts);
    return cart;
  }
}

module.exports = CartManager;
