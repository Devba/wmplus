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

module.exports = pool;
