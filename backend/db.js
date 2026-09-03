const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'www.1mag1na.xyz',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'Ricktest',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || '12345',
  database: process.env.DB_NAME || 'hoamanager26',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

// Configure readOnlyPool using dedicated credentials if available, otherwise fallback to pool
const readOnlyPool = process.env.DB_READ_USER ? mysql.createPool({
  host: process.env.DB_HOST || 'www.1mag1na.xyz',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_READ_USER,
  password: process.env.DB_READ_PASSWORD || process.env.DB_READ_PASS,
  database: process.env.DB_NAME || 'hoamanager26',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
}) : pool;

pool.readOnlyPool = readOnlyPool;

// SKELETON: Transaction helper for APR / Cash Flow atomic posting (V3 §2f, §12)
// Uso: await db.withTransaction(async (conn) => { await conn.query(...); });
// Principio: tablas persistidas, mantenidas incrementalnente. Posting APR actualiza
// SOLO el residente afectado (AssessmentRegister + Period + Cash Flow).
// Recalculate/Rebuild = utilidad de excepción (reconciliación/reparación), no flujo normal.
pool.withTransaction = async (callback) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    try { await conn.rollback(); } catch (_) {}
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = pool;
