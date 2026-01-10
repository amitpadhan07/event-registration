const { Pool } = require('pg');
require('dotenv').config();

// Determine if we need SSL (needed for Render/Cloud, not for local)
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL; // Render often provides this automatically

const poolConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // ⚠️ CRITICAL FIX BELOW
  ssl: isProduction ? {
    rejectUnauthorized: false // Required for Render's self-signed certificates
  } : false
};

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  process.exit(-1);
});

module.exports = pool;