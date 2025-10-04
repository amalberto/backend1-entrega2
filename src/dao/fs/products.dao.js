const fs = require('fs/promises');
const { paths } = require('../../config/environment');

async function readFile() {
  try {
    const raw = await fs.readFile(paths.productsFile, 'utf-8');
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(paths.productsFile, '[]');
      return [];
    }
    throw new Error(`Error leyendo productos: ${err.message}`);
  }
}

async function writeFile(data) {
  try {
    await fs.writeFile(paths.productsFile, JSON.stringify(data, null, 2));
  } catch (err) {
    throw new Error(`Error escribiendo productos: ${err.message}`);
  }
}

exports.getAll = async () => {
  try { return await readFile(); } catch (err) { throw err; }
};

exports.getById = async (id) => {
  try {
    const data = await readFile();
    return data.find(p => p.id === Number(id)) || null;
  } catch (err) { throw err; }
};

exports.create = async (product) => {
  try {
    const data = await readFile();
    const newId = data.length ? Math.max(...data.map(p => p.id)) + 1 : 1;
    const created = { ...product, id: newId };
    data.push(created);
    await writeFile(data);
    return created;
  } catch (err) { throw err; }
};

exports.update = async (id, updates) => {
  try {
    const data = await readFile();
    const idx = data.findIndex(p => p.id === Number(id));
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...updates, id: Number(id) };
    await writeFile(data);
    return data[idx];
  } catch (err) { throw err; }
};

exports.remove = async (id) => {
  try {
    const data = await readFile();
    const filtered = data.filter(p => p.id !== Number(id));
    if (filtered.length === data.length) return null;
    await writeFile(filtered);
    return Number(id);
  } catch (err) { throw err; }
};

exports.removeAll = async () => {
  try {
    const data = await readFile();
    const count = data.length;
    await writeFile([]);
    return count;
  } catch (err) { throw err; }
};

exports.paginate = async ({ page = 1, limit = 10, sort, filter = {} }) => {
  try {
    const data = await readFile();
    
    // Aplicar filtros
    let filtered = data;
    if (filter.category) {
      filtered = filtered.filter(p => p.category && p.category.toLowerCase().includes(filter.category.toLowerCase()));
    }
    if (typeof filter.status !== 'undefined') {
      filtered = filtered.filter(p => p.status === filter.status);
    }
    
    // Aplicar ordenamiento
    if (sort === 'asc') {
      filtered = filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === 'desc') {
      filtered = filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    
    // Aplicar paginación
    const _page = Math.max(1, Number(page) || 1);
    const _limit = Math.max(1, Number(limit) || 10);
    const skip = (_page - 1) * _limit;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / _limit));
    const items = filtered.slice(skip, skip + _limit);
    
    return {
      payload: items,
      total,
      limit: _limit,
      page: _page,
      totalPages,
      prevPage: _page > 1 ? _page - 1 : null,
      nextPage: _page < totalPages ? _page + 1 : null,
      hasPrevPage: _page > 1,
      hasNextPage: _page < totalPages
    };
  } catch (err) { 
    throw err; 
  }
};

exports.getUniqueCategories = async () => {
  try {
    const data = await readFile();
    const categories = [...new Set(data.map(p => p.category).filter(cat => cat && cat.trim() !== ''))];
    return categories.sort();
  } catch (err) { 
    throw err; 
  }
};
