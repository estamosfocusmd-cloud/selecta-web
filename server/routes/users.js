const express  = require('express');
const bcrypt   = require('bcryptjs');
const multer   = require('multer');
const User     = require('../models/User');
const { uploadStream, deleteImage } = require('../utils/cloudinary');
const { authenticatePhotographer }  = require('../middleware/auth');

const router  = express.Router();
const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
router.use(authenticatePhotographer);

function userPublic(u) {
  return {
    id:           u._id.toString(),
    username:     u.username     || '',
    email:        u.email        || '',
    name:         u.name,
    verified:     u.verified,
    brandName:    u.brandName    || '',
    bio:          u.bio          || '',
    profileImage: u.profileImage || null,
    location:     u.location     || '',
    socialLink:   u.socialLink   || '',
    slug:         u.slug         || ''
  };
}

// GET /users — list all (admin use)
router.get('/', async (_req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json(users.map(u => ({ ...u, id: u._id.toString() })));
  } catch { res.status(500).json({ error: 'Error del servidor' }); }
});

// PATCH /users/profile — update own profile
router.patch('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { name, brandName, bio, location, socialLink, slug } = req.body;
    if (name)      user.name      = name.trim();
    if (brandName !== undefined) user.brandName = brandName.trim();
    if (bio       !== undefined) user.bio       = bio.slice(0, 300);
    if (location  !== undefined) user.location  = location.trim();
    if (socialLink !== undefined) user.socialLink = socialLink.trim();
    if (slug !== undefined) {
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (cleanSlug) {
        const taken = await User.findOne({ slug: cleanSlug, _id: { $ne: user._id } });
        if (taken) return res.status(409).json({ error: 'Ese nombre de usuario ya está en uso' });
        user.slug = cleanSlug;
      }
    }

    await user.save();
    res.json(userPublic(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// POST /users/profile/photo — upload profile picture
router.post('/profile/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (user.profilePublicId) {
      try { await deleteImage(user.profilePublicId); } catch {}
    }

    const result = await uploadStream(req.file.buffer, {
      folder: 'selecta/profiles',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }]
    });

    user.profileImage   = result.secure_url;
    user.profilePublicId = result.public_id;
    await user.save();
    res.json({ profileImage: user.profileImage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al subir la foto' });
  }
});

// POST /users — create user (admin)
router.post('/', async (req, res) => {
  try {
    const { username, name, password, email } = req.body;
    if (!name || !password)
      return res.status(400).json({ error: 'Nombre y contraseña son requeridos' });
    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username?.trim(),
      email:    email?.toLowerCase().trim(),
      name:     name.trim(),
      password: hash,
      verified: true
    });
    res.status(201).json(userPublic(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// PATCH /:id/password
router.patch('/:id/password', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Error al cambiar contraseña' }); }
});

// DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ error: 'No podés eliminar tu propia cuenta' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Error al eliminar usuario' }); }
});

module.exports = router;
