/* ===========================================================
   FASE A (auth): hashing scrypt + sesiones opacas en DB + guards.
   Sin dependencias nuevas (node:crypto + mysql2 existente).
   - Password: scrypt N=16384, formato phc `scrypt$n$r$salt$hash`.
   - Sesión: token aleatorio 32 bytes; en DB solo SHA-256.
     Expiración deslizante por inactividad (SESSION_TTL_MINUTES,
     default 30) — reemplaza el CATimer del VBA.
   - requireAuth / requireReadWrite: listos para proteger rutas
     (Fase A2; Fase A solo instala el gate de login).
   =========================================================== */
const crypto = require('crypto');
const db = require('../db');

const SESSION_TTL_MIN = Math.max(5, parseInt(process.env.SESSION_TTL_MINUTES || '30', 10));
const COOKIE_NAME = 'wm_session';
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(password), salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${salt.toString('hex')}$${hash.toString('hex')}`;
}

function verifyPassword(password, phc) {
  try {
    const parts = String(phc).split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
    const [, n, r, p, saltHex, hashHex] = parts;
    const hash = crypto.scryptSync(String(password), Buffer.from(saltHex, 'hex'), 64,
      { N: parseInt(n, 10), r: parseInt(r, 10), p: parseInt(p, 10) });
    return crypto.timingSafeEqual(hash, Buffer.from(hashHex, 'hex'));
  } catch {
    return false;
  }
}

function newSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

// Parser mínimo de Cookie header (evita dependencia cookie-parser).
function parseCookies(req) {
  const out = {};
  const header = req.headers && req.headers.cookie;
  if (!header) return out;
  header.split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function sessionCookieHeader(token, req) {
  const maxAge = SESSION_TTL_MIN * 60;
  const secure = process.env.COOKIE_SECURE === '1' ||
    (req && req.headers && String(req.headers['x-forwarded-proto']).split(',')[0].trim() === 'https');
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

function clearSessionCookieHeader() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

async function createSession(userId, userAgent) {
  const token = newSessionToken();
  await db.query(
    `INSERT INTO user_session (user_id, token_hash, expires_at, user_agent)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), ?)`,
    [userId, sha256(token), SESSION_TTL_MIN, String(userAgent || '').slice(0, 255)]
  );
  return token;
}

async function revokeSession(token) {
  if (!token) return;
  await db.query(`UPDATE user_session SET revoked_flag='Y' WHERE token_hash=?`, [sha256(token)]);
}

// HOAs asignadas al usuario (scope de sesión; admin global no necesita filas)
async function loadUserHoas(userId) {
  const [rows] = await db.query(
    `SELECT h.id AS hoa_id, h.hoa_code, h.legal_name, h.state_code, a.role
       FROM hoa_assignment a
       JOIN hoa h ON h.id = a.hoa_id
      WHERE a.user_id = ? AND a.active_flag = 'Y' AND h.active_flag = 'Y'
        AND (a.valid_from IS NULL OR a.valid_from <= CURDATE())
        AND (a.valid_to IS NULL OR a.valid_to >= CURDATE())
      ORDER BY h.hoa_code`,
    [userId]
  );
  return rows;
}

// Devuelve fila de app_user (+ hoas, + is_admin) o null. Desliza expiración.
async function getSessionUser(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const [rows] = await db.query(
    `SELECT u.id AS user_id, u.mgt_company_id, u.login_name, u.display_name,
            u.email, u.authorization_level, u.read_only_flag,
            u.can_view_escrow_flag, u.can_view_cc_flag, u.active_flag
       FROM user_session s
       JOIN app_user u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.revoked_flag = 'N'
        AND s.expires_at > NOW() AND u.active_flag = 'Y'
      LIMIT 1`,
    [sha256(token)]
  );
  if (!rows.length) return null;
  // sliding expiration (best-effort, no bloquea)
  db.query(
    `UPDATE user_session SET last_seen_at = NOW(),
       expires_at = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE token_hash = ?`,
    [SESSION_TTL_MIN, sha256(token)]
  ).catch(() => {});
  const user = rows[0];
  user.is_admin = (user.authorization_level || 0) >= 9;
  user.hoas = user.is_admin ? [] : await loadUserHoas(user.user_id);
  return user;
}

function isReadOnly(user) {
  return !user || String(user.read_only_flag).toUpperCase() === 'Y';
}

// 401 si no hay sesión válida. Adjunta req.authUser.
async function requireAuth(req, res, next) {
  try {
    const user = await getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Sesión requerida' });
    req.authUser = user;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 403 si el usuario es solo-lectura (análogo a I1=1 del VBA).
function requireReadWrite(req, res, next) {
  if (isReadOnly(req.authUser)) {
    return res.status(403).json({ error: 'Usuario de solo lectura' });
  }
  next();
}

function publicUser(user) {
  if (!user) return null;
  const { ...rest } = user;
  return rest; // UserAuthorization no guarda secretos; credenciales viven en UserCredential
}

module.exports = {
  COOKIE_NAME,
  SESSION_TTL_MIN,
  MAX_FAILED,
  LOCK_MINUTES,
  hashPassword,
  verifyPassword,
  parseCookies,
  sessionCookieHeader,
  clearSessionCookieHeader,
  createSession,
  revokeSession,
  getSessionUser,
  isReadOnly,
  requireAuth,
  requireReadWrite,
  loadUserHoas,
  publicUser,
};
