const mongoose = require('mongoose');

async function connectMongo(uri) {
  const url = uri || process.env.MONGO_URL;
  if (!url) throw new Error('MONGO_URL no configurada');
  mongoose.set('strictQuery', true);
  await mongoose.connect(url, { dbName: undefined });
  console.log('[mongo] Conectado:', url);
}

module.exports = { connectMongo };