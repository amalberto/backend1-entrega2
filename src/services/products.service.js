const dao = require('../dao/fs/products.dao');

exports.getAll = async () => dao.getAll();

exports.getById = async (id) => dao.getById(id);

exports.create = async (b) => {
  const faltantes = [];
  if (!b.title) faltantes.push('title');
  if (!b.description) faltantes.push('description');
  if (!b.code) faltantes.push('code');
  if (b.price === undefined) faltantes.push('price');
  if (b.stock === undefined) faltantes.push('stock');
  if (!b.category) faltantes.push('category');
  if (faltantes.length) {
    const e = new Error(`Faltan campos: ${faltantes.join(', ')}`);
    e.status = 400; throw e;
  }

  const price = Number(b.price);
  const stock = Number(b.stock);
  if (!Number.isFinite(price) || !Number.isFinite(stock)) {
    const e = new Error('price y stock deben ser numéricos');
    e.status = 400; throw e;
  }

  const all = await dao.getAll();
  if (all.some(p => String(p.code) === String(b.code))) {
    const e = new Error('el código ya existe');
    e.status = 400; throw e;
  }

  const product = {
    title: String(b.title),
    description: String(b.description),
    code: String(b.code),
    price,
    status: b.status === undefined ? true : Boolean(b.status),
    stock,
    category: String(b.category),
    thumbnails: Array.isArray(b.thumbnails) ? b.thumbnails.map(String) : []
  };

  return await dao.create(product);
};

exports.update = async (id, updates) => {
  if ('id' in updates) {
    const e = new Error('no se permite modificar el id');
    e.status = 400; throw e;
  }

  const out = { ...updates };
  if ('status' in out) out.status = Boolean(out.status);

  if ('price' in out) {
    const n = Number(out.price);
    if (!Number.isFinite(n)) { const e = new Error('precio debe ser numérico'); e.status = 400; throw e; }
    out.price = n;
  }

  if ('stock' in out) {
    const n = Number(out.stock);
    if (!Number.isFinite(n)) { const e = new Error('stock debe ser numérico'); e.status = 400; throw e; }
    out.stock = n;
  }

  if ('code' in out) {
    const all = await dao.getAll();
    const conflict = all.some(p => p.id !== id && String(p.code) === String(out.code));
    if (conflict) { const e = new Error('el código ya existe'); e.status = 400; throw e; }
  }

  return await dao.update(id, out);
};

exports.remove = async (id) => dao.remove(id);
