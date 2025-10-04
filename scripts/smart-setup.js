require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function smartSetup() {
  console.log('🔍 Detectando configuración disponible...\n');
  
  // Intentar conectar a MongoDB
  try {
    console.log('Probando conexión a MongoDB...');
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/backend1', {
      serverSelectionTimeoutMS: 3000 // Timeout rápido
    });
    
    console.log('✅ MongoDB detectado y funcionando');
    await mongoose.disconnect();
    
    // MongoDB disponible - usar configuración mongo
    console.log('📊 Configurando con MongoDB...');
    
    // Asegurar que .env esté configurado para mongo
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    
    if (!envContent.includes('PERSISTENCE=mongo')) {
      envContent = envContent.replace(/PERSISTENCE=.*/, 'PERSISTENCE=mongo');
      if (!envContent.includes('PERSISTENCE=')) {
        envContent += '\nPERSISTENCE=mongo\nMONGO_URL=mongodb://localhost:27017/backend1\n';
      }
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Configurado .env para MongoDB');
    }
    
    // Importar base de datos
    console.log('📥 Importando base de datos...');
    const { exec } = require('child_process');
    
    return new Promise((resolve, reject) => {
      exec('npm run db:import', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error importando BD:', error.message);
          reject(error);
          return;
        }
        console.log(stdout);
        console.log('🎉 ¡Configuración con MongoDB completada!');
        console.log('🚀 Ahora ejecuta: npm run dev');
        resolve();
      });
    });
    
  } catch (error) {
    // MongoDB no disponible - usar FileSystem
    console.log('⚠️  MongoDB no detectado, configurando FileSystem...');
    
    // Configurar .env para FileSystem
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    
    envContent = envContent.replace(/PERSISTENCE=.*/, 'PERSISTENCE=fs');
    if (!envContent.includes('PERSISTENCE=')) {
      envContent += '\nPERSISTENCE=fs\n';
    }
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Configurado .env para FileSystem');
    
    // Cargar productos desde seed
    console.log('📥 Cargando productos desde seed...');
    console.log('ℹ️  Los datos se guardarán en archivos JSON locales');
    
    const { exec } = require('child_process');
    
    return new Promise((resolve, reject) => {
      exec('npm run db:seed', (error, stdout, stderr) => {
        if (error) {
          console.log('⚠️  No se pudo cargar seed, pero el servidor funcionará');
          console.log('💡 Puedes crear productos desde la interfaz web');
        } else {
          console.log(stdout);
        }
        
        console.log('🎉 ¡Configuración con FileSystem completada!');
        console.log('🚀 Ahora ejecuta: npm run dev');
        console.log('📁 Los datos se guardarán en: src/data/');
        resolve();
      });
    });
  }
}

smartSetup().catch(console.error);