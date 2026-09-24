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
// FASE B-demo: identidad vive en authDb (AUTH_DB_*; default = pool de negocio).
const db = require('../db').authDb;

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

async function createSession(userId, userAgent, hoaId = null) {
  const token = newSessionToken();
  await db.query(
    `INSERT INTO user_session (user_id, hoa_id, token_hash, expires_at, user_agent)
     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), ?)`,
    [userId, hoaId || null, sha256(token), SESSION_TTL_MIN, String(userAgent || '').slice(0, 255)]
  );
  return token;
}

// V4 §10: liga la sesión actual a una HOA activa.
// - Verifica asignación vigente (fuera de alcance -> 403).
// - Otra sesión ACTIVA del mismo (user, HOA) -> 409 (denegar, la HOA ya está abierta).
// - force=true -> revoca las otras (takeover explícito) y liga.
// - Historial de revocadas/expiradas se conserva (sin UNIQUE literal).
async function bindActiveHoa(user, token, hoaId, force = false) {
  const id = parseInt(hoaId, 10);
  if (!id) throw Object.assign(new Error('hoa_id requerido'), { status: 400 });
  const access = user.is_admin ? { level: 9, readOnly: false, role: 'admin' }
    : await effectiveAccess(user, id);
  if (!access) throw Object.assign(new Error('HOA fuera de tu alcance'), { status: 403 });
  // Serializa binds del mismo usuario (lock de su fila): el check de
  // duplicados + revoke + bind son atómicos; sin esto, N binds paralelos
  // se ven entre sí como "sin duplicado" y ganan varios (hallado en stress).
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`SELECT id FROM app_user WHERE id = ? FOR UPDATE`, [user.user_id]);
    const [dups] = await conn.query(
      `SELECT id FROM user_session
        WHERE user_id = ? AND hoa_id = ? AND revoked_flag = 'N'
          AND expires_at > NOW() AND token_hash != ?
        LIMIT 1`,
      [user.user_id, id, sha256(token)]
    );
    if (dups.length && !force) {
      throw Object.assign(
        new Error('Esa HOA ya está abierta en otra sesión de este usuario'), { status: 409 });
    }
    if (dups.length && force) {
      await conn.query(
        `UPDATE user_session SET revoked_flag = 'Y'
          WHERE user_id = ? AND hoa_id = ? AND revoked_flag = 'N' AND token_hash != ?`,
        [user.user_id, id, sha256(token)]
      );
    }
    await conn.query(`UPDATE user_session SET hoa_id = ? WHERE token_hash = ?`, [id, sha256(token)]);
    await conn.commit();
    return { hoa_id: id, tookOver: dups.length > 0 && !!force };
  } catch (err) {
    try { await conn.rollback(); } catch (_) {}
    throw err;
  } finally {
    conn.release();
  }
}

async function revokeSession(token) {
  if (!token) return;
  await db.query(`UPDATE user_session SET revoked_flag='Y' WHERE token_hash=?`, [sha256(token)]);
}

// HOAs asignadas al usuario (scope de sesión; admin global no necesita filas)
// V4 §5: incluye nivel operativo y readonly POR ASIGNACIÓN (role = descriptivo).
async function loadUserHoas(userId) {
  const [rows] = await db.query(
    `SELECT h.id AS hoa_id, h.hoa_code, h.legal_name, h.state_code, a.role,
            a.authorization_level AS level, a.read_only_flag AS assignment_read_only
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

// V4 §5: acceso efectivo de un usuario en una HOA concreta.
// Admin global -> nivel global (bypass operativo va por requireAdmin / 'all').
// Retorna null si el usuario no tiene asignación vigente (fuera de alcance).
async function effectiveAccess(user, hoaId) {
  const id = parseInt(hoaId, 10);
  if (!id) return null;
  const [rows] = await db.query(
    `SELECT a.role, a.authorization_level, a.read_only_flag
       FROM hoa_assignment a JOIN hoa h ON h.id = a.hoa_id
      WHERE a.user_id = ? AND a.hoa_id = ?
        AND a.active_flag = 'Y' AND h.active_flag = 'Y'
        AND (a.valid_from IS NULL OR a.valid_from <= CURDATE())
        AND (a.valid_to IS NULL OR a.valid_to >= CURDATE())
      LIMIT 1`,
    [user.user_id, id]
  );
  if (!rows.length) return null;
  const a = rows[0];
  return {
    level: a.authorization_level || 0,
    readOnly: String(a.read_only_flag).toUpperCase() === 'Y',
    role: a.role
  };
}

// Devuelve fila de app_user (+ hoas, + is_admin) o null. Desliza expiración.
async function getSessionUser(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const [rows] = await db.query(
    `SELECT u.id AS user_id, u.mgt_company_id, u.login_name, u.display_name,
            u.email, u.authorization_level, u.read_only_flag,
            u.can_view_escrow_flag, u.can_view_cc_flag, u.active_flag,
            s.hoa_id AS active_hoa_id
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

// PILOTO-bloqueantes (provisional hasta lista Rick): operaciones de servidor
// en curso por usuario. Map en memoria (se pierde al reiniciar; vale p/ prueba).
// Producción: sustituir por la clasificación de Rick + persistencia si se pide.
const blockingOps = new Map(); // userId -> Set(op)
function markBlocking(userId, op) {
  if (!userId || !op) return;
  let s = blockingOps.get(userId);
  if (!s) { s = new Set(); blockingOps.set(userId, s); }
  s.add(op);
}
function clearBlocking(userId, op) {
  const s = blockingOps.get(userId);
  if (!s) return;
  if (op) s.delete(op); else s.clear();
  if (!s.size) blockingOps.delete(userId);
}
function getBlocking(userId) {
  return [...(blockingOps.get(userId) || [])];
}

// Middleware PILOTO: marca op en curso y la libera al terminar la respuesta.
function trackBlocking(op) {
  return (req, res, next) => {
    const uid = req.authUser && req.authUser.user_id;
    if (uid) {
      markBlocking(uid, op);
      res.on('finish', () => clearBlocking(uid, op));
    }
    next();
  };
}

function isReadOnly(user) {
  return !user || String(user.read_only_flag).toUpperCase() === 'Y';
}

// Piloto filtro por HOA (tablas legacy con HOALicenseNumber).
// - Admin con X-HOA-ID=all -> sin filtro (ver todo).
// - Admin con HOA concreta -> filtra igual que un manager (operar en contexto).
// - Manager -> filtra por su HOA (requireHoaScope ya validó pertenencia).
// Requiere requireHoaScope previo (req.hoa / req.hoaId).
function hoaFilter(req, alias) {
  if (!req.authUser) throw new Error('requireAuth previo requerido');
  if (req.hoaId === 'all') {
    if (!req.authUser.is_admin) throw new Error('Vista global solo para administrador');
    return { clause: '', params: [] };
  }
  if (!req.hoa || !req.hoa.license_number) {
    throw new Error('requireHoaScope previo requerido');
  }
  const col = alias ? `${alias}.HOALicenseNumber` : 'HOALicenseNumber';
  return { clause: `AND ${col} = ?`, params: [req.hoa.license_number] };
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

// 403 si el usuario es solo-lectura.
// V4 §5: con contexto HOA rige el readonly DE LA ASIGNACIÓN (req.access,
// fijado por requireHoaScope, o resuelto aquí vía X-HOA-ID); sin contexto,
// rige el flag global (comportamiento anterior).
async function requireReadWrite(req, res, next) {
  try {
    const user = req.authUser;
    if (!user) return res.status(401).json({ error: 'Sesión requerida' });
    if (user.is_admin) {
      if (isReadOnly(user)) return res.status(403).json({ error: 'Usuario de solo lectura' });
      return next();
    }
    let access = req.access || null;
    if (!access) {
      // Endpoints de gestión de sesión: no dependen de X-HOA-ID (un contexto
      // rancio no debe impedir ligar la HOA correcta ni consultar bloqueos).
      const sessionLevel = req.path === '/auth/active-hoa' ||
        req.path.indexOf('/auth/blocking-') === 0;
      if (!sessionLevel) {
        const raw = (req.headers['x-hoa-id'] || req.query.hoa_id || '').toString().trim();
        const id = parseInt(raw, 10);
        if (id) {
          access = await effectiveAccess(user, id);
          if (!access) return res.status(403).json({ error: 'HOA fuera de tu alcance' });
        }
      }
    }
    if (access) {
      if (access.readOnly) return res.status(403).json({ error: 'Solo lectura en esta HOA' });
      return next();
    }
    if (isReadOnly(user)) {
      return res.status(403).json({ error: 'Usuario de solo lectura' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 403 si no es admin global (authorization_level >= 9).
function requireAdmin(req, res, next) {
  if (!req.authUser || !req.authUser.is_admin) {
    return res.status(403).json({ error: 'Requiere administrador' });
  }
  next();
}

// FASE A2: valida la HOA activa (header X-HOA-ID o ?hoa_id) contra las
// asignaciones de la sesión. Admin bypass. Adjunta req.hoaId + req.hoa.
// Valor especial 'all': solo admin (ver todo); resto -> 403.
// 400 si falta, 403 si es ajena o inactiva.
async function requireHoaScope(req, res, next) {
  try {
    const raw = (req.headers['x-hoa-id'] || req.query.hoa_id || '').toString().trim();
    if (raw.toLowerCase() === 'all') {
      if (!req.authUser.is_admin) {
        return res.status(403).json({ error: 'Vista global solo para administrador' });
      }
      req.hoaId = 'all';
      req.hoa = null;
      return next();
    }
    const hoaId = parseInt(raw, 10);
    if (!hoaId) return res.status(400).json({ error: 'HOA activa requerida (X-HOA-ID)' });
    const [rows] = await db.query(
      `SELECT h.id, h.hoa_code, h.legal_name, h.state_code, h.city,
              h.license_number, h.mgt_company_id, mc.code AS mgt_code
         FROM hoa h LEFT JOIN mgt_company mc ON mc.id = h.mgt_company_id
        WHERE h.id = ? AND h.active_flag = 'Y' LIMIT 1`,
      [hoaId]
    );
    if (!rows.length) return res.status(403).json({ error: 'HOA inexistente o inactiva' });
    if (!req.authUser.is_admin) {
      const ok = (req.authUser.hoas || []).some(
        (h) => h.hoa_id === hoaId && String(h.role || '').length > 0);
      if (!ok) return res.status(403).json({ error: 'HOA fuera de tu alcance' });
    }
    req.hoaId = hoaId;
    req.hoa = rows[0];
    // V4 §5: acceso efectivo de ESTA HOA para guards posteriores.
    if (!req.authUser.is_admin) {
      req.access = await effectiveAccess(req.authUser, hoaId);
    }
    // V4 §9: la sesión ligada a una HOA no opera en otra.
    // Sesiones sin ligar (NULL, p.ej. pre-selección) no restringen.
    if (!req.authUser.is_admin && req.authUser.active_hoa_id != null &&
        Number(req.authUser.active_hoa_id) !== Number(hoaId)) {
      return res.status(403).json({
        error: 'Sesión ligada a otra HOA; cambia la HOA activa para operar aquí'
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
  effectiveAccess,
  bindActiveHoa,
  markBlocking,
  clearBlocking,
  getBlocking,
  trackBlocking,
  requireAuth,
  requireReadWrite,
  requireAdmin,
  requireHoaScope,
  hoaFilter,
  loadUserHoas,
  publicUser,
};
