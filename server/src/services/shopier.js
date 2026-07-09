const crypto = require('crypto');
const config = require('../config');

const PAYMENT_FORM_URL = 'https://www.shopier.com/ShowProduct/api_pay4.php';

// NOT: Alan adları ve imza formülleri Shopier'in resmi PHP SDK'sı (erkineren/shopier)
// referans alınarak yazıldı. Giden ödeme formu imzası ile gelen callback imzası
// FARKLI alanlardan hesaplanıyor — birbirinin yerine kullanılamaz.
function signPaymentForm(randomNr, orderId, totalOrderValue, currency) {
  return crypto
    .createHmac('sha256', config.shopier.apiSecret)
    .update(String(randomNr) + String(orderId) + String(totalOrderValue) + String(currency))
    .digest('base64');
}

// Otomatik Sipariş Bildirimi (OSB/callback) doğrulaması — giden ödeme formu
// imzasından TAMAMEN FARKLI bir mekanizma. Shopier callback'te iki alan gönderir:
// "res" (sipariş bilgisini içeren base64 JSON) ve "hash" (doğrulama). Formül,
// gerçek bir OSB testi yakalanıp bağımsız doğrulanarak tespit edildi:
// hash = HMAC-SHA256(key=API_secret, data=res + API_key).hex()
// (Shopier'in resmi/güncel dokümantasyonu bunu tam olarak açıklamıyor; bu formül
// gerçek trafik yakalanarak doğrulandı — bkz. server/README veya proje notları.)
function verifyOsbHash(resBase64, hash) {
  if (!resBase64 || !hash) return false;
  const expected = crypto
    .createHmac('sha256', config.shopier.apiSecret)
    .update(String(resBase64) + config.shopier.apiKey)
    .digest('hex');
  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(String(hash));
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

function parseOsbPayload(resBase64) {
  return JSON.parse(Buffer.from(resBase64, 'base64').toString('utf8'));
}

function buildPaymentFormFields(order, buyer) {
  const randomNr = crypto.randomInt(100000, 999999);
  const platformOrderId = String(order.id);
  const totalOrderValue = Number(order.total).toFixed(2);
  const currency = '0'; // 0 = TRY

  return {
    postUrl: PAYMENT_FORM_URL,
    fields: {
      API_key: config.shopier.apiKey,
      website_index: config.shopier.websiteIndex,
      platform_order_id: platformOrderId,
      product_name: `Proces Media Sipariş #${order.id}`,
      product_type: '1', // 1 = indirilebilir/dijital ürün
      buyer_name: buyer.name || buyer.email,
      buyer_surname: '-',
      buyer_email: buyer.email,
      buyer_account_age: '0',
      buyer_id_nr: String(buyer.id),
      buyer_phone: buyer.phone || '',
      billing_address: '-',
      billing_city: '-',
      billing_country: 'Turkey',
      billing_postcode: '00000',
      shipping_address: '-',
      shipping_city: '-',
      shipping_country: 'Turkey',
      shipping_postcode: '00000',
      total_order_value: totalOrderValue,
      currency,
      platform: '0',
      is_in_frame: '0',
      current_language: '0', // 0 = TR
      modul_version: '1.0.4',
      random_nr: String(randomNr),
      signature: signPaymentForm(randomNr, platformOrderId, totalOrderValue, currency),
    },
  };
}

module.exports = { buildPaymentFormFields, verifyOsbHash, parseOsbPayload };
