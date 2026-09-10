/* ===========================================================
   FASE A (auth): aplica db/schema/001_core_identity.sql
   (fuente única de verdad del esquema hoam26_auth).
   Uso: node migrate-auth-tables.js   (idempotente)
   Conexión: DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME (default hoam26_auth)
   =========================================================== */
const fs = require('fs');
const path = require('path');
const db = require('./db');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema', '001_core_identity.sql'), 'utf8');
  // Parte por ';' al final de línea (el DDL no contiene ';' internos salvo comentarios)
  const statements = sql
    .split(/\n/)
    .reduce((acc, line) => {
      const t = line.trim();
      if (t.startsWith('--') || t === '') return acc;
      acc.cur += line + '\n';
      if (t.endsWith(';')) { acc.out.push(acc.cur); acc.cur = ''; }
      return acc;
    }, { cur: '', out: [] }).out;
  for (const st of statements) {
    await db.query(st);
  }
  console.log(`auth schema OK: ${statements.length} statements aplicados`);
}

migrate()
  .then(() => (db.end ? db.end() : null))
  .then(() => process.exit(0))
  .catch((err) => { console.error('migrate-auth-tables FAILED:', err.message); process.exit(1); });
