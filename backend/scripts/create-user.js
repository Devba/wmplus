/* Bootstrap de usuarios Fase A. NUNCA pasar passwords por aquí:
   WM_AUTH_LOGIN, WM_AUTH_PASSWORD, WM_AUTH_DISPLAY (opcional),
   WM_AUTH_LEVEL (opcional, default 1), WM_AUTH_READONLY (opcional Y/N),
   WM_AUTH_MGTCO / WM_AUTH_LICENSE (opcionales, scope por HOA).
   Uso: WM_AUTH_LOGIN=... WM_AUTH_PASSWORD=... node scripts/create-user.js
*/
const db = require('../db');
const { hashPassword } = require('../middleware/auth');

async function main() {
  const login = String(process.env.WM_AUTH_LOGIN || '').trim();
  const password = String(process.env.WM_AUTH_PASSWORD || '');
  if (!login || password.length < 8) {
    console.error('WM_AUTH_LOGIN requerido y WM_AUTH_PASSWORD >= 8 caracteres.');
    process.exit(2);
  }
  const [dup] = await db.query(`SELECT id FROM app_user WHERE login_name=? LIMIT 1`, [login]);
  if (dup.length) {
    console.error(`LoginName '${login}' ya existe.`);
    process.exit(3);
  }
  const [r] = await db.query(
    `INSERT INTO app_user
       (mgt_company_id, login_name, display_name, email,
        authorization_level, read_only_flag, can_view_escrow_flag, can_view_cc_flag,
        active_flag, operator_id)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      process.env.WM_AUTH_MGTCO ? parseInt(process.env.WM_AUTH_MGTCO, 10) : null,
      login,
      process.env.WM_AUTH_DISPLAY || login,
      process.env.WM_AUTH_EMAIL || null,
      parseInt(process.env.WM_AUTH_LEVEL || '1', 10),
      (process.env.WM_AUTH_READONLY || 'N').toUpperCase() === 'Y' ? 'Y' : 'N',
      'Y', 'Y', 'Y', 'BOOTSTRAP',
    ]
  );
  await db.query(`INSERT INTO user_credential (user_id, password_hash) VALUES (?, ?)`,
    [r.insertId, hashPassword(password)]);
  console.log(`usuario '${login}' creado (UserID ${r.insertId}).`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error('create-user FAILED:', e.message); process.exit(1); });
