const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, slug, name, description, price, currency, image_url, created_at
       FROM products ORDER BY created_at DESC`
    );
    res.json({ products: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, slug, name, description, price, currency, image_url, created_at
       FROM products WHERE slug = $1`,
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Ürün bulunamadı.' });
    res.json({ product: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
