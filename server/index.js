const express = require('express');
const cors    = require('cors');
const path    = require('path');
const os      = require('os');
const fs      = require('fs');
require('dotenv').config();

const { connectDB, initAdmin } = require('./utils/db');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/galleries', require('./routes/galleries'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/g',         require('./routes/client'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', name: 'Selecta API v2.0' }));

// Serve React build (production / LAN)
const DIST = path.join(__dirname, '../client/dist');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST, { maxAge: '1h' }));
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

function getLocalIP() {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const i of ifaces) {
      if (i.family === 'IPv4' && !i.internal) return i.address;
    }
  }
  return 'localhost';
}

connectDB()
  .then(initAdmin)
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n  Selecta corriendo:`);
      console.log(`  Local:   http://localhost:${PORT}`);
      console.log(`  Red LAN: http://${getLocalIP()}:${PORT}\n`);
    });
  })
  .catch(err => {
    console.error('Error al iniciar:', err.message);
    process.exit(1);
  });
