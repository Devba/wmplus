/* FASE A2: operaciones de usuarios compartidas por rutas admin y scripts.
   Política de clave temporal: se genera aleatoria (12 chars), se devuelve
   UNA vez al admin; el hash scrypt es lo único que se persiste. */
const crypto = require('crypto');
// FASE B-demo: identidad vive en authDb (AUTH_DB_*; default = pool de negocio).
const db = require('../db').authDb;
const { hashPassword } = require('../middleware/auth');

function tempPassword() {
  return crypto.randomBytes(9).toString('base64url');
}

async function createUser({ login, password, display, email, level, readOnly, mgtCompanyId }) {
  const loginName = String(login || '').trim();
  if (!loginName) throw new Error('login requerido');
  if (!password || String(password).length < 8) throw new Error('password >= 8 caracteres');
  const [dup] = await db.query(`SELECT id FROM app_user WHERE login_name=? LIMIT 1`, [loginName]);
  if (dup.length) throw new Error(`LoginName '${loginName}' ya existe`);
  const [r] = await db.query(
    `INSERT INTO app_user
       (mgt_company_id, login_name, display_name, email,
        authorization_level, read_only_flag, can_view_escrow_flag, can_view_cc_flag,
        active_flag)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [mgtCompanyId || null, loginName, display || loginName, email || null,
     parseInt(level || '1', 10), readOnly === 'Y' ? 'Y' : 'N',
     'Y', 'Y', 'Y']
  );
  await db.query(`INSERT INTO user_credential (user_id, password_hash) VALUES (?, ?)`,
    [r.insertId, hashPassword(password)]);
  return r.insertId;
}

async function setPassword(userId, password) {
  if (!password || String(password).length < 8) throw new Error('password >= 8 caracteres');
  const [r] = await db.query(
    `UPDATE user_credential SET password_hash=?, failed_attempts=0, locked_until=NULL
      WHERE user_id=?`,
    [hashPassword(password), userId]
  );
  if (!r.affectedRows) throw new Error('usuario sin credencial');
  await db.query(`DELETE FROM user_session WHERE user_id=?`, [userId]); // invalida sesiones
}

module.exports = { tempPassword, createUser, setPassword };
