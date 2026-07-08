const db = require('../db');
const config = require('../config');
const { ensureLicense } = require('./licenses');
const { sendPurchaseConfirmationEmail, sendNewSaleNotification } = require('./mailer');

// Bir siparişi "ödendi" olarak işaretler ve ödeme sağlayıcısından bağımsız
// ortak sonuçları uygular: abonelik kalemlerine erişim
// süresi damgalar, lisans anahtarı oluşturur. status != 'paid' koşulu, aynı
// bildirim tekrar gelirse (callback retry) ikinci kez işlenmemesini sağlar.
// Dönen değer null ise sipariş zaten ödenmişti veya bulunamadı — çağıran taraf
// bu durumda mail göndermemeli.
async function markOrderPaid({ orderId, pspReference }) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE orders SET status = 'paid', psp_reference = $1
       WHERE id = $2 AND status != 'paid'
       RETURNING id, user_id, total`,
      [pspReference || null, orderId]
    );

    const order = rows[0];
    if (!order) {
      await client.query('ROLLBACK');
      return null;
    }

    const { rows: subscriptionItems } = await client.query(
      `UPDATE order_items
       SET expires_at = now() + CASE billing_period
                                   WHEN 'monthly' THEN INTERVAL '1 month'
                                   WHEN 'yearly' THEN INTERVAL '1 year'
                                 END
       WHERE order_id = $1 AND billing_period IS NOT NULL
       RETURNING product_id`,
      [order.id]
    );

    const uniqueProductIds = [...new Set(subscriptionItems.map((i) => i.product_id))];
    for (const productId of uniqueProductIds) {
      await ensureLicense(client, order.user_id, productId);
    }

    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

async function markOrderFailed({ orderId, pspReference }) {
  await db.query(
    `UPDATE orders SET status = 'failed', psp_reference = $1 WHERE id = $2 AND status != 'paid'`,
    [pspReference || null, orderId]
  );
}

// Mail gönderimi bilerek DB transaction'ının DIŞINDA yapılır — SMTP yavaş/başarısız
// olsa bile sipariş/lisans durumu zaten kalıcı olarak işlenmiş olur.
async function sendOrderEmails(order) {
  try {
    const [{ rows: userRows }, { rows: itemRows }] = await Promise.all([
      db.query('SELECT email, name FROM users WHERE id = $1', [order.user_id]),
      db.query(
        `SELECT p.name, oi.billing_period, oi.expires_at, l.license_key
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         LEFT JOIN licenses l ON l.product_id = oi.product_id AND l.user_id = $2
         WHERE oi.order_id = $1`,
        [order.id, order.user_id]
      ),
    ]);
    const buyer = userRows[0];
    if (!buyer) return;

    const results = await Promise.allSettled([
      sendPurchaseConfirmationEmail(buyer.email, { orderId: order.id, total: order.total, items: itemRows }),
      config.ownerEmail
        ? sendNewSaleNotification(config.ownerEmail, {
            buyerEmail: buyer.email,
            buyerName: buyer.name,
            orderId: order.id,
            total: order.total,
            items: itemRows,
          })
        : Promise.resolve(),
    ]);
    results
      .filter((r) => r.status === 'rejected')
      .forEach((r) => console.error('Sipariş e-postası gönderilemedi:', r.reason));
  } catch (mailErr) {
    console.error('Sipariş e-postaları gönderilemedi:', mailErr);
  }
}

module.exports = { markOrderPaid, markOrderFailed, sendOrderEmails };
