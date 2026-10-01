import { useEffect, useState } from 'react';
import { API_BASE_URL, apiFetch } from '../../../../config/api.js';
import { closeOverlay } from '../../../../engines';
import './AskPanel.css';

/* UF Ask (esqueleto service-layer): pregunta -> registry -> evidencia.
   Modo Explorar (solo is_admin): filas anonimizadas al LLM, nombres
   resueltos localmente via lexicon. Historial solo en memoria.
   Nombre del boton intacto (AI QUERY) hasta visto bueno de Rick. */

function postAiFilter(prompt) {
  const activeHoa = typeof localStorage !== 'undefined'
    ? localStorage.getItem('wm_active_hoa') : null;
  return fetch(`${API_BASE_URL}/ai-filter`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(activeHoa ? { 'X-HOA-ID': activeHoa } : {})
    },
    body: JSON.stringify({ prompt })
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      const err = new Error(data.error || `HTTP ${res.status}`);
      err.payload = data;
      throw err;
    }
    return data;
  });
}

function lineageText(d) {
  const lin = Array.isArray(d.lineage) ? d.lineage : [];
  const tables = lin.map((l) => l.table).filter(Boolean).join(', ') || '—';
  const f = d.filters_applied || d.filters || {};
  const bits = [];
  if (f.as_of) bits.push(`as_of ${f.as_of}`);
  if (f.license_number) bits.push(`HOA ${f.license_number}`);
  if (d.tenant && d.tenant.license_number) bits.push(`tenant ${d.tenant.license_number}`);
  return `Sources: ${tables} · ${bits.join(' · ') || 'no filters'} · via ${d.source || '?'}`;
}

function EvidenceTable({ data }) {
  const rows = Array.isArray(data.result)
    ? data.result
    : (data.result && Array.isArray(data.result.payments) ? data.result.payments : null);
  if (!rows || rows.length === 0) return null;
  const cols = Object.keys(rows[0]).slice(0, 6);
  return (
    <table className="ask-evidence">
      <thead>
        <tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.slice(0, 8).map((r, i) => (
          <tr key={i}>{cols.map((c) => <td key={c}>{String(r[c] ?? '')}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

function resolvePseudos(text, lexicon) {
  if (!text || !Array.isArray(lexicon)) return text;
  const map = {};
  for (const l of lexicon) map[l.pseudo] = l.name || l.account_id;
  return String(text).replace(/R-\d{3}/g, (m) => (map[m] ? `${map[m]} (${m})` : m));
}

/* Mini-render markdown seguro (solo ##, **, bullets "- ").
   Sin dangerouslySetInnerHTML: React escapa el texto por defecto,
   asi que el HTML del LLM nunca se ejecuta. */
function inlineStrong(text, keyPrefix) {
  const parts = String(text).split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((p, i) =>
    i % 2 === 1 ? <strong key={`${keyPrefix}-b${i}`}>{p}</strong> : p
  );
}

function renderMdLite(text) {
  const lines = String(text || '').split('\n');
  const out = [];
  let bullets = [];
  const flushBullets = () => {
    if (bullets.length) {
      out.push(
        <ul key={`ul-${out.length}`} className="ask-md-ul">
          {bullets.map((b, i) => <li key={i}>{inlineStrong(b, `li${out.length}-${i}`)}</li>)}
        </ul>
      );
      bullets = [];
    }
  };
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (/^##\s+/.test(line)) {
      flushBullets();
      out.push(
        <div key={`h-${i}`} className="ask-md-title">
          {inlineStrong(line.replace(/^##\s+/, ''), `h${i}`)}
        </div>
      );
    } else if (/^[-*]\s+/.test(line)) {
      bullets.push(line.replace(/^[-*]\s+/, ''));
    } else if (line === '') {
      flushBullets();
    } else {
      flushBullets();
      out.push(
        <p key={`p-${i}`} className="ask-md-p">{inlineStrong(line, `p${i}`)}</p>
      );
    }
  });
  flushBullets();
  return out.length ? out : text;
}

export default function AskPanel({ onApplyResidents }) {
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [explore, setExplore] = useState(false);
  const [usage, setUsage] = useState(null);
  const [collapsed, setCollapsed] = useState({});

  const toggleItem = (i) => {
    setCollapsed((c) => ({ ...c, [i]: !c[i] }));
  };

  useEffect(() => {
    apiFetch('/auth/me').then(
      (d) => {
        const admin = !!(d && d.user && d.user.is_admin);
        setIsAdmin(admin);
        // Explore auto-activado al abrir (sin boton): solo donde el backend
        // lo permite (admins). No-admins usan el modo router.
        setExplore(admin);
      },
      () => { setIsAdmin(false); setExplore(false); }
    );
    // OpenRouter spend meter (aggregate only, key never leaves server).
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

  const askExplore = async (text) => {
    const activeHoa = typeof localStorage !== 'undefined'
      ? localStorage.getItem('wm_active_hoa') : null;
    const res = await fetch(`${API_BASE_URL}/ai-explore`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(activeHoa ? { 'X-HOA-ID': activeHoa } : {})
      },
      body: JSON.stringify({ prompt: text })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      const err = new Error(data.error || `HTTP ${res.status}`);
      err.payload = data;
      throw err;
    }
    return {
      explore: true,
      answer: data.narrative,
      lexicon: data.lexicon || [],
      lineageText: `Anonymized rows: ${data.rows_sent}${data.truncated ? '+' : ''} · tenant ${data.tenant && data.tenant.license_number} · via ${data.source}`
    };
  };
  const ask = async (q) => {
    const text = (q ?? prompt).trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      if (explore) {
        const ex = await askExplore(text);
        setHistory((h) => [...h, { q: text, ok: true, explore: true, data: ex }]);
      } else {
        const data = await postAiFilter(text);
        setHistory((h) => [...h, { q: text, ok: true, data }]);
      }
      setPrompt('');
    } catch (err) {
      setHistory((h) => [...h, { q: text, ok: false, error: err.message, data: err.payload || null }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ask-panel">
      <div className="ask-header">
        <strong>Natural language query</strong>
        <span>
          <button type="button" className="ask-close" onClick={closeOverlay}>✕</button>
        </span>
      </div>
      {explore && isAdmin && (
        <div className="ask-notice">Explore mode: rows travel anonymized (R-###) to the model; names are resolved here.</div>
      )}
      {usage && <div className="ask-usage">{usage}</div>}
      <div className="ask-input-row">
        <input
          type="text"
          value={prompt}
          placeholder="E.g.: how much does resident 010003 owe · outstanding checks · GL 41700"
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') ask(); }}
          disabled={busy}
        />
        <button type="button" onClick={() => ask()} disabled={busy || !prompt.trim()}>
          {busy ? '…' : 'Ask'}
        </button>
      </div>
      <div className="ask-history">
        {history.length === 0 && (
          <div className="ask-empty">Ask something to start. History lives only in this session.</div>
        )}
        {history.map((h, i) => {
          const isCollapsed = !!collapsed[i];
          return (
          <div className="ask-item" key={i}>
            <div
              className="ask-q"
              onClick={() => toggleItem(i)}
              title={isCollapsed ? 'Expand' : 'Collapse'}
              style={{ cursor: 'pointer' }}
            >
              <span className="ask-chevron">{isCollapsed ? '▸' : '▾'}</span> {h.q}
            </div>
            {!isCollapsed && (
            h.ok ? (
              h.data.explore ? (
                <>
                  <div className="ask-card">{renderMdLite(resolvePseudos(h.data.answer, h.data.lexicon))}</div>
                  <div className="ask-lineage">{h.data.lineageText}</div>
                </>
              ) : (
              <>
                <div className="ask-a">{h.data.answer || h.data.message || 'OK'}</div>
                {Array.isArray(h.data.residents) && h.data.residents.length > 0 && (
                  <div className="ask-apply">
                    <button
                      type="button"
                      onClick={() => { if (onApplyResidents) onApplyResidents(h.data.residents, h.q); closeOverlay(); }}
                    >
                      Apply {h.data.residents.length} to the table
                    </button>
                  </div>
                )}
                <EvidenceTable data={h.data} />
                <div className="ask-lineage">{lineageText(h.data)}</div>
              </>
              ))
              : (
              <>
                <div className="ask-error">{h.error}</div>
                {h.data && h.data.tenant && (
                  <div className="ask-lineage">tenant {h.data.tenant.license_number} · via {h.data.source || '?'}</div>
                )}
              </>
            ))}
          </div>
          );
        })}
      </div>
    </div>
  );
}
