const { Pool } = require('pg');
const dns = require('dns'); // Import DNS module
require('dotenv').config();

// 👇 GLOBAL FIX: Force Node.js to prefer IPv4 for all connections
// This works even if the Postgres library ignores the 'family' setting
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const dbHost = process.env.DB_HOST || '';
const isRenderDB = dbHost.includes('render.com');
const isSupabaseDB = dbHost.includes('supabase.co');
const isProduction = process.env.NODE_ENV === 'production';

console.log(`🔌 Database Config: Host=${dbHost}, SSL=${isSupabaseDB}, DNS_Priority=IPv4First`);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  
  // Keep this as a backup
  family: 4, 
  
  ssl: (isProduction || isRenderDB || isSupabaseDB) ? {
    rejectUnauthorized: false
  } : false,
  
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  // console.log('Connected to Database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  process.exit(-1);
});

module.exports = pool;