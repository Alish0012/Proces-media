const express = require('express');
const path = require('path');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { issueToken, consumeToken } = require('../services/downloadTokens');
const { streamWatermarkedZip } = require('../services/watermark');

const router = express.Router();

const UPLOADS_ROOT = path.resolve(__dirname, '..', '..', 'uploads');

// Ürün dosyasının, DB'de yanlışlıkla/kötü niyetle "../" içeren bir file_path
// olsa bile uploads/ klasörünün dışına çıkamamasını garanti eder (defense-in-depth —
// file_path şu an yalnızca admin tarafından seed/SQL ile girilse de ek güvenlik katmanı).
function resolveProductDir(filePath) {
  const resolved = path.isAbsolute(filePath)
    ? path.resolve(filePath)
    : path.resolve(UPLOADS_ROOT, '..', filePath);

  const withSep = UPLOADS_ROOT.endsWith(path.sep) ? UPLOADS_ROOT : UPLOADS_ROOT + path.sep;
  if (resolved !== UPLOADS_ROOT && !resolved.startsWith(withSep)) {
    return null;
  }
  return resolved;
}

// Kullanıcının satın aldığı (paid) ürünleri listeler. Abonelik ürünlerinde süresi
// dolmuş olsa bile ürün listede kalır (active:false) — böylece kullanıcı "süresi doldu,
// yeniden satın al" durumunu görebilir; tek seferlik ürünlerde active her zaman true'dur.
router.get('/my-products', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT p.id, p.slug, p.name, p.image_url, p.is_subscription, l.license_key,
              bool_or(oi.expires_at IS NULL OR oi.expires_at > now()) AS active,
              MAX(oi.expires_at) FILTER (WHERE oi.expires_at IS NOT NULL) AS expires_at
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       LEFT JOIN licenses l ON l.product_id = p.id AND l.user_id = o.user_id
       WHERE o.user_id = $1 AND o.status = 'paid'
       GROUP BY p.id, p.slug, p.name, p.image_url, p.is_subscription, l.license_key
       ORDER BY p.id DESC`,
      [req.user.id]
    );
    res.json({ products: rows });
  } catch (err) {
    next(err);
  }
});

// Adım 1: sahiplik doğrulanır, kısa ömürlü tek kullanımlık indirme token'ı üretilir.
router.post('/:productId/token', requireAuth, async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);

    const { rows } = await db.query(
      `SELECT o.id AS order_id
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'paid'
         AND (oi.expires_at IS NULL OR oi.expires_at > now())
       ORDER BY o.created_at DESC LIMIT 1`,
      [req.user.id, productId]
    );

    const purchase = rows[0];
    if (!purchase) {
      // Aktif bir satın alma yok — hiç almamış mı yoksa süresi mi dolmuş ayırt edilir,
      // böylece kullanıcıya doğru mesaj gösterilir.
      const { rows: everPurchased } = await db.query(
        `SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
         WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'paid' LIMIT 1`,
        [req.user.id, productId]
      );
      if (everPurchased[0]) {
        return res.status(403).json({
          error: 'Aboneliğinizin süresi doldu. Devam etmek için yeniden satın almanız gerekiyor.',
          code: 'subscription_expired',
        });
      }
      return res.status(403).json({ error: 'Bu ürünü satın almadınız.' });
    }

    const { token, expiresAt } = await issueToken({
      userId: req.user.id,
      productId,
      orderId: purchase.order_id,
    });

    res.json({
      downloadUrl: `/api/downloads/file?token=${token}`,
      expiresAt,
    });
  } catch (err) {
    next(err);
  }
});

// Adım 2: token doğrulanır (tek kullanımlık), indirme loglanır, watermark'lı zip stream edilir.
router.get('/file', async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token gerekli.' });

    const consumed = await consumeToken(token);
    if (!consumed) {
      return res.status(410).json({ error: 'Bağlantının süresi dolmuş veya zaten kullanılmış.' });
    }

    const [{ rows: productRows }, { rows: userRows }] = await Promise.all([
      db.query('SELECT id, name, file_path FROM products WHERE id = $1', [consumed.product_id]),
      db.query('SELECT id, name, email FROM users WHERE id = $1', [consumed.user_id]),
    ]);

    const product = productRows[0];
    const buyer = userRows[0];
    if (!product || !buyer) {
      return res.status(404).json({ error: 'Ürün veya kullanıcı bulunamadı.' });
    }

    await db.query(
      `INSERT INTO download_logs (user_id, product_id, order_id, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [consumed.user_id, consumed.product_id, consumed.order_id, req.ip, req.get('user-agent') || '']
    );

    const productDir = resolveProductDir(product.file_path);
    if (!productDir) {
      return res.status(500).json({ error: 'Ürün dosya yolu geçersiz.' });
    }

    await streamWatermarkedZip({
      productDir,
      productName: product.name,
      buyer,
      order: { id: consumed.order_id },
      res,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
