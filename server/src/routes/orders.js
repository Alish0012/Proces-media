const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { initializeCheckoutForm } = require('../services/iyzico');
const { markOrderFailed } = require('../services/orderFulfillment');

const router = express.Router();

// Sepet: [{ productId, billingPeriod? }, ...] -> sipariş oluşturur ve iyzico
// ödeme sayfası URL'ini döner. identityNumber/phone yalnızca ilk kez isteniyor
// (hesapta yoksa) — iyzico'nun dolandırıcılık kontrolü için zorunlu tuttuğu alanlar.
router.post('/', requireAuth, async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { items, identityNumber, phone } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Sepet boş olamaz.' });
    }

    const { rows: buyerRows } = await client.query(
      'SELECT id, name, email, identity_number, phone FROM users WHERE id = $1',
      [req.user.id]
    );
    const buyer = buyerRows[0];
    const resolvedIdentityNumber = identityNumber || buyer.identity_number;
    const resolvedPhone = phone || buyer.phone;
    if (!resolvedIdentityNumber || !resolvedPhone) {
      return res.status(400).json({ error: 'Ödeme için TC Kimlik No ve telefon gereklidir.' });
    }

    const productIds = items.map((i) => i.productId);
    const { rows: products } = await client.query(
      `SELECT id, name, price, is_subscription, monthly_price, yearly_price
       FROM products WHERE id = ANY($1::int[])`,
      [productIds]
    );
    if (products.length !== new Set(productIds).size) {
      return res.status(400).json({ error: 'Sepetteki bazı ürünler bulunamadı.' });
    }
    const productsById = new Map(products.map((p) => [p.id, p]));

    // Fiyat ve plan her zaman sunucuda, DB'deki ürün bilgisinden hesaplanır —
    // istemciden gelen fiyat/plan asla doğrudan güvenilmez.
    const resolvedItems = [];
    for (const item of items) {
      const product = productsById.get(item.productId);
      if (product.is_subscription) {
        if (item.billingPeriod !== 'monthly' && item.billingPeriod !== 'yearly') {
          return res.status(400).json({ error: 'Lütfen bir abonelik planı seçin.' });
        }
        const price = item.billingPeriod === 'monthly' ? product.monthly_price : product.yearly_price;
        resolvedItems.push({ productId: product.id, name: product.name, price, billingPeriod: item.billingPeriod });
      } else {
        if (item.billingPeriod) {
          return res.status(400).json({ error: 'Bu ürün için abonelik planı geçerli değil.' });
        }
        resolvedItems.push({ productId: product.id, name: product.name, price: product.price, billingPeriod: null });
      }
    }

    const total = resolvedItems.reduce((sum, i) => sum + Number(i.price), 0);

    await client.query('BEGIN');

    if (identityNumber || phone) {
      await client.query('UPDATE users SET identity_number = $1, phone = $2 WHERE id = $3', [
        resolvedIdentityNumber,
        resolvedPhone,
        req.user.id,
      ]);
    }

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (user_id, status, total) VALUES ($1, 'pending', $2) RETURNING id, total`,
      [req.user.id, total]
    );
    const order = orderRows[0];

    for (const item of resolvedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, price, billing_period) VALUES ($1, $2, $3, $4)`,
        [order.id, item.productId, item.price, item.billingPeriod]
      );
    }
    await client.query('COMMIT');

    try {
      const result = await initializeCheckoutForm({
        order,
        items: resolvedItems,
        buyer: {
          id: buyer.id,
          name: buyer.name,
          email: buyer.email,
          identityNumber: resolvedIdentityNumber,
          phone: resolvedPhone,
        },
        ip: req.ip,
      });

      if (result.status !== 'success') {
        await markOrderFailed({ orderId: order.id });
        return res.status(502).json({ error: result.errorMessage || 'Ödeme başlatılamadı.' });
      }

      // Ödeme hiç tamamlanmadan callback'e düşerse iyzico conversationId'yi geri
      // döndürmüyor — bu durumda siparişi bulabilmek için token'ı saklıyoruz.
      await db.query('UPDATE orders SET iyzico_token = $1 WHERE id = $2', [result.token, order.id]);

      res.status(201).json({ orderId: order.id, paymentPageUrl: result.paymentPageUrl });
    } catch (paymentErr) {
      await markOrderFailed({ orderId: order.id });
      throw paymentErr;
    }
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT o.id, o.status, o.total, o.created_at,
              json_agg(json_build_object('productId', p.id, 'name', p.name, 'slug', p.slug)) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ orders: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
