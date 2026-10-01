import { useState, useEffect } from 'react';
import { API_BASE_URL, apiFetch } from '../../config/api';
import CASES from './goldenCases';
import './GoldenSet.css';

/* Golden Set runner: pick a case (or all) and run it against /api/ai-filter
   with the case's own X-HOA-ID. Structural assertions only (function, source,
   status, summary shape) — no magic numbers. A 403 on a 200-expected case is
   reported as SKIPPED (HOA out of this user's scope), not failed. */

async function runCase(c, prompt) {
  const res = await fetch(`${API_BASE_URL}/ai-filter`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-HOA-ID': c.hoaId },
    body: JSON.stringify({ prompt: prompt ?? c.question })
  });
  const data = await res.json().catch(() => ({}));
  return { http: res.status, data };
}

function checkResult(c, http, data, edited) {
  const exp = c.expect;
  if (http === 403 && exp.status === 403) {
    return { verdict: 'pass', note: '403 blocked as designed' };
  }
  if (http === 403 && exp.status !== 403) {
    return { verdict: 'skipped', note: 'HOA out of scope for this user' };
  }
  if (http !== exp.status) {
    return { verdict: 'fail', note: `expected HTTP ${exp.status}, got ${http}: ${data.error || ''}` };
  }
  if (exp.status !== 200) {
    return { verdict: 'pass', note: `HTTP ${http} as designed (${data.source || '?'})` };
  }
  const problems = [];
  if (exp.fn && data.function !== exp.fn) {
    problems.push(`function: expected ${exp.fn}, got ${data.function || '?'}`);
  }
  // Texto editado: un rewording puede rutear via router-openrouter en vez de
  // router-local; se acepta cualquier router-* y se exige el resto.
  const srcOk = edited
    ? /^router-/.test(data.source || '')
    : data.source === exp.source;
  if (exp.source && !srcOk) {
    problems.push(`source: expected ${edited ? 'router-*' : exp.source}, got ${data.source || '?'}`);
  }
  const missing = (exp.summaryKeys || []).filter((k) => !(data.summary && k in data.summary));
  if (missing.length) {
    problems.push(`summary missing keys: ${missing.join(', ')}`);
  }
  if (problems.length) return { verdict: 'fail', note: problems.join(' · ') };
  return {
    verdict: 'pass',
    note: `${data.function} via ${data.source} · ${data.answer || ''}`.slice(0, 160)
  };
}

export default function GoldenSet() {
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);
  const [usage, setUsage] = useState(null);
  const [texts, setTexts] = useState({});

  const textOf = (c) => (texts[c.id] !== undefined ? texts[c.id] : c.question);
  const isEdited = (c) => texts[c.id] !== undefined && texts[c.id] !== c.question;

  useEffect(() => {
    apiFetch('/ai-usage').then(
      (d) => {
        if (d && d.configured && d.usage != null) {
          const win = d.window && d.window !== 'total' ? ` (${d.window})` : '';
          setUsage(d.limit != null
            ? `OpenRouter${win}: $${Number(d.usage).toFixed(3)} / $${Number(d.limit).toFixed(2)} (${d.pct != null ? Math.round(d.pct) : '?'}%)`
            : `OpenRouter${win}: $${Number(d.usage).toFixed(3)} used`);
        }
      },
      () => {}
    );
  }, []);

  const execOne = async (c) => {
    const prompt = textOf(c);
    const edited = isEdited(c);
    setResults((r) => ({ ...r, [c.id]: { verdict: 'running' } }));
    try {
      const { http, data } = await runCase(c, prompt);
      const chk = checkResult(c, http, data, edited);
      const tenant = data && data.tenant ? data.tenant.license_number : null;
      setResults((r) => ({ ...r, [c.id]: { ...chk, http, tenant } }));
    } catch (e) {
      setResults((r) => ({ ...r, [c.id]: { verdict: 'fail', note: `request error: ${e.message}` } }));
    }
  };

  const runAll = async () => {
    if (running) return;
    setRunning(true);
    try {
      for (const c of CASES) {
        // eslint-disable-next-line no-await-in-loop
        await execOne(c);
      }
    } finally {
      setRunning(false);
    }
  };

  const counts = { pass: 0, fail: 0, skipped: 0, running: 0, pending: 0 };
  for (const c of CASES) {
    const v = (results[c.id] || {}).verdict || 'pending';
    counts[v] = (counts[v] || 0) + 1;
  }

  return (
    <div className="gs-page">
      <div className="gs-header">
        <h2>Golden Set — AI router checks</h2>
        <button type="button" onClick={runAll} disabled={running}>
          {running ? 'Running…' : `Run all (${CASES.length})`}
        </button>
      </div>
      <p className="gs-sub">
        Structural assertions only (function, source, status, summary shape — no exact numbers).
        Each case runs under its own HOA. 403 on a 200-case = skipped, not failed.
        Pass: {counts.pass} · Fail: {counts.fail} · Skipped: {counts.skipped}
        {usage && <> · {usage}</>}
      </p>
      <div className="gs-list">
        {CASES.map((c) => {
          const r = results[c.id] || {};
          const edited = isEdited(c);
          return (
            <div key={c.id} className={`gs-item gs-${r.verdict || 'pending'}`}>
              <div className="gs-row">
                <span className="gs-id">{c.id}</span>
                <span className="gs-section">{c.section}</span>
                <span className="gs-hoa">{c.hoaLabel}</span>
                {r.tenant && <span className="gs-hoa" title="Tenant real devuelto">→ {r.tenant}</span>}
                {edited && <span className="gs-edited" title="Texto modificado">edited</span>}
                <span className={`gs-badge gs-badge-${r.verdict || 'pending'}`}>
                  {(r.verdict || 'pending').toUpperCase()}
                </span>
                <button type="button" onClick={() => execOne(c)} disabled={running || r.verdict === 'running'}>
                  Run
                </button>
              </div>
              <div className="gs-q">
                <span>❯ </span>
                <input
                  type="text"
                  className="gs-qinput"
                  value={textOf(c)}
                  onChange={(e) => setTexts((t) => ({ ...t, [c.id]: e.target.value }))}
                  disabled={running}
                />
                {edited && (
                  <button
                    type="button"
                    className="gs-reset"
                    title="Restaurar pregunta original"
                    onClick={() => setTexts((t) => { const n = { ...t }; delete n[c.id]; return n; })}
                  >
                    reset
                  </button>
                )}
              </div>
              {r.note && <div className="gs-note">{r.note}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
