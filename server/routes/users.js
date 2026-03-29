const express  = require('express');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const { authenticatePhotographer } = require('../middleware/auth');

const router = express.Router();
router.use(authenticatePhotographer);

router.get('/', async (_req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json(users.map(u => ({ ...u, id: u._id.toString() })));
  } catch { res.status(500).json({ error: 'Error del servidor' }); }
});

router.post('/', async (req, res) => {
  try {
    const { username, name, password } = req.body;
    if (!username || !name || !password)
      return res.status(400).json({ error: 'Usuario, nombre y contraseña son requeridos' });
    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ error: 'El nombre de usuario ya existe' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username: username.trim(), name: name.trim(), password: hash });
    res.status(201).json({ id: user._id.toString(), username: user.username, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

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

router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Error al eliminar usuario' }); }
});

module.exports = router;
