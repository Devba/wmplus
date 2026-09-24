/* T2: pool exhaustion — 30 lecturas pesadas simultáneas (pool=10).
   Mide latencias p50/p95, cuenta 500s/timeouts. Solo lectura. */
const BASE = 'http://127.0.0.1:3013/api';
async function api(method, path, { jar, headers = {} } = {}) {
  const h = { ...headers };
  if (jar) h.Cookie = jar.cookie;
  const t0 = Date.now();
  try {
    const r = await fetch(BASE + path, { method, headers: h });
    await r.text();
    return { status: r.status, ms: Date.now() - t0 };
  } catch (e) {
    return { status: 'ERR', ms: Date.now() - t0, err: e.message };
  }
}
(async () => {
  const jar = {};
  const login = await fetch(BASE + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginName: 'user_debbie', password: 'cambiar123' }),
  });
  const setC = login.headers.get('set-cookie') || '';
  jar.cookie = `wm_session=${setC.match(/wm_session=([0-9a-f]{64})/)[1]}`;
  const paths = [
    ['GET', '/apr/register/009991', { 'X-HOA-ID': '7' }],
    ['GET', '/settings/banking', { 'X-HOA-ID': '7' }],
    ['GET', '/reports/escrow-summary', { 'X-HOA-ID': '7' }],
  ];
  const jobs = Array.from({ length: 30 }, (_, i) => {
    const [m, p, h] = paths[i % paths.length];
    return api(m, p, { jar, headers: h });
  });
  const res = await Promise.all(jobs);
  const ms = res.map((r) => r.ms).sort((a, b) => a - b);
  const p50 = ms[Math.floor(ms.length * 0.5)];
  const p95 = ms[Math.floor(ms.length * 0.95)];
  const byStatus = {};
  res.forEach((r) => { byStatus[r.status] = (byStatus[r.status] || 0) + 1; });
  console.log(`n=30 min=${ms[0]}ms p50=${p50}ms p95=${p95}ms max=${ms[ms.length - 1]}ms`);
  console.log('status:', JSON.stringify(byStatus));
  const errs = res.filter((r) => r.status === 500 || r.status === 'ERR');
  console.log(errs.length === 0 ? 'T2 PASS: 0 errores' : `T2 FAIL: ${errs.length} errores`);
  await fetch(BASE + '/auth/logout', { method: 'POST', headers: { Cookie: jar.cookie } }).catch(() => null);
  process.exit(errs.length ? 1 : 0);
})().catch((e) => { console.error('T2-ERROR:', e.message); process.exit(2); });
