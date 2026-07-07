const express = require('express');
const db = require('../db');
const { verifyCallbackSignature } = require('../services/shopier');

const router = express.Router();

// Shopier ödeme sonrası bu endpoint'e (form-urlencoded) POST yapar.
// NOT: Bu URL'i Shopier mağaza panelinde "ödeme sonrası bildirim / callback" adresi olarak tanımlamak gerekir.
router.post('/callback', express.urlencoded({ extended: false }), async (req, res, next) => {
  try {
    const payload = req.body;

    if (!verifyCallbackSignature(payload)) {
      return res.status(400).send('invalid signature');
    }

    const orderId = Number(payload.platform_order_id);
    const status = payload.status === 'success' ? 'paid' : 'failed';

    await db.query(
      `UPDATE orders SET status = $1, shopier_order_id = $2 WHERE id = $3`,
      [status, payload.payment_id || null, orderId]
    );

    res.send('OK');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
