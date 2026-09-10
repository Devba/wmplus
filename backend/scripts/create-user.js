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
  const [dup] = await db.query(`SELECT UserID FROM UserAuthorization WHERE LoginName=? LIMIT 1`, [login]);
  if (dup.length) {
    console.error(`LoginName '${login}' ya existe.`);
    process.exit(3);
  }
  const [r] = await db.query(
    `INSERT INTO UserAuthorization
       (MgtCoClientID, HOALicenseNumber, LoginName, DisplayName, EmailAddress,
        AuthorizationLevel, ReadOnlyFlag, CanViewEscrowFlag, CanViewCreditCardServicesFlag,
        ActiveFlag, OperatorID)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      process.env.WM_AUTH_MGTCO || null,
      process.env.WM_AUTH_LICENSE || null,
      login,
      process.env.WM_AUTH_DISPLAY || login,
      process.env.WM_AUTH_EMAIL || null,
      parseInt(process.env.WM_AUTH_LEVEL || '1', 10),
      (process.env.WM_AUTH_READONLY || 'N').toUpperCase() === 'Y' ? 'Y' : 'N',
      'Y', 'Y', 'Y', 'BOOTSTRAP',
    ]
  );
  await db.query(`INSERT INTO UserCredential (UserID, PasswordHash) VALUES (?, ?)`,
    [r.insertId, hashPassword(password)]);
  console.log(`usuario '${login}' creado (UserID ${r.insertId}).`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error('create-user FAILED:', e.message); process.exit(1); });
