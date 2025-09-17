const express = require('express');
const cors = require('cors');
const path = require('path');
const { engine } = require('express-handlebars');
const routes = require('./routes');
const { paths } = require('./config/environment');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static
app.use(express.static(paths.public));

// Handlebars
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(paths.views, 'layouts'),
  partialsDir: path.join(paths.views, 'partials'),
}));
app.set('view engine', 'hbs');
app.set('views', paths.views);

// Rutas
app.use(routes);

// 404 web
app.use((req, res, next) => {
  if (req.accepts('html')) return res.status(404).render('errors/404', { title: '404' });
  return res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler JSON
app.use(errorHandler);

module.exports = app;
