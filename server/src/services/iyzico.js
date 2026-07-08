const Iyzipay = require('iyzipay');
const config = require('../config');

const iyzipay = new Iyzipay({
  apiKey: config.iyzico.apiKey,
  secretKey: config.iyzico.secretKey,
  uri: config.iyzico.baseUrl,
});

// Dijital ürün satıyoruz, gerçek bir kargo adresi yok — iyzico yine de
// billing/shipping adres alanlarını zorunlu kılıyor, bu yüzden sabit bir
// "dijital teslimat" adresi kullanılıyor (dolandırıcılık skoru asıl olarak
// kimlik no + IP + kart bilgisi tutarlılığına bakıyor, adres metnine değil).
function digitalAddress(buyer) {
  return {
    contactName: buyer.name,
    address: 'Dijital teslimat (fiziksel adres yok)',
    city: 'Istanbul',
    country: 'Turkey',
    zipCode: '00000',
  };
}

// order: { id, total }, items: [{ productId, name, price }],
// buyer: { id, name, email, identityNumber, phone }, ip: string
function initializeCheckoutForm({ order, items, buyer, ip }) {
  return new Promise((resolve, reject) => {
    iyzipay.checkoutFormInitialize.create(
      {
        locale: Iyzipay.LOCALE.TR,
        conversationId: String(order.id),
        price: Number(order.total).toFixed(2),
        paidPrice: Number(order.total).toFixed(2),
        currency: Iyzipay.CURRENCY.TRY,
        basketId: String(order.id),
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: `${config.appUrl}/api/iyzico/callback`,
        buyer: {
          id: String(buyer.id),
          name: buyer.name || buyer.email,
          surname: '-',
          identityNumber: buyer.identityNumber,
          email: buyer.email,
          gsmNumber: buyer.phone,
          registrationAddress: 'Dijital teslimat (fiziksel adres yok)',
          city: 'Istanbul',
          country: 'Turkey',
          zipCode: '00000',
          ip: ip || '0.0.0.0',
        },
        shippingAddress: digitalAddress(buyer),
        billingAddress: digitalAddress(buyer),
        basketItems: items.map((item) => ({
          id: String(item.productId),
          name: item.name,
          category1: 'Dijital Ürün',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: Number(item.price).toFixed(2),
        })),
      },
      function (err, result) {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

function retrieveCheckoutForm(token) {
  return new Promise((resolve, reject) => {
    iyzipay.checkoutForm.retrieve({ token, locale: Iyzipay.LOCALE.TR }, function (err, result) {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

module.exports = { initializeCheckoutForm, retrieveCheckoutForm };
