const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'www.1mag1na.xyz',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'Ricktest',
  password: process.env.DB_PASSWORD || '12345',
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
  password: process.env.DB_READ_PASSWORD,
  database: process.env.DB_NAME || 'hoamanager26',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
}) : pool;

pool.readOnlyPool = readOnlyPool;
module.exports = pool;
