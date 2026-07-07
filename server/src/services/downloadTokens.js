const crypto = require('crypto');
const db = require('../db');
const config = require('../config');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function issueToken({ userId, productId, orderId }) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + config.downloadTokenTtlMinutes * 60 * 1000);

  await db.query(
    `INSERT INTO download_tokens (user_id, product_id, order_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, productId, orderId, tokenHash, expiresAt]
  );

  return { token, expiresAt };
}

// Tek kullanımlık: doğrulama ve tüketme aynı sorguda yapılır (race condition'a karşı).
async function consumeToken(token) {
  const tokenHash = hashToken(token);

  const { rows } = await db.query(
    `UPDATE download_tokens
     SET used_at = now()
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
     RETURNING id, user_id, product_id, order_id`,
    [tokenHash]
  );

  return rows[0] || null;
}

module.exports = { issueToken, consumeToken };
