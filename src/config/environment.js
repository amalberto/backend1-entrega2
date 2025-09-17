const path = require('path');

const ROOT   = path.resolve(__dirname, '..', '..');
const SRC    = path.join(ROOT, 'src');
const PUBLIC = path.join(ROOT, 'public');
const VIEWS  = path.join(SRC, 'views');
const DATA   = path.join(SRC, 'data');

const paths = {
  root: ROOT,
  src: SRC,
  public: PUBLIC,
  views: VIEWS,
  data: DATA,
  productsFile: path.join(DATA, 'products.json'),
  cartsFile: path.join(DATA, 'carts.json'),
};

module.exports = { paths };
