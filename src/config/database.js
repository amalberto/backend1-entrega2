const fs = require('fs/promises');
const { paths } = require('./environment');

async function ensureFile(filePath) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '[]');
  }
}

async function initFS() {
  await fs.mkdir(paths.data, { recursive: true });
  await ensureFile(paths.productsFile);
  await ensureFile(paths.cartsFile);
}

module.exports = { initFS };
