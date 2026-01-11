const { Pool } = require('pg');
require('dotenv').config();

const dbHost = process.env.DB_HOST || '';
const isRenderDB = dbHost.includes('render.com');
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // SSL zaroori hai jab hum Render DB se connect karte hain
  ssl: (isProduction || isRenderDB) ? {
    rejectUnauthorized: false
  } : false
});

pool.on('connect', () => {
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  process.exit(-1);
});

module.exports = pool;