const fs = require('fs');

class ProductManager {
  static #path;

  static init(filePath) {
    this.#path = filePath;
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

  static async addProduct(product) {
    const products = await this.#readFile();
    let newId = 1;
    if (products.length > 0) {
      const maxId = Math.max(...products.map(p => p.id));
      newId = maxId + 1;
    }
    const newProduct = { ...product, id: newId };
    products.push(newProduct);
    await this.#writeFile(products);
    return newProduct;
  }

  static async getProducts() {
    return await this.#readFile();
  }

  static async getProductById(id) {
    const idNumber = Number(id);
    const products = await this.#readFile();
    return products.find(p => p.id === idNumber) || null;
  }

  static async updateProduct(id, updates) {
    const products = await this.#readFile();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...updates, id };
    await this.#writeFile(products);
    return products[idx];
  }

  static async deleteProduct(id) {
    const products = await this.#readFile();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return null;
    await this.#writeFile(filtered);
    return id;
  }
}

module.exports = ProductManager;
