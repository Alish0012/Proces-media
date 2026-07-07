const crypto = require('crypto');
const config = require('../config');

const PAYMENT_FORM_URL = 'https://www.shopier.com/ShowProduct/api_pay4.php';

// NOT: Alan adları Shopier'in yaygın kullanılan "Ödeme Formu API"sine göre yazıldı.
// Shopier mağaza panelinden alınan güncel API dokümanıyla (özellikle alan isimleri
// ve para birimi/dil kodları) karşılaştırıp gerekirse güncelleyin.
function sign(randomNr, orderId) {
  return crypto
    .createHmac('sha256', config.shopier.apiSecret)
    .update(String(randomNr) + String(orderId))
    .digest('base64');
}

function buildPaymentFormFields(order, buyer) {
  const randomNr = crypto.randomInt(100000, 999999);
  const platformOrderId = String(order.id);

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
      total_order_value: Number(order.total).toFixed(2),
      currency: '0', // 0 = TRY
      platform: '0',
      is_in_frame: '0',
      current_language: '0', // 0 = TR
      modul_version: '1.0.4',
      random_nr: String(randomNr),
      signature: sign(randomNr, platformOrderId),
    },
  };
}

function verifyCallbackSignature(payload) {
  const { random_nr: randomNr, platform_order_id: orderId, signature } = payload;
  if (!randomNr || !orderId || !signature) return false;
  const expected = Buffer.from(sign(randomNr, orderId));
  const received = Buffer.from(String(signature));
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(expected, received);
}

module.exports = { buildPaymentFormFields, verifyCallbackSignature };
