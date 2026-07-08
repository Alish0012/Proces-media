require('dotenv').config();

// Uygulama çalışırken zayıf/varsayılan bir gizli anahtarla ayağa kalkmasın diye
// erken ve net şekilde hata veriyoruz (sessizce güvensiz bir varsayılana düşmek yerine).
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error(
    'JWT_SECRET .env dosyasında tanımlı olmalı ve en az 32 karakter uzunluğunda olmalı. ' +
      'Üretmek için: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
}

// Uygulama zamanında (routes/services) kullanılan bağlantı, kısıtlı yetkili
// procesmedia_app rolünü kullanmalı (least privilege) — postgres superuser'ı DEĞİL.
// DATABASE_URL yalnızca migrate/seed gibi şema değişikliği yapan betikler için ayrılmıştır.
if (!process.env.APP_DATABASE_URL) {
  throw new Error('APP_DATABASE_URL .env dosyasında tanımlı olmalı (kısıtlı yetkili DB rolü).');
}

module.exports = {
  port: process.env.PORT || 4000,
  appUrl: process.env.APP_URL || 'http://localhost:4000',
  webUrl: process.env.WEB_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL,
  appDatabaseUrl: process.env.APP_DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || 'Proces Media <no-reply@procesmedia.com>',
  },
  ownerEmail: process.env.OWNER_EMAIL || null,
  iyzico: {
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    // Yanlışlıkla gerçek para hareketi olmasın diye varsayılan sandbox — canlıya
    // alırken IYZICO_BASE_URL'i https://api.iyzipay.com yapmanız gerekir.
    baseUrl: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
  },
  downloadTokenTtlMinutes: Number(process.env.DOWNLOAD_TOKEN_TTL_MINUTES) || 10,
};
