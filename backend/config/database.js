const { Pool } = require('pg');
require('dotenv').config();

const dbHost = process.env.DB_HOST || '';
const isRenderDB = dbHost.includes('render.com');
const isSupabaseDB = dbHost.includes('supabase.co'); // Detect Supabase
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // SSL is required for Render and Supabase
  ssl: (isProduction || isRenderDB || isSupabaseDB) ? {
    rejectUnauthorized: false
  } : false
});

pool.on('connect', () => {
  // Optional: Log connection success for debugging
  // console.log('Connected to Database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  process.exit(-1);
});

module.exports = pool;