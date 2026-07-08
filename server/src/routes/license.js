const express = require('express');
const db = require('../db');

const router = express.Router();

// Kurulu eklentinin kendisi (Premiere Pro içindeki CEP paneli) bu endpoint'e
// panel açılışında ve periyodik olarak sorar. Kimlik doğrulaması (JWT) YOK —
// bunun yerine tek başına bilinmesi gereken opak bir license_key kullanılıyor
// (bkz. services/licenses.js). Bilerek public: panelin web sitesindeki oturuma
// erişimi yok, sadece kullanıcının hesabından kopyaladığı anahtarı bilir.
router.post('/verify', async (req, res, next) => {
  try {
    const { licenseKey, productSlug } = req.body;
    if (!licenseKey || !productSlug) {
      return res.status(400).json({ valid: false, error: 'licenseKey ve productSlug zorunludur.' });
    }

    const { rows } = await db.query(
      `SELECT l.user_id, l.product_id,
              bool_or(oi.expires_at IS NULL OR oi.expires_at > now()) AS active,
              MAX(oi.expires_at) FILTER (WHERE oi.expires_at IS NOT NULL) AS expires_at
       FROM licenses l
       JOIN products p ON p.id = l.product_id
       JOIN order_items oi ON oi.product_id = l.product_id
       JOIN orders o ON o.id = oi.order_id AND o.user_id = l.user_id AND o.status = 'paid'
       WHERE l.license_key = $1 AND p.slug = $2
       GROUP BY l.user_id, l.product_id`,
      [licenseKey, productSlug]
    );

    const license = rows[0];
    if (!license || !license.active) {
      return res.json({ valid: false });
    }

    res.json({ valid: true, expiresAt: license.expires_at });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
