const jwt = require('jsonwebtoken');

function authenticatePhotographer(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'photographer') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function authenticateGallery(req, res, next) {
  const token = req.headers['x-gallery-token'];
  if (!token) {
    return res.status(401).json({ error: 'Token de galería requerido' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'gallery') {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.gallery = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token de galería inválido o expirado' });
  }
}

module.exports = { authenticatePhotographer, authenticateGallery };
