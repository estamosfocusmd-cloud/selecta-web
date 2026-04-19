const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const User     = require('../models/User');
const { sendVerificationEmail, sendResetEmail } = require('../utils/email');
const { authenticatePhotographer } = require('../middleware/auth');

const router = express.Router();

function userPublic(u) {
  return {
    id:           u._id.toString(),
    username:     u.username || '',
    email:        u.email    || '',
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

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'El email no es válido' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });

    const hash  = await bcrypt.hash(password, 10);
    const autoUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now().toString(36);
    const emailsEnabled = !!process.env.RESEND_API_KEY;
    const verifyToken  = crypto.randomBytes(32).toString('hex');
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name:                    name.trim(),
      email:                   email.toLowerCase().trim(),
      password:                hash,
      username:                autoUsername,
      verified:                !emailsEnabled,
      verificationToken:       emailsEnabled ? verifyToken : null,
      verificationTokenExpiry: emailsEnabled ? verifyExpiry : null
    });

    if (emailsEnabled) {
      try {
        await sendVerificationEmail(user.email, user.name, verifyToken);
      } catch (emailErr) {
        console.error('[email error]', emailErr.message);
      }
    }

    res.status(201).json({
      message: emailsEnabled
        ? 'Cuenta creada. Revisá tu email para verificar tu cuenta.'
        : 'Cuenta creada. Ya podés iniciar sesión.',
      autoVerified: !emailsEnabled
    });
  } catch (err) {
    console.error('[register error]', err);
    res.status(500).json({ error: 'Error del servidor', detail: err.message });
  }
});

// GET /auth/verify-email?token=
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token requerido' });

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }
    });
    if (!user) return res.status(400).json({ error: 'El link de verificación es inválido o expiró' });

    user.verified                = true;
    user.verificationToken       = null;
    user.verificationTokenExpiry = null;
    await user.save();

    res.json({ message: 'Email verificado correctamente. Ya podés iniciar sesión.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /auth/login — acepta email o username
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || '').trim();
    if (!identifier || !password)
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }]
    });
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });

    if (!user.verified)
      return res.status(403).json({ error: 'Debés verificar tu email antes de iniciar sesión. Revisá tu casilla.' });

    const token = jwt.sign(
      { id: user._id.toString(), username: user.username || '', name: user.name, type: 'photographer' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.json({ token, user: userPublic(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Siempre responder OK para no revelar si el email existe
    if (!user) return res.json({ message: 'Si existe una cuenta con ese email, recibirás un link para restablecer tu contraseña.' });

    const token  = crypto.randomBytes(32).toString('hex');
    user.resetToken        = token;
    user.resetTokenExpiry  = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await user.save();

    try {
      await sendResetEmail(user.email, user.name, token);
    } catch (emailErr) {
      console.error('Email send error:', emailErr);
    }

    res.json({ message: 'Si existe una cuenta con ese email, recibirás un link para restablecer tu contraseña.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ error: 'Token y contraseña son requeridos' });
    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    const user = await User.findOne({
      resetToken:       token,
      resetTokenExpiry: { $gt: new Date() }
    });
    if (!user) return res.status(400).json({ error: 'El link expiró o es inválido. Solicitá uno nuevo.' });

    user.password         = await bcrypt.hash(password, 10);
    user.resetToken       = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente. Ya podés iniciar sesión.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET /auth/me — perfil del usuario autenticado
router.get('/me', authenticatePhotographer, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(userPublic(user));
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
