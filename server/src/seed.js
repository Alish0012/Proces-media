const { Pool } = require('pg');
require('dotenv').config();

// Kurulum betiği olduğu için admin bağlantısını (DATABASE_URL) kullanır.
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL .env dosyasında tanımlı olmalı (seed için admin bağlantısı).');
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  await pool.query(
    `INSERT INTO products (slug, name, description, price, currency, file_path)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (slug) DO NOTHING`,
    [
      'demo-eklenti',
      'Demo Eklenti',
      'Bu bir örnek üründür. Gerçek eklentilerinizi ekledikten sonra bu ürünü silebilirsiniz.',
      199.9,
      'TRY',
      'uploads/demo-eklenti',
    ]
  );

  console.log('Seed tamamlandı.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed başarısız:', err);
  process.exit(1);
});
