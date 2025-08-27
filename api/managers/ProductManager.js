const fs = require('fs').promises;
const path = require('path');

class ProductManager {
  static filePath = path.join(__dirname, '../data/products.json');

  static async cargarProductos() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
      return [];
    }
  }

  static async setProductos(productos) {
    await fs.writeFile(this.filePath, JSON.stringify(productos, null, 2));
  }

  static async getProductos() {
    return await this.cargarProductos();
  }

  static async getProductoPorId(id) {
    const productos = await this.cargarProductos();
    return productos.find(producto => producto.id === id);
  }

  static async addProducto(datosProducto) {
    const productos = await this.cargarProductos();
    
    const requeridos = ['title', 'description', 'code', 'price', 'stock', 'category'];
    for (const campo of requeridos) {
      if (!datosProducto[campo] && datosProducto[campo] !== 0) {
        throw new Error(`Campo requerido faltante: ${campo}`);
      }
    }

    if (datosProducto.codigo) {
      datosProducto.code = datosProducto.codigo;
      delete datosProducto.codigo;
    }

    if (datosProducto.thumbnail && typeof datosProducto.thumbnail === 'string') {
      datosProducto.thumbnails = [datosProducto.thumbnail];
      delete datosProducto.thumbnail;
    } else if (!datosProducto.thumbnails) {
      datosProducto.thumbnails = [];
    }

    datosProducto.price = Number(datosProducto.price);
    datosProducto.stock = Number(datosProducto.stock);
    datosProducto.status = datosProducto.status !== undefined ? Boolean(datosProducto.status) : true;

    if (isNaN(datosProducto.price) || isNaN(datosProducto.stock)) {
      throw new Error('El precio y stock deben ser números válidos');
    }

    if (productos.some(producto => producto.code === datosProducto.code)) {
      throw new Error('El código del producto debe ser único');
    }

    const id = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
    
    const nuevoProducto = {
      id,
      title: datosProducto.title,
      description: datosProducto.description,
      code: datosProducto.code,
      price: datosProducto.price,
      status: datosProducto.status,
      stock: datosProducto.stock,
      category: datosProducto.category,
      thumbnails: datosProducto.thumbnails
    };

    productos.push(nuevoProducto);
    await this.setProductos(productos);
    return nuevoProducto;
  }

  static async setProducto(id, datosActual) {
    const productos = await this.cargarProductos();
    const ind = productos.findIndex(producto => producto.id === id);
    
    if (ind === -1) {
      return null;
    }

    delete datosActual.id;

    if (datosActual.codigo) {
      datosActual.code = datosActual.codigo;
      delete datosActual.codigo;
    }

    if (datosActual.thumbnail && typeof datosActual.thumbnail === 'string') {
      datosActual.thumbnails = [datosActual.thumbnail];
      delete datosActual.thumbnail;
    }

    if (datosActual.price !== undefined) {
      datosActual.price = Number(datosActual.price);
      if (isNaN(datosActual.price)) {
        throw new Error('El precio debe ser un número válido');
      }
    }

    if (datosActual.stock !== undefined) {
      datosActual.stock = Number(datosActual.stock);
      if (isNaN(datosActual.stock)) {
        throw new Error('El stock debe ser un número válido');
      }
    }

    if (datosActual.status !== undefined) {
      datosActual.status = Boolean(datosActual.status);
    }

    if (datosActual.code && productos.some(producto => producto.code === datosActual.code && producto.id !== id)) {
      throw new Error('El código del producto debe ser único');
    }

    productos[ind] = { ...productos[ind], ...datosActual };
    await this.setProductos(productos);
    return productos[ind];
  }

  static async delProducto(id) {
    const productos = await this.cargarProductos();
    const ind = productos.findIndex(producto => producto.id === id);
    
    if (ind === -1) {
      return false;
    }

    productos.splice(ind, 1);
    await this.setProductos(productos);
    return true;
  }
}

module.exports = ProductManager;
