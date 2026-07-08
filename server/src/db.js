const { Pool } = require('pg');
const config = require('./config');

// Runtime sorguları kısıtlı yetkili procesmedia_app rolü üzerinden gider (least privilege).
const pool = new Pool({ connectionString: config.appDatabaseUrl });

// pg Pool, boşta bekleyen bir client'ta bağlantı hatası (ör. DB yeniden başlarken
// bağlantının kopması) olduğunda 'error' event'i yayınlar; dinleyici yoksa bu
// yakalanmamış istisna olarak tüm Node sürecini çökertir.
pool.on('error', (err) => {
  console.error('Beklenmeyen veritabanı bağlantı hatası:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
