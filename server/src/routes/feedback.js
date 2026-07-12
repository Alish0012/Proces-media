const express = require('express');
const db = require('../db');
const config = require('../config');
const { optionalAuth } = require('../middleware/auth');
const { sendFeedbackNotification } = require('../services/mailer');

const router = express.Router();
const VALID_CATEGORIES = ['oneri', 'hata', 'diger'];

router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { name, email, category, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Ad, e-posta ve mesaj zorunludur.' });
    }
    const safeCategory = VALID_CATEGORIES.includes(category) ? category : 'oneri';

    await db.query(
      `INSERT INTO feedback_messages (user_id, name, email, category, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user?.id || null, name, email, safeCategory, message]
    );

    if (config.ownerEmail) {
      sendFeedbackNotification(config.ownerEmail, { name, email, category: safeCategory, message }).catch(
        (err) => console.error('Geri bildirim e-postası gönderilemedi:', err)
      );
    }

    res.status(201).json({ message: 'Mesajınız için teşekkürler, en kısa sürede döneceğiz.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
