const mongoose = require('mongoose');

async function connectMongo(uri) {
  const url = uri || process.env.MONGO_URL || 'mongodb://localhost:27017/backend1';
  mongoose.set('strictQuery', true);
  await mongoose.connect(url, { dbName: undefined });
  console.log('[mongo] Conectado:', url);
}

module.exports = { connectMongo };