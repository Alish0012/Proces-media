const rateLimit = require('express-rate-limit');

// Genel API limiti: kötüye kullanımı/otomatik taramaları yavaşlatır.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla istek gönderildi, lütfen biraz sonra tekrar deneyin.' },
});

// Kayıt/giriş/şifre sıfırlama: brute-force, kimlik doldurma (credential stuffing)
// ve e-posta bombalama saldırılarına karşı çok daha sıkı bir limit.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla deneme yapıldı, lütfen 15 dakika sonra tekrar deneyin.' },
});

module.exports = { apiLimiter, authLimiter };
