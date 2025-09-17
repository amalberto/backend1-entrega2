const productsService = require('../services/products.service');

exports.renderHome = async (req, res, next) => {
  try {
    const products = await productsService.getAll();
    res.render('pages/home', { title: 'Inicio', products });
  } catch (err) { next(err); }
};

exports.renderRealtime = (req, res) => {
  res.render('pages/realtime', { title: 'Productos en tiempo real' });
};
