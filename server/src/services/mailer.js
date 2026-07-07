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

module.exports = { sendPasswordResetEmail };
