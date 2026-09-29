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
  return `Fuentes: ${tables} · ${bits.join(' · ') || 'sin filtros'} · vía ${d.source || '?'}`;
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

export default function AskPanel({ onApplyResidents }) {
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [explore, setExplore] = useState(false);

  useEffect(() => {
    apiFetch('/auth/me').then(
      (d) => setIsAdmin(!!(d && d.user && d.user.is_admin)),
      () => setIsAdmin(false)
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
      lineageText: `Filas anonimizadas: ${data.rows_sent}${data.truncated ? '+' : ''} · tenant ${data.tenant && data.tenant.license_number} · vía ${data.source}`
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
        <strong>Consulta en lenguaje natural</strong>
        <span>
          {isAdmin && (
            <button
              type="button"
              className={explore ? 'ask-mode on' : 'ask-mode'}
              onClick={() => setExplore((v) => !v)}
              title="Preguntas abiertas sobre filas anonimizadas (solo admins)"
            >
              Explorar filas{explore ? ' ✓' : ''}
            </button>
          )}
          <button type="button" className="ask-close" onClick={closeOverlay}>✕</button>
        </span>
      </div>
      {explore && isAdmin && (
        <div className="ask-notice">Modo explorar: las filas viajan anonimizadas (R-###) al modelo; los nombres se resuelven aquí.</div>
      )}
      <div className="ask-input-row">
        <input
          type="text"
          value={prompt}
          placeholder="Ej: cuanto debe el residente 010003 · cheques pendientes · GL 41700"
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') ask(); }}
          disabled={busy}
        />
        <button type="button" onClick={() => ask()} disabled={busy || !prompt.trim()}>
          {busy ? '…' : 'Preguntar'}
        </button>
      </div>
      <div className="ask-history">
        {history.length === 0 && (
          <div className="ask-empty">Pregunta algo para empezar. El historial vive solo en esta sesión.</div>
        )}
        {history.map((h, i) => (
          <div className="ask-item" key={i}>
            <div className="ask-q">❯ {h.q}</div>
            {h.ok ? (
              h.data.explore ? (
                <>
                  <div className="ask-a">{resolvePseudos(h.data.answer, h.data.lexicon)}</div>
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
                      Aplicar {h.data.residents.length} a la tabla
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
                  <div className="ask-lineage">tenant {h.data.tenant.license_number} · vía {h.data.source || '?'}</div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
