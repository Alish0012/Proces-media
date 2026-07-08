const express = require('express');
const db = require('../db');
const config = require('../config');
const { retrieveCheckoutForm } = require('../services/iyzico');
const { markOrderPaid, markOrderFailed, sendOrderEmails } = require('../services/orderFulfillment');

const router = express.Router();

// iyzico, kullanıcı ödeme formunu tamamladıktan sonra TARAYICIYI bu adrese
// yönlendirir (form-urlencoded POST ile bir "token" gönderir). Bu token'ın
// kendisi imzalı/güvenilir değildir — gerçek sonucu öğrenmek için iyzico'nun
// API'sine (apiKey/secretKey ile) kendi sunucumuzdan sorup teyit ediyoruz.
// conversationId olarak initialize sırasında kendi order.id'mizi göndermiştik,
// bu yüzden retrieve yanıtı bize hangi siparişin bu olduğunu güvenle söylüyor.
router.post('/callback', express.urlencoded({ extended: false }), async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token;
    if (!token) {
      return res.redirect(`${config.webUrl}/odeme-basarisiz`);
    }

    const result = await retrieveCheckoutForm(token);
    const success = result.status === 'success' && result.paymentStatus === 'SUCCESS';

    let orderId = Number(result.conversationId);
    if (!orderId) {
      // Ödeme hiç tamamlanmadan callback'e düşerse iyzico conversationId
      // döndürmüyor — initialize sırasında sakladığımız token'dan buluyoruz.
      const { rows } = await db.query('SELECT id FROM orders WHERE iyzico_token = $1', [token]);
      orderId = rows[0]?.id;
    }

    if (!orderId) {
      return res.redirect(`${config.webUrl}/odeme-basarisiz`);
    }

    if (success) {
      const order = await markOrderPaid({ orderId, pspReference: result.paymentId });
      if (order) await sendOrderEmails(order);
      return res.redirect(`${config.webUrl}/odeme-basarili?orderId=${orderId}`);
    }

    await markOrderFailed({ orderId, pspReference: result.paymentId });
    return res.redirect(`${config.webUrl}/odeme-basarisiz?orderId=${orderId}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
