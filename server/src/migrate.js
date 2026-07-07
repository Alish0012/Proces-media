const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Şema değişiklikleri (CREATE TABLE vb.) yetki gerektirdiği için admin
// bağlantısını (DATABASE_URL) kullanır — kısıtlı procesmedia_app rolünü değil.
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL .env dosyasında tanımlı olmalı (migration için admin bağlantısı).');
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log(`Running migration ${file}...`);
    await pool.query(sql);
  }

  console.log('Migrations complete.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
