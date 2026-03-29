const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, name: 'Fotógrafo', password: hash });
    console.log(`  Usuario admin creado: ${username}`);
  }
}

module.exports = { connectDB, initAdmin };
