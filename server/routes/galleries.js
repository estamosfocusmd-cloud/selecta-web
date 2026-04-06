const express  = require('express');
const multer   = require('multer');
const { v4: uuidv4 } = require('uuid');
const bcrypt   = require('bcryptjs');
const Gallery  = require('../models/Gallery');
const Selection = require('../models/Selection');
const { uploadStream, deleteImage } = require('../utils/cloudinary');
const { authenticatePhotographer }  = require('../middleware/auth');

const router = express.Router();
router.use(authenticatePhotographer);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file.originalname)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes JPG, PNG, WebP o GIF'));
  }
});

function galleryToJSON(g) {
  return {
    id:            g._id.toString(),
    name:          g.name,
    clientName:    g.clientName,
    slug:          g.slug,
    hasPassword:   g.hasPassword,
    maxSelections: g.maxSelections,
    status:        g.status,
    selectionMode: g.selectionMode || 'multiple',
    isFinalized:   g.isFinalized || false,
    createdAt:     g.createdAt,
    photos:        g.photos.map(p => ({
      id:           p._id.toString(),
      originalName: p.originalName,
      url:          p.url,
      order:        p.order
    }))
  };
}

// GET / — list all galleries
router.get('/', async (_req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 }).lean();
    res.json(galleries.map(g => ({
      id:            g._id.toString(),
      name:          g.name,
      clientName:    g.clientName,
      slug:          g.slug,
      hasPassword:   g.hasPassword,
      maxSelections: g.maxSelections,
      status:        g.status,
      createdAt:     g.createdAt,
      photos:        (g.photos || []).map(p => ({ id: p._id.toString(), originalName: p.originalName, url: p.url, order: p.order }))
    })));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error del servidor' }); }
});

// POST / — create gallery
router.post('/', async (req, res) => {
  try {
    const { name, clientName, password, maxSelections, customSlug, selectionMode } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es requerido' });

    let slug;
    if (customSlug && customSlug.trim()) {
      slug = customSlug.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (!slug) return res.status(400).json({ error: 'El link personalizado no es válido' });
      const existing = await Gallery.findOne({ slug });
      if (existing) return res.status(400).json({ error: 'Ese link ya está en uso, elegí otro' });
    } else {
      slug = name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
        + '-' + uuidv4().slice(0, 8);
    }

    const gallery = await Gallery.create({
      name,
      clientName: clientName || '',
      slug,
      passwordHash:  password ? await bcrypt.hash(password, 10) : null,
      hasPassword:   !!password,
      maxSelections: parseInt(maxSelections) || 0,
      selectionMode: selectionMode === 'single' ? 'single' : 'multiple',
      photos: []
    });
    res.status(201).json(galleryToJSON(gallery));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear galería' });
  }
});

// GET /:id
router.get('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ error: 'Galería no encontrada' });
    res.json(galleryToJSON(gallery));
  } catch { res.status(404).json({ error: 'Galería no encontrada' }); }
});

// PATCH /:id — toggle status
router.patch('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ error: 'Galería no encontrada' });
    if (req.body.status) gallery.status = req.body.status;
    if (req.body.selectionMode) gallery.selectionMode = req.body.selectionMode;
    if (typeof req.body.isFinalized === 'boolean') gallery.isFinalized = req.body.isFinalized;
    if (req.body.slug) {
      const newSlug = req.body.slug.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (!newSlug) return res.status(400).json({ error: 'El link no es válido' });
      const existing = await Gallery.findOne({ slug: newSlug, _id: { $ne: gallery._id } });
      if (existing) return res.status(400).json({ error: 'Ese link ya está en uso' });
      gallery.slug = newSlug;
    }
    await gallery.save();
    res.json(galleryToJSON(gallery));
  } catch { res.status(500).json({ error: 'Error del servidor' }); }
});

// DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ error: 'Galería no encontrada' });

    // Delete all images from Cloudinary
    await Promise.allSettled(gallery.photos.map(p => deleteImage(p.publicId)));

    await gallery.deleteOne();
    await Selection.deleteMany({ galleryId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar galería' });
  }
});

// POST /:id/photos — upload photos
router.post('/:id/photos', upload.array('photos', 200), async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ error: 'Galería no encontrada' });

    const uploaded = await Promise.all(req.files.map(async (file, i) => {
      const result = await uploadStream(file.buffer, {
        folder: `selecta/${req.params.id}`,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      });
      return {
        publicId:     result.public_id,
        originalName: file.originalname,
        url:          result.secure_url,
        order:        gallery.photos.length + i
      };
    }));

    gallery.photos.push(...uploaded);
    await gallery.save();

    const newPhotos = gallery.photos.slice(-uploaded.length);
    res.json(newPhotos.map(p => ({
      id: p._id.toString(), originalName: p.originalName, url: p.url, order: p.order
    })));
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Error al subir fotos' });
  }
});

// DELETE /:id/photos/:photoId
router.delete('/:id/photos/:photoId', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ error: 'Galería no encontrada' });

    const photo = gallery.photos.id(req.params.photoId);
    if (!photo) return res.status(404).json({ error: 'Foto no encontrada' });

    await deleteImage(photo.publicId);
    photo.deleteOne();
    await gallery.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar foto' });
  }
});

// GET /:id/selections
router.get('/:id/selections', async (req, res) => {
  try {
    const selections = await Selection.find({ galleryId: req.params.id }).sort({ createdAt: -1 }).lean();
    res.json(selections.map(s => ({ ...s, id: s._id.toString() })));
  } catch { res.status(500).json({ error: 'Error del servidor' }); }
});

module.exports = router;
