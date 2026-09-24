/* T1: carrera de issuance — 10 POST check-register idénticos simultáneos.
   Esperado: sin duplicados (PK); observar 201 vs 500 en perdedores. Limpia sus filas. */
const BASE = 'http://127.0.0.1:3013/api';
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
  try { data = await r.json(); } catch { /* noop */ }
  return { status: r.status, data };
}
(async () => {
  const jar = {};
  const login = await api('POST', '/auth/login', { jar, body: { loginName: 'user_debbie', password: 'cambiar123' } });
  if (login.status !== 200) throw new Error('login falló');
  const payload = {
    bank_account_id: 1, amount: 1.00, check_number: 'ST9000',
    gl_number: 5000, payee_id: 'STRESS-RES', note: 'STRESS-T1',
  };
  const res = await Promise.all(Array.from({ length: 10 }, () =>
    api('POST', '/check-register', { jar, headers: { 'X-HOA-ID': '7' }, body: payload })));
  const ok = res.filter((r) => r.status === 201);
  const fail = res.filter((r) => r.status !== 201);
  const nums = ok.map((r) => r.data && r.data.check_txn_num);
  console.log(`201: ${ok.length}, no-201: ${fail.length} [${fail.map((r) => r.status).join(',')}]`);
  console.log(`txn únicos: ${new Set(nums).size}/${nums.length}`);
  fail.slice(0, 2).forEach((r) => console.log('fail sample:', JSON.stringify(r.data).slice(0, 160)));
  await api('POST', '/auth/logout', { jar }).catch(() => null);
  console.log('TXNS:' + nums.join(','));
})().catch((e) => { console.error('T1-ERROR:', e.message); process.exit(2); });
