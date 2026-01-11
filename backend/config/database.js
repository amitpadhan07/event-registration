const { Pool } = require('pg');
require('dotenv').config();

const dbHost = process.env.DB_HOST || '';
const isRenderDB = dbHost.includes('render.com');
const isSupabaseDB = dbHost.includes('supabase.co');
const isProduction = process.env.NODE_ENV === 'production';

// 👇 Debug log to prove new code is running
console.log(`🔌 Database Config: Host=${dbHost}, SSL=${isSupabaseDB}, IPv4_Forced=TRUE`);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  
  // 👇 This forces Node.js to ignore the IPv6 address
  family: 4, 
  
  ssl: (isProduction || isRenderDB || isSupabaseDB) ? {
    rejectUnauthorized: false
  } : false,
  
  // Add timeout settings to prevent hanging
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('✅ Connected to Database (IPv4)');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  process.exit(-1);
});

module.exports = pool;