const express = require('express');
const querystring = require('querystring');
const { verifyOsbHash, parseOsbPayload } = require('../services/shopier');
const { markOrderPaid, sendOrderEmails } = require('../services/orderFulfillment');

const router = express.Router();

// Shopier'in "OSB Testi" aracı ve gerçek bildirimleri multipart/form-data
// gönderiyor (Content-Type header'ı garanti değil) — bu yüzden ham gövdeyi
// alıp Content-Type'a göre kendimiz parse ediyoruz.
function parseMultipart(rawBody, contentType) {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/);
  if (!boundaryMatch) return {};
  const boundary = '--' + (boundaryMatch[1] || boundaryMatch[2]).trim();
  const fields = {};
  for (const part of rawBody.split(boundary)) {
    const match = part.match(/name="([^"]+)"\r\n\r\n([\s\S]*?)\r\n$/);
    if (match) fields[match[1]] = match[2];
  }
  return fields;
}

function parseBody(rawBody, contentType) {
  if (contentType.includes('multipart/form-data')) return parseMultipart(rawBody, contentType);
  if (contentType.includes('application/json')) return JSON.parse(rawBody || '{}');
  return querystring.parse(rawBody);
}

// Shopier ödeme sonrası bu endpoint'e POST yapar ("Otomatik Sipariş Bildirimi").
// NOT: Bu URL'i Shopier mağaza panelinde Entegrasyonlar > Otomatik Sipariş
// Bildirimi bölümünde "Bildirim URL" olarak tanımlamak (ve aktifleştirmek) gerekir.
router.post('/callback', express.raw({ type: () => true, limit: '1mb' }), async (req, res, next) => {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body || '');
    const contentType = req.headers['content-type'] || '';
    const fields = parseBody(rawBody, contentType);

    if (!fields.res || !fields.hash) {
      return res.status(400).send('missing parameter');
    }

    if (!verifyOsbHash(fields.res, fields.hash)) {
      return res.status(400).send('invalid signature');
    }

    const payload = parseOsbPayload(fields.res);

    // Shopier panelindeki "OSB Testi" aracı istest:1 ile gerçek olmayan bir
    // bildirim gönderir — sadece bağlantı/imza doğrulaması için, sipariş
    // güncellenmemeli.
    if (Number(payload.istest) === 1) {
      return res.send('success');
    }

    // orderid, ödeme formunu oluştururken gönderdiğimiz platform_order_id'nin
    // (yani kendi orders.id'mizin) aynısıdır.
    const orderId = Number(payload.orderid);
    const order = await markOrderPaid({ orderId, pspReference: payload.orderid });
    if (order) await sendOrderEmails(order);

    // Shopier'in resmi OSB örnek kodu, doğrulamanın başarılı sayılması için
    // yanıt gövdesinin TAM OLARAK "success" metnini içermesini bekliyor.
    res.send('success');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
