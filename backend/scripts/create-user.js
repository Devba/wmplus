/* Bootstrap de usuarios Fase A (usa lib/users.js). NUNCA pasar passwords
   por aquí: WM_AUTH_LOGIN, WM_AUTH_PASSWORD, WM_AUTH_DISPLAY (opcional),
   WM_AUTH_LEVEL, WM_AUTH_READONLY, WM_AUTH_MGTCO, WM_AUTH_EMAIL.
   Uso: WM_AUTH_LOGIN=... WM_AUTH_PASSWORD=... node scripts/create-user.js
*/
const db = require('../db');
const { createUser } = require('../lib/users');

async function main() {
  const id = await createUser({
    login: process.env.WM_AUTH_LOGIN,
    password: process.env.WM_AUTH_PASSWORD,
    display: process.env.WM_AUTH_DISPLAY,
    email: process.env.WM_AUTH_EMAIL,
    level: process.env.WM_AUTH_LEVEL,
    readOnly: process.env.WM_AUTH_READONLY,
    mgtCompanyId: process.env.WM_AUTH_MGTCO,
  });
  console.log(`usuario '${process.env.WM_AUTH_LOGIN}' creado (id ${id}).`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error('create-user FAILED:', e.message); process.exit(1); });
