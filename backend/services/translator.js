/* ===========================================================
   AI ROUTER — traductor pregunta -> {funcion, params} del registry.
   Cascada: local determinista -> OpenRouter (barato) -> null
   (la ruta decide el ultimo recurso). El LLM jamas ve filas de la
   BD (solo prompt + catalogo) y jamas genera SQL.
   Env: AI_MODEL (default deepseek/deepseek-chat),
        AI_TRANSLATE_TIMEOUT (ms, default 20000),
        OPENROUTER_KEY_FILE (default ~/.config/opencode/secrets/openrouter-api-key).
   =========================================================== */

const fs = require('fs');
const os = require('os');
const path = require('path');

const KEY_FILE = process.env.OPENROUTER_KEY_FILE ||
  path.join(os.homedir(), '.config', 'opencode', 'secrets', 'openrouter-api-key');
const AI_MODEL = process.env.AI_MODEL || 'deepseek/deepseek-chat';
const AI_TIMEOUT = parseInt(process.env.AI_TRANSLATE_TIMEOUT || '20000', 10) || 20000;

const VALID_KEYS = new Set([
  'account-history', 'outstanding-checks', 'period-diff',
  'gl-transactions', 'vendor-invoices', 'violations', 'anomalies'
]);

/* Cobertura del router (memoria; se pierde al reiniciar). */
const stats = { routed_local: 0, routed_llm: 0, legacy: 0, blocked: 0 };
function bump(kind) {
  if (stats[kind] !== undefined) stats[kind] += 1;
}
function getStats() {
  const total = stats.routed_local + stats.routed_llm + stats.legacy + stats.blocked;
  return { ...stats, total, router_share: total ? (stats.routed_local + stats.routed_llm) / total : null };
}

let keyCache;
function getKey() {
  if (keyCache !== undefined) return keyCache;
  try {
    keyCache = fs.readFileSync(KEY_FILE, 'utf8').trim().split(/\s+/)[0] || null;
  } catch (_) {
    keyCache = null;
  }
  return keyCache;
}

/* ---------- nivel 1: clasificador local determinista ---------- */

function extractResident(prompt) {
  const m = String(prompt).match(/RES-?\d+|\b\d{5,6}\b/i);
  return m ? m[0].toUpperCase() : null;
}

function extractGL(prompt) {
  const m = String(prompt).match(/GL\s*#?\s*(\d{4,5})/i) ||
    String(prompt).match(/\b([45]\d{4})\b/);
  return m ? m[1] : null;
}

function extractDates(prompt) {
  return (String(prompt).match(/\d{4}-\d{2}-\d{2}/g) || []).slice(0, 4);
}

function extractVendorToken(prompt) {
  const s = String(prompt);
  // 1) ID estructurado (VEND-001, 010003, RES-001): inequívoco.
  const id = s.match(/\b([A-Z]{2,}-?\d+|\d{5,6}|RES-?\d+)\b/i);
  if (id) return id[1].toUpperCase();
  // 2) palabra tras la keyword, saltando artículos y sinónimos.
  const m = s.match(/(?:vendor|proveedor|facturas?|invoice)\b(.*)$/i);
  if (!m) return null;
  const SKIP = new Set(['vendor', 'proveedor', 'factura', 'facturas', 'invoice',
    'del', 'de', 'la', 'el', 'the', 'no', 'numero', 'number']);
  const toks = m[1].split(/[\s#:.,;]+/).filter(Boolean);
  const tok = toks.find((t) => !SKIP.has(t.toLowerCase()));
  return tok || null;
}

function classifyLocal(prompt) {
  const lower = String(prompt || '').toLowerCase();

  // Q6 primero (tambien matchearia "checks"/deuda en otros casos).
  if (/multa|violaci|fine\b|infracci/.test(lower)) {
    return { key: 'violations', params: {}, source: 'local' };
  }
  // Q3 cheques pendientes.
  if (/cheque|outstanding|pendiente/.test(lower)) {
    return { key: 'outstanding-checks', params: {}, source: 'local' };
  }
  // Q5 por GL#.
  const gl = extractGL(prompt);
  if (/gl\b/.test(lower) && gl) {
    return { key: 'gl-transactions', params: { gl }, source: 'local' };
  }
  // Q7 vendor/factura + token.
  if (/vendor|proveedor|factura|invoice/.test(lower)) {
    const vendor = extractVendorToken(prompt);
    if (vendor) return { key: 'vendor-invoices', params: { vendor }, source: 'local' };
    return null;
  }
  // Q8 inusual/atrasado (deuda con residente va a Q1, no aqui).
  if (/inusual|raro|anomal|atrasad|overdue|vencido|moroso/.test(lower) &&
      !/deuda|debe|saldo|balance/.test(lower)) {
    return { key: 'anomalies', params: {}, source: 'local' };
  }
  // Q4 comparativa con 2 fechas.
  const dates = extractDates(prompt);
  if (dates.length >= 2 && /cambi|diferencia|compar| vs |periodo|trimestre/.test(lower)) {
    return {
      key: 'period-diff',
      params: { from: dates[0], to: dates[1], compare_from: dates[2] || null, compare_to: dates[3] || null },
      source: 'local'
    };
  }
  // Q1+Q2: deuda/saldo/pagos + residente identificado.
  if (/debe|deuda|saldo|balance|adeuda|pagos|historial|cuenta/.test(lower)) {
    const resident = extractResident(prompt);
    if (resident) return { key: 'account-history', params: { resident }, source: 'local' };
    return null;
  }
  return null;
}

/* ---------- nivel 2: OpenRouter barato, solo catalogo ---------- */

function catalogText() {
  return [
    '{"function":"account-history","params":{"resident":"ID (requerido)"}} = cuanto debe un residente + que pagos lo produjeron',
    '{"function":"outstanding-checks","params":{}} = cheques pendientes',
    '{"function":"period-diff","params":{"from":"YYYY-MM-DD","to":"YYYY-MM-DD","compare_from":"...","compare_to":"..."}} = que cambio entre periodos',
    '{"function":"gl-transactions","params":{"gl":"numero (requerido)"}} = transacciones de un GL#',
    '{"function":"vendor-invoices","params":{"vendor":"token (requerido)"}} = facturas de un vendor',
    '{"function":"violations","params":{}} = PROHIBIDO elegirla: responde {"function":"none"} si preguntan multas/violaciones',
    '{"function":"anomalies","params":{}} = que es inusual o esta atrasado'
  ].join('\n');
}

async function translateOpenRouter(prompt, tenant) {
  const key = getKey();
  if (!key) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT);
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'https://dev.hoa-e-solutions.com/qa/',
        'X-Title': 'wmplus-ai-router'
      },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: 0,
        max_tokens: 300,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Traduce la pregunta a UNA llamada del catalogo. Responde SOLO el JSON {"function": clave, "params": {...}}. Si no encaja en nada, responde {"function":"none"}.\n${catalogText()}\nTenant (informativo, no lo incluyas en params): ${tenant}.`
          },
          { role: 'user', content: String(prompt).slice(0, 500) }
        ]
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data && data.choices && data.choices[0] &&
      data.choices[0].message && data.choices[0].message.content;
    if (!text) return null;
    const parsed = JSON.parse(String(text).replace(/```json|```/g, '').trim());
    if (!parsed || !VALID_KEYS.has(parsed.function)) return null;
    return { key: parsed.function, params: parsed.params || {}, source: 'openrouter' };
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- cascada publica ---------- */

async function translate(prompt, tenant) {
  const local = classifyLocal(prompt);
  if (local) return local;
  const remote = await translateOpenRouter(prompt, tenant);
  if (remote) return remote;
  return null;
}

/* ---------- resumen humano por funcion (modo answer del frontend) ---------- */

function summarize(key, out) {
  const s = (out && out.summary) || {};
  switch (key) {
    case 'account-history': {
      const b = (out.result && out.result.balance) || {};
      const name = b.display_name || b.account_id || '';
      return `Saldo ${name}: ${s.balance_due != null ? s.balance_due : 'sin registro'} (${s.payments_count || 0} pagos)`;
    }
    case 'outstanding-checks':
      return `Cheques pendientes: ${s.count || 0} (total ${s.total || 0})`;
    case 'gl-transactions':
      return `GL ${out.params_resolved && out.params_resolved.gl}: ${s.count || 0} movs, neto ${s.net || 0}`;
    case 'vendor-invoices':
      return `Facturas vendor: ${s.count || 0} (total ${s.invoices_total || 0})`;
    case 'period-diff':
      return out.message || 'Period-diff en construccion';
    case 'anomalies':
      return out.message || 'Anomalias en construccion';
    case 'violations':
      return out.message || 'FL-dependiente';
    default:
      return 'OK';
  }
}

module.exports = { translate, classifyLocal, summarize, VALID_KEYS, bump, getStats };
