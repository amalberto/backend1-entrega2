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
