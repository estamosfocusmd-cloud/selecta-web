const express   = require('express');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Gallery   = require('../models/Gallery');
const Selection = require('../models/Selection');
const { authenticateGallery } = require('../middleware/auth');

const router = express.Router();

// GET /:slug — public info
router.get('/:slug', async (req, res) => {
  try {
    const g = await Gallery.findOne({ slug: req.params.slug }).lean();
    if (!g) return res.status(404).json({ error: 'Galería no encontrada' });
    res.json({
      id:            g._id.toString(),
      name:          g.name,
      clientName:    g.clientName,
      hasPassword:   g.hasPassword,
      maxSelections: g.maxSelections,
      status:        g.status,
      photoCount:    g.photos.length
    });
  } catch { res.status(500).json({ error: 'Error del servidor' }); }
});

// POST /:slug/access — validate password, issue gallery token
router.post('/:slug/access', async (req, res) => {
  try {
    const g = await Gallery.findOne({ slug: req.params.slug });
    if (!g) return res.status(404).json({ error: 'Galería no encontrada' });
    if (g.status !== 'active')
      return res.status(403).json({ error: 'Esta galería ya no está disponible' });

    if (g.hasPassword) {
      const { password } = req.body;
      if (!password) return res.status(401).json({ error: 'Contraseña requerida' });
      const valid = await bcrypt.compare(password, g.passwordHash);
      if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { galleryId: g._id.toString(), slug: req.params.slug, type: 'gallery' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token });
  } catch { res.status(500).json({ error: 'Error del servidor' }); }
});

// GET /:slug/photos — requires gallery token
router.get('/:slug/photos', authenticateGallery, async (req, res) => {
  try {
    const g = await Gallery.findOne({ slug: req.params.slug }).lean();
    if (!g) return res.status(404).json({ error: 'Galería no encontrada' });
    if (g.status !== 'active')
      return res.status(403).json({ error: 'Esta galería ya no está disponible' });

    const photos = [...g.photos]
      .sort((a, b) => a.order - b.order)
      .map(p => ({ id: p._id.toString(), originalName: p.originalName, url: p.url, order: p.order }));
    res.json(photos);
  } catch { res.status(500).json({ error: 'Error del servidor' }); }
});

// POST /:slug/selection — submit selection
router.post('/:slug/selection', authenticateGallery, async (req, res) => {
  try {
    const g = await Gallery.findOne({ slug: req.params.slug }).lean();
    if (!g) return res.status(404).json({ error: 'Galería no encontrada' });

    const { selectedPhotos, clientName, note } = req.body;
    if (!Array.isArray(selectedPhotos) || selectedPhotos.length === 0)
      return res.status(400).json({ error: 'Debes seleccionar al menos una foto' });

    const validIds = g.photos.map(p => p._id.toString());
    const valid    = selectedPhotos.filter(id => validIds.includes(id));
    if (valid.length === 0)
      return res.status(400).json({ error: 'No se seleccionaron fotos válidas' });

    const sel = await Selection.create({
      galleryId:   g._id,
      galleryName: g.name,
      clientName:  clientName || 'Cliente',
      selectedPhotos: valid,
      selectedPhotoDetails: valid.map(id => {
        const p = g.photos.find(ph => ph._id.toString() === id);
        return { id, originalName: p?.originalName || '', filename: p?.originalName || '' };
      }),
      note: note || ''
    });

    res.json({ success: true, selectionId: sel._id.toString(), count: valid.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar selección' });
  }
});

module.exports = router;
