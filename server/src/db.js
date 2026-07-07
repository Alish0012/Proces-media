const { Pool } = require('pg');
const config = require('./config');

// Runtime sorguları kısıtlı yetkili procesmedia_app rolü üzerinden gider (least privilege).
const pool = new Pool({ connectionString: config.appDatabaseUrl });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
