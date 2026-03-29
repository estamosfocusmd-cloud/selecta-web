const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../data');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

function readData(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch {
    return null;
  }
}

function writeData(filename, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf8');
}

async function initStorage() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  if (!readData('galleries.json')) {
    writeData('galleries.json', { galleries: [] });
  }
  if (!readData('selections.json')) {
    writeData('selections.json', { selections: [] });
  }

  const auth = readData('auth.json');
  if (!auth || !auth.users || auth.users.length === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'selecta123';
    const hash = await bcrypt.hash(password, 10);
    writeData('auth.json', {
      users: [{ id: '1', username, password: hash, name: 'Fotógrafo' }]
    });
    console.log(`Usuario creado: ${username} / ${password}`);
  }
}

module.exports = { readData, writeData, initStorage };
