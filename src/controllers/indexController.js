const productsService = require('../services/products.service');
const cartsService = require('../services/carts.service');
const { PERSISTENCE } = require('../dao/factory');

exports.renderHome = async (req, res, next) => {
  try {
    const [allProducts, productStats, cartStats] = await Promise.all([
      productsService.getAll(),
      productsService.getStats(),
      cartsService.getStats()
    ]);

    // Mostrar solo los últimos 10 productos
    const products = allProducts.slice(-10).reverse();

    const stats = {
      products: productStats,
      carts: cartStats,
      persistence: PERSISTENCE.toUpperCase()
    };

    res.render('pages/home', { 
      title: 'Inicio', 
      products, 
      stats 
    });
  } catch (err) { next(err); }
};

exports.renderRealtime = async (req, res, next) => {
  try {
    const [products, categories] = await Promise.all([
      productsService.getAll(),
      productsService.getCategories()
    ]);
    res.render('pages/realtime', { 
      title: 'Gestión de productos en tiempo real',
      products,
      categories
    });
  } catch (err) { next(err); }
};

exports.renderProducts = async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query, category, status } = req.query;
    
    // Obtener datos de productos y categorías en paralelo
    const [result, categories] = await Promise.all([
      productsService.listPaginated({ limit, page, sort, query, category, status }),
      productsService.getCategories()
    ]);

    const baseUrl = `${req.protocol}://${req.get('host')}/products`;
    const makeLink = (p) => {
      if (!p) return null;
      const params = new URLSearchParams({ ...req.query, page: String(p) });
      return `${baseUrl}?${params.toString()}`;
    };

    const paginationData = {
      ...result,
      prevLink: makeLink(result.prevPage),
      nextLink: makeLink(result.nextPage),
      currentQuery: req.query,
      categories
    };

    res.render('pages/products', { 
      title: 'Productos', 
      ...paginationData 
    });
  } catch (err) { next(err); }
};

exports.renderProductDetail = async (req, res, next) => {
  try {
    const pidParam = req.params.pid;
    if (!pidParam) {
      return res.status(400).render('errors/404', { title: 'Error', message: 'ID de producto inválido' });
    }
    
    // Convertir a número si es posible (para IDs numéricos de nuestro sistema)
    const pid = !isNaN(pidParam) ? Number(pidParam) : pidParam;
    
    const product = await productsService.getById(pid);
    if (!product) {
      return res.status(404).render('errors/404', { title: 'Error', message: 'Producto no encontrado' });
    }
    
    res.render('pages/product-detail', { 
      title: product.title, 
      product 
    });
  } catch (err) { 
    console.error('Error en renderProductDetail:', err);
    res.status(500).render('errors/500', { title: 'Error', message: 'Error interno del servidor' });
  }
};

exports.renderCarts = async (req, res, next) => {
  try {
    const carts = await cartsService.getAll();
    res.render('pages/carts', { title: 'Carritos', carts });
  } catch (err) { next(err); }
};

exports.renderCart = async (req, res, next) => {
  try {
    const cid = Number(req.params.cid);
    if (!Number.isFinite(cid)) {
      return res.status(400).render('errors/404', { title: 'Error', message: 'ID de carrito inválido' });
    }
    
    const cart = await cartsService.getCartWithPopulate(cid);
    if (!cart) {
      return res.status(404).render('errors/404', { title: 'Error', message: 'Carrito no encontrado' });
    }
    
    // Calcular total (filtrando productos que no existen)
    const total = cart.products.reduce((sum, item) => {
      if (item.product && item.product.price) {
        return sum + (item.product.price * item.quantity);
      }
      return sum;
    }, 0);

    // Filtrar productos válidos para mostrar
    cart.products = cart.products.filter(item => item.product && item.product._id);
    
    res.render('pages/cart', { 
      title: `Carrito #${cid}`, 
      cart,
      total: total.toFixed(2)
    });
  } catch (err) { next(err); }
};
