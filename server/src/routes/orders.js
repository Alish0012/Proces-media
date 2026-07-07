const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { buildPaymentFormFields } = require('../services/shopier');

const router = express.Router();

// Sepet: [{ productId }, ...] -> sipariş oluşturur ve Shopier ödeme formu alanlarını döner.
router.post('/', requireAuth, async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Sepet boş olamaz.' });
    }

    const productIds = items.map((i) => i.productId);
    const { rows: products } = await client.query(
      `SELECT id, name, price FROM products WHERE id = ANY($1::int[])`,
      [productIds]
    );
    if (products.length !== new Set(productIds).size) {
      return res.status(400).json({ error: 'Sepetteki bazı ürünler bulunamadı.' });
    }

    const total = products.reduce((sum, p) => sum + Number(p.price), 0);

    await client.query('BEGIN');
    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (user_id, status, total) VALUES ($1, 'pending', $2) RETURNING id, total`,
      [req.user.id, total]
    );
    const order = orderRows[0];

    for (const product of products) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, price) VALUES ($1, $2, $3)`,
        [order.id, product.id, product.price]
      );
    }
    await client.query('COMMIT');

    const { rows: userRows } = await client.query('SELECT id, name, email FROM users WHERE id = $1', [
      req.user.id,
    ]);
    const buyer = userRows[0];

    const payment = buildPaymentFormFields(order, buyer);
    res.status(201).json({ orderId: order.id, payment });
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
