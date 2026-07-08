const crypto = require('crypto');

function generateLicenseKey() {
  const raw = crypto.randomBytes(10).toString('hex').toUpperCase(); // 20 karakter
  return raw.match(/.{1,4}/g).join('-'); // XXXX-XXXX-XXXX-XXXX-XXXX
}

// Kullanıcı+ürün için lisans anahtarı yoksa oluşturur, varsa mevcut olanı döner —
// böylece bir kullanıcı aboneliğini yenilediğinde eklentiye kaydettiği anahtar
// değişmez, sadece arka planda aktiflik durumu (order_items.expires_at) güncellenir.
async function ensureLicense(client, userId, productId) {
  const { rows: existing } = await client.query(
    `SELECT license_key FROM licenses WHERE user_id = $1 AND product_id = $2`,
    [userId, productId]
  );
  if (existing[0]) return existing[0].license_key;

  const licenseKey = generateLicenseKey();
  const { rows } = await client.query(
    `INSERT INTO licenses (user_id, product_id, license_key) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, product_id) DO UPDATE SET user_id = licenses.user_id
     RETURNING license_key`,
    [userId, productId, licenseKey]
  );
  return rows[0].license_key;
}

module.exports = { ensureLicense };
