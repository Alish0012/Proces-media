const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
});

async function sendPasswordResetEmail(toEmail, resetUrl) {
  await transporter.sendMail({
    from: config.smtp.from,
    to: toEmail,
    subject: 'Proces Media - Şifre Sıfırlama',
    html: `
      <p>Merhaba,</p>
      <p>Şifreni sıfırlamak için aşağıdaki bağlantıya tıkla. Bu bağlantı 30 dakika içinde geçerliliğini yitirecek.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Bu isteği sen yapmadıysan bu e-postayı görmezden gelebilirsin.</p>
    `,
  });
}

function formatItem(item) {
  const planLabel =
    item.billing_period === 'monthly' ? 'Aylık' : item.billing_period === 'yearly' ? 'Yıllık' : null;
  const expiry = item.expires_at
    ? ` — bitiş: ${new Date(item.expires_at).toLocaleDateString('tr-TR')}`
    : '';
  const license = item.license_key ? ` — lisans anahtarı: <strong>${item.license_key}</strong>` : '';
  return `<li>${item.name}${planLabel ? ` (${planLabel}${expiry})` : ''}${license}</li>`;
}

async function sendPurchaseConfirmationEmail(toEmail, { orderId, total, items }) {
  const itemList = items.map(formatItem).join('');
  const downloadUrl = `${config.webUrl}/hesabim/urunlerim`;

  await transporter.sendMail({
    from: config.smtp.from,
    to: toEmail,
    subject: `Proces Media - Siparişiniz Alındı (#${orderId})`,
    html: `
      <p>Merhaba,</p>
      <p><strong>#${orderId}</strong> numaralı siparişiniz onaylandı. Toplam: <strong>${total} TL</strong></p>
      <ul>${itemList}</ul>
      <p>Ürünlerini indirmek için <a href="${downloadUrl}">hesabım sayfasına</a> giriş yapabilirsin.</p>
    `,
  });
}

async function sendNewSaleNotification(ownerEmail, { buyerEmail, buyerName, orderId, total, items }) {
  const itemList = items.map(formatItem).join('');

  await transporter.sendMail({
    from: config.smtp.from,
    to: ownerEmail,
    subject: `Yeni satış! Sipariş #${orderId}`,
    html: `
      <p>Yeni bir satış gerçekleşti.</p>
      <p>Alıcı: ${buyerName || buyerEmail} (${buyerEmail})</p>
      <p>Toplam: <strong>${total} TL</strong></p>
      <ul>${itemList}</ul>
    `,
  });
}

module.exports = { sendPasswordResetEmail, sendPurchaseConfirmationEmail, sendNewSaleNotification };
