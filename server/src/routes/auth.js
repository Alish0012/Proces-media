const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const config = require('../config');
const { requireAuth } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../services/mailer');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Ad, e-posta ve şifre zorunludur.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Şifre en az 8 karakter olmalı.' });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Bu e-posta ile zaten bir hesap var.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)
       RETURNING id, email, name, created_at`,
      [email.toLowerCase(), passwordHash, name]
    );

    const user = rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre zorunludur.' });
    }

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, created_at: user.created_at },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT id, email, name, created_at FROM users WHERE id = $1', [
      req.user.id,
    ]);
    if (!rows[0]) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'E-posta zorunludur.' });

    const { rows } = await db.query('SELECT id, email FROM users WHERE email = $1', [
      email.toLowerCase(),
    ]);
    const user = rows[0];

    // Kullanıcı bulunamasa bile aynı cevabı dön (e-posta numaralandırma saldırısını önlemek için).
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      await db.query(
        `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
        [user.id, tokenHash, expiresAt]
      );

      const resetUrl = `${config.webUrl}/sifre-sifirla?token=${token}`;
      await sendPasswordResetEmail(user.email, resetUrl);
    }

    res.json({ message: 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.' });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token ve yeni şifre zorunludur.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Şifre en az 8 karakter olmalı.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { rows } = await db.query(
      `SELECT id, user_id FROM password_resets
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()`,
      [tokenHash]
    );
    const reset = rows[0];
    if (!reset) {
      return res.status(400).json({ error: 'Bağlantı geçersiz veya süresi dolmuş.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      passwordHash,
      reset.user_id,
    ]);
    await db.query('UPDATE password_resets SET used_at = now() WHERE id = $1', [reset.id]);

    res.json({ message: 'Şifren güncellendi, şimdi giriş yapabilirsin.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
