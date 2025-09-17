const fs = require('fs/promises');
const { paths } = require('../../config/environment');

async function readFile() {
  try {
    const raw = await fs.readFile(paths.cartsFile, 'utf-8');
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(paths.cartsFile, '[]');
      return [];
    }
    throw new Error(`Error leyendo carritos: ${err.message}`);
  }
}

async function writeFile(data) {
  try {
    await fs.writeFile(paths.cartsFile, JSON.stringify(data, null, 2));
  } catch (err) {
    throw new Error(`Error escribiendo carritos: ${err.message}`);
  }
}

exports.createCart = async () => {
  try {
    const data = await readFile();
    const id = data.length ? Math.max(...data.map(c => Number(c.id))) + 1 : 1;
    const cart = { id, products: [] };
    data.push(cart);
    await writeFile(data);
    return cart;
  } catch (err) { throw err; }
};

exports.getById = async (cid) => {
  try {
    const data = await readFile();
    return data.find(c => Number(c.id) === Number(cid)) || null;
  } catch (err) { throw err; }
};

exports.addProduct = async (cid, pid) => {
  try {
    const data = await readFile();
    const idx = data.findIndex(c => Number(c.id) === Number(cid));
    if (idx === -1) return null;

    const cart = data[idx];
    const line = cart.products.find(p => Number(p.product) === Number(pid));
    if (line) line.quantity += 1;
    else cart.products.push({ product: Number(pid), quantity: 1 });

    data[idx] = cart;
    await writeFile(data);
    return cart;
  } catch (err) { throw err; }
};
