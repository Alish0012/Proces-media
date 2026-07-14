const dns = require('dns');
const nodemailer = require('nodemailer');
const config = require('../config');

// nodemailer, SMTP host'unu çözerken IPv4 ve IPv6 adresleri arasından RASTGELE
// seçim yapıyor (lib/shared/index.js, Math.random()) — IPv4 önce listelense bile.
// Railway'in konteyner ağı IPv6 egress desteklemediği için bu seçim yaklaşık
// yarı yarıya ENETUNREACH ile başarısız oluyordu. Ayrıca Gmail'in birden fazla
// IPv4 cephe sunucusundan biri Railway ağından zaman zaman ETIMEDOUT veriyor
// (varsayılan connectionTimeout 2 dakika). Bu yüzden host'u kendimiz IPv4'e
// çözüp TÜM adayları kısa timeout'la sırayla deniyoruz — biri yanıt vermezse
// hızlıca bir sonrakine geçiyoruz. TLS sertifika doğrulaması için servername
// (gerçek hostname) korunuyor.
function resolve4(hostname) {
  return new Promise((resolve) => {
    dns.resolve4(hostname, (err, addresses) => resolve(err ? [] : addresses || []));
  });
}

function lookup4(hostname) {
  return new Promise((resolve) => {
    dns.lookup(hostname, { family: 4, all: true }, (err, addresses) => {
      resolve(err ? [] : (addresses || []).map((a) => a.address));
    });
  });
}

// İki farklı çözümleyiciyi (c-ares tabanlı resolve4 + OS/getaddrinfo tabanlı
// lookup) birleştirip tekilleştiriyoruz — biri diğer ağdan/DNS'ten dönmeyebilir,
// birden fazla aday IP de tek istekte deneme/geçiş şansını artırır.
async function resolveIPv4Candidates(hostname) {
  const [a, b] = await Promise.all([resolve4(hostname), lookup4(hostname)]);
  const merged = [...new Set([...a, ...b])];
  return merged.length ? merged : [hostname];
}

async function sendWithRetry(mailOptions) {
  const candidates = await resolveIPv4Candidates(config.smtp.host);
  let lastErr;

  for (const host of candidates) {
    const transporter = nodemailer.createTransport({
      host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
      tls: { servername: config.smtp.host },
      connectionTimeout: 8000,
    });

    try {
      return await transporter.sendMail(mailOptions);
    } catch (err) {
      lastErr = err;
    } finally {
      transporter.close();
    }
  }

  throw lastErr;
}

async function sendPasswordResetEmail(toEmail, resetUrl) {
  await sendWithRetry({
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

  await sendWithRetry({
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

  await sendWithRetry({
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
  await sendWithRetry({
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
