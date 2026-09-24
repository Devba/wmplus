/* Stress de corrección auth (solo lectura operacional): login storm, carrera de
   binds 409, lecturas cross-HOA, mutación con contexto rancio. Sin writes.
   Uso: node stress-auth.js (backend 3013 arriba). Limpia sus sesiones al final. */
const BASE = 'http://127.0.0.1:3013/api';
const results = [];
function rec(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log((ok ? 'PASS' : 'FAIL') + ' | ' + name + (detail ? ' | ' + detail : ''));
}
async function api(method, path, { jar, headers = {}, body } = {}) {
  const h = { ...headers };
  if (jar) h.Cookie = jar.cookie;
  if (body !== undefined) h['Content-Type'] = 'application/json';
  const r = await fetch(BASE + path, {
    method, headers: h, body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const setC = r.headers.get('set-cookie') || '';
  const m = setC.match(/wm_session=([0-9a-f]{64})/);
  if (m && jar) jar.cookie = `wm_session=${m[1]}`;
  let data = null;
  try { data = await r.json(); } catch { /* no-json */ }
  return { status: r.status, data };
}
async function login(loginName, password) {
  const jar = {};
  const r = await api('POST', '/auth/login', { jar, body: { loginName, password } });
  return { jar, ok: r.status === 200 };
}

(async () => {
  // 1. Login storm: 15 simultáneos
  const creds = ['user_rick', 'user_debbie', 'user_hoa4_mgr', 'user_hoa4_viewer', 'user_marsha'];
  const logins = await Promise.all(
    Array.from({ length: 15 }, (_, i) => login(creds[i % creds.length], 'cambiar123')));
  rec('1. login storm 15x', logins.every((l) => l.ok),
    `${logins.filter((l) => l.ok).length}/15 OK`);

  // 2. Carrera de binds: 10 sesiones de debbie -> HOA 7
  const debbies = [];
  for (let i = 0; i < 10; i++) debbies.push(await login('user_debbie', 'cambiar123'));
  const binds = await Promise.all(
    debbies.map((d) => api('POST', '/auth/active-hoa', { jar: d.jar, body: { hoa_id: 7 } })));
  const ok200 = binds.filter((b) => b.status === 200).length;
  const c409 = binds.filter((b) => b.status === 409).length;
  rec('2. bind race 1x200+9x409', ok200 === 1 && c409 === 9, `${ok200}x200 ${c409}x409`);

  // 3. Lecturas cross-HOA con debbie (RL+DEV): propia 200, ajena 403, cero 500
  const dj = (await login('user_debbie', 'cambiar123')).jar;
  const reads = await Promise.all([
    api('GET', '/apr/register/009991', { jar: dj, headers: { 'X-HOA-ID': '1' } }),
    api('GET', '/apr/register/009991', { jar: dj, headers: { 'X-HOA-ID': '7' } }),
    api('GET', '/apr/register/009991', { jar: dj, headers: { 'X-HOA-ID': '2' } }),
    api('GET', '/apr/register/009991', { jar: dj, headers: { 'X-HOA-ID': '4' } }),
  ]);
  const st = reads.map((r) => r.status).join(',');
  const no500 = reads.every((r) => r.status !== 500);
  rec('3. lecturas cross-HOA', st === '200,200,403,403' && no500, `status=[${st}]`);

  // 4. Mutación con contexto rancio -> 403 y sin writes
  const bad = await Promise.all([
    api('PUT', '/settings/hoa-profile', { jar: dj, headers: { 'X-HOA-ID': '4' }, body: { hoaProfile: { hoaNotes: 'STRESS-DIRTY' } } }),
    api('PUT', '/settings/hoa-profile', { jar: dj, headers: { 'X-HOA-ID': '2' }, body: { hoaProfile: { hoaNotes: 'STRESS-DIRTY' } } }),
  ]);
  rec('4. mutación rancia 403', bad.every((b) => b.status === 403),
    `status=[${bad.map((b) => b.status).join(',')}]`);

  // 5. Limpieza: logout de todas las sesiones de prueba
  const all = [...logins.map((l) => l), ...debbies.map((d) => d), { jar: dj }];
  await Promise.all(all.map((s) => api('POST', '/auth/logout', { jar: s.jar }).catch(() => null)));
  rec('5. logouts emitidos', true, `${all.length} sesiones`);

  const fails = results.filter((r) => !r.ok).length;
  console.log(`\nTOTAL: ${results.length - fails}/${results.length} PASS`);
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('STRESS-ERROR:', e.message); process.exit(2); });
