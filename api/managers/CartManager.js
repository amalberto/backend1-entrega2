const fs = require('fs').promises;
const path = require('path');
const ProductManager = require('./ProductManager');

class CartManager {
  static filePath = path.join(__dirname, '../data/carts.json');

  static async cargarCarritos() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
      return [];
    }
  }

  static async setCarritos(carritos) {
    await fs.writeFile(this.filePath, JSON.stringify(carritos, null, 2));
  }

  static async getCarritos() {
    return await this.cargarCarritos();
  }

  static async addCarrito() {
    const carritos = await this.cargarCarritos();
    
    const id = carritos.length > 0 ? Math.max(...carritos.map(c => c.id)) + 1 : 1;
    
    const nuevoCarrito = {
      id,
      products: []
    };

    carritos.push(nuevoCarrito);
    await this.setCarritos(carritos);
    return nuevoCarrito;
  }

  static async getCarritoPorId(id) {
    const carritos = await this.cargarCarritos();
    return carritos.find(carrito => carrito.id === id);
  }

  static async addProductoAlCarrito(idCarrito, idProducto) {
    const carritos = await this.cargarCarritos();
    const indCarrito = carritos.findIndex(carrito => carrito.id === idCarrito);
    
    if (indCarrito === -1) {
      throw new Error('Carrito no encontrado');
    }

    const producto = await ProductManager.getProductoPorId(idProducto);
    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    const carrito = carritos[indCarrito];
    const indProductoExistente = carrito.products.findIndex(item => item.product === idProducto);

    if (indProductoExistente !== -1) {
      carrito.products[indProductoExistente].quantity += 1;
    } else {
      carrito.products.push({
        product: idProducto,
        quantity: 1
      });
    }

    await this.setCarritos(carritos);
    return carrito;
  }
}

module.exports = CartManager;
