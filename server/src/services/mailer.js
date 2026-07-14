const dns = require('dns');
const nodemailer = require('nodemailer');
const config = require('../config');

// nodemailer, SMTP host'unu çözerken IPv4 ve IPv6 adresleri arasından RASTGELE
// seçim yapıyor (lib/shared/index.js, Math.random()) — IPv4 önce listelense bile.
// Railway'in konteyner ağı IPv6 egress desteklemediği için bu seçim yaklaşık
// yarı yarıya ENETUNREACH ile başarısız oluyordu. Host'u kendimiz IPv4'e
// çözüp doğrudan IP olarak veriyoruz (nodemailer, host zaten bir IP ise kendi
// DNS seçimini atlıyor); TLS sertifika doğrulaması için servername korunuyor.
function getTransporter() {
  return new Promise((resolve) => {
    dns.resolve4(config.smtp.host, (err, addresses) => {
      const host = !err && addresses && addresses.length ? addresses[0] : config.smtp.host;
      resolve(
        nodemailer.createTransport({
          host,
          port: config.smtp.port,
          secure: config.smtp.port === 465,
          auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
          tls: { servername: config.smtp.host },
        })
      );
    });
  });
}

async function sendPasswordResetEmail(toEmail, resetUrl) {
  const transporter = await getTransporter();
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
  const transporter = await getTransporter();

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
  const transporter = await getTransporter();

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

const CATEGORY_LABELS = { oneri: 'Öneri', hata: 'Hata Bildirimi', diger: 'Diğer' };

async function sendFeedbackNotification(ownerEmail, { name, email, category, message }) {
  const transporter = await getTransporter();
  await transporter.sendMail({
    from: config.smtp.from,
    to: ownerEmail,
    subject: `Yeni ${CATEGORY_LABELS[category] || category} - Dilek ve Öneri`,
    html: `
      <p><strong>Gönderen:</strong> ${name} (${email})</p>
      <p><strong>Konu:</strong> ${CATEGORY_LABELS[category] || category}</p>
      <p><strong>Mesaj:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  });
}

module.exports = {
  sendPasswordResetEmail,
  sendPurchaseConfirmationEmail,
  sendNewSaleNotification,
  sendFeedbackNotification,
};
