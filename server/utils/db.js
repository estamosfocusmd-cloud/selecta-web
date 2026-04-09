const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI no está configurado en las variables de entorno');
  await mongoose.connect(uri);
  console.log('  MongoDB conectado');
}

async function initAdmin() {
  const User = require('../models/User');
  const count = await User.countDocuments();
  if (count === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'selecta123';
    const email    = process.env.ADMIN_EMAIL    || 'admin@selecta.app';
    const hash     = await bcrypt.hash(password, 10);
    await User.create({ username, name: 'Administrador', email, password: hash, verified: true });
    console.log(`  Usuario admin creado: ${username}`);
  } else {
    // Asegurar que el admin existente tenga email y verified
    await User.updateMany(
      { verified: { $exists: false } },
      { $set: { verified: true } }
    );
    await User.updateMany(
      { email: { $exists: false } },
      { $set: { email: process.env.ADMIN_EMAIL || 'admin@selecta.app' } }
    );
  }
}

module.exports = { connectDB, initAdmin };
