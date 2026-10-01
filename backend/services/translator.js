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
const AI_TIMEOUT = parseInt(process.env.AI_TRANSLATE_TIMEOUT || '60000', 10) || 60000;

const VALID_KEYS = new Set([
  'account-history', 'hoa-ar-summary', 'outstanding-checks', 'period-diff',
  'gl-transactions', 'vendor-invoices', 'violations', 'anomalies', 'resident-count'
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
  if (/multa|violaci|\bfines?\b|violation|infracci/.test(lower)) {
    return { key: 'violations', params: {}, source: 'local' };
  }
  // Q3 cheques pendientes / outstanding checks.
  if (/cheque|check|outstanding|pendiente|pending/.test(lower)) {
    return { key: 'outstanding-checks', params: {}, source: 'local' };
  }
  // Q5 por GL#.
  const gl = extractGL(prompt);
  if (/gl\b/.test(lower) && gl) {
    return { key: 'gl-transactions', params: { gl }, source: 'local' };
  }
  // Q7 vendor/factura + token.
  if (/vendor|proveedor|factura|invoice|bill/.test(lower)) {
    const vendor = extractVendorToken(prompt);
    if (vendor) return { key: 'vendor-invoices', params: { vendor }, source: 'local' };
    return null;
  }
  // Q8 inusual/atrasado (deuda con residente va a Q1, no aqui).
  if (/inusual|raro|anomal|atrasad|overdue|vencido|moroso|unusual|weird|late|past due|delinquent/.test(lower) &&
      !/deuda|debe|saldo|balance/.test(lower)) {
    return { key: 'anomalies', params: {}, source: 'local' };
  }
  // Q4 comparativa con 2 fechas.
  const dates = extractDates(prompt);
  if (dates.length >= 2 && /cambi|diferencia|compar| vs |periodo|trimestre|chang|differ|between|quarter/.test(lower)) {
    const gl4 = extractGL(prompt);
    const vendor4 = /vendor|proveedor|factura|invoice/.test(lower) ? extractVendorToken(prompt) : null;
    return {
      key: 'period-diff',
      params: {
        from: dates[0], to: dates[1], compare_from: dates[2] || null, compare_to: dates[3] || null,
        ...(gl4 ? { subject: 'gl', gl: gl4 } : {}),
        ...(vendor4 ? { subject: 'vendor', vendor: vendor4 } : {})
      },
      source: 'local'
    };
  }
  // Q1+Q2: deuda/saldo/pagos + residente identificado.
  // Sin residente pero con alcance total EXPLICITO (all/todos/total/how many
  // owe) -> agregado HOA. OJO: "how much" solo NO agrega (una pregunta por
  // una persona nombrada sin ID, ej. "how much does Sarah owe", debe ir al
  // LLM y de ahi a 422 honesto, no al total de la HOA).
  if (/debe|deuda|saldo|balance|adeuda|pagos|historial|cuenta|owe|owes|owed|debt|payments|history|account/.test(lower)) {
    const resident = extractResident(prompt);
    if (resident) return { key: 'account-history', params: { resident }, source: 'local' };
    if (/all\b|todos|todas|total|how many owe|cuanto deben|cuantos deben/.test(lower)) {
      return { key: 'hoa-ar-summary', params: {}, source: 'local' };
    }
    return null;
  }
  // Conteo de residentes (input ES o EN): SOLO total sin filtros.
  // Si queda cualquier resto sustantivo (estado, ciudad, "in florida"...),
  // no se reclama: pasa al LLM, que veta (none -> 422 honesto, fuera del
  // catalogo v1). Asi "how many residents live in Florida" no devuelve 100.
  if (/how many residents|cu[aá]ntos residentes|total de residentes|n[uú]mero de residentes|resident count|total residents/.test(lower)) {
    const rest = lower
      .replace(/how many residents|cu[aá]ntos residentes|total de residentes|n[uú]mero de residentes|resident count|total residents/g, ' ')
      .replace(/\bin total\b|\ben total\b/g, ' ')
      .replace(/\b(are|is|there|here|live|hay|el|la|los|las|the|a|an|de|total|please|dime|me|cuantos|cuántos|how|many)\b/g, ' ')
      .replace(/[?.!,]/g, ' ')
      .replace(/\s+/g, ' ').trim();
    if (!rest) {
      return { key: 'resident-count', params: {}, source: 'local' };
    }
    return null;
  }
  return null;
}

/* ---------- nivel 2: OpenRouter barato, solo catalogo ---------- */

function catalogText() {
  return [
    '{"function":"account-history","params":{"resident":"ID (required)"}} = how much a resident owes + which payments produced it',
    '{"function":"hoa-ar-summary","params":{}} = how much ALL residents owe (HOA total + debtors)',
    '{"function":"outstanding-checks","params":{}} = outstanding / pending checks',
    '{"function":"period-diff","params":{"from":"YYYY-MM-DD","to":"YYYY-MM-DD","compare_from":"...","compare_to":"..."}} = what changed between periods',
    '{"function":"gl-transactions","params":{"gl":"number (required)"}} = transactions of one GL#',
    '{"function":"vendor-invoices","params":{"vendor":"token (required)"}} = invoices of one vendor',
    '{"function":"violations","params":{}} = FORBIDDEN to choose: answer {"function":"none"} if asked about fines/violations',
    '{"function":"anomalies","params":{}} = what is unusual or overdue',
    '{"function":"resident-count","params":{}} = how many residents in total (NO params; only unfiltered totals — if the question filters by state/city/anything, answer {"function":"none"})'
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

/* Valida params del LLM antes de ejecutar: formato, no existencia.
   Lo inexistente lo dice la funcion. Mensajes SIEMPRE en ingles. */
const ACCT_RE = /^(RES-?\d+|\d{5,6})$/i;
const GL_RE = /^\d{4,5}$/;
function validateRouted(key, params) {
  const p = params || {};
  if (key === 'account-history') {
    const r = String(p.resident || '').trim();
    if (!ACCT_RE.test(r)) {
      return 'Missing resident ID (e.g. 071010). Try: how much does resident 071010 owe.';
    }
  }
  if (key === 'gl-transactions') {
    if (!GL_RE.test(String(p.gl || '').trim())) {
      return 'Missing GL number (4-5 digits). Try: GL 41700 transactions.';
    }
  }
  if (key === 'vendor-invoices') {
    if (!String(p.vendor || '').trim()) {
      return 'Missing vendor. Try: invoices of vendor VEND-001.';
    }
  }
  if (key === 'period-diff') {
    if (p.subject === 'gl' && !GL_RE.test(String(p.gl || '').trim())) {
      return 'To compare a GL, provide its number. Try with gl=41700.';
    }
  }
  return null;
}

async function translate(prompt, tenant) {
  const local = classifyLocal(prompt);
  if (local) return local;
  const remote = await translateOpenRouter(prompt, tenant);
  if (remote) return remote;
  return null;
}

/* ---------- resumen humano por funcion (modo answer del frontend, SIEMPRE en ingles) ---------- */

function summarize(key, out) {
  const s = (out && out.summary) || {};
  switch (key) {
    case 'account-history': {
      const b = (out.result && out.result.balance) || {};
      const name = b.display_name || b.account_id || '';
      return `Balance ${name}: ${s.balance_due != null ? s.balance_due : 'no record'} (${s.payments_count || 0} payments)`;
    }
    case 'hoa-ar-summary':
      return `HOA: ${s.debtors || 0} debtors, total ${s.total_ar || 0}`;
    case 'resident-count':
      return `HOA: ${s.total || 0} residents`;
    case 'outstanding-checks':
      return `Outstanding checks: ${s.count || 0} (total ${s.total || 0})`;
    case 'gl-transactions':
      return `GL ${out.params_resolved && out.params_resolved.gl}: ${s.count || 0} moves, net ${s.net || 0}`;
    case 'vendor-invoices':
      return `Vendor invoices: ${s.count || 0} (total ${s.invoices_total || 0})`;
    case 'period-diff': {
      const d = out.summary || {};
      return d.metric != null
        ? `Diff ${d.subject}: ${d.period_value} vs ${d.compare_value} (delta ${d.delta})`
        : (out.message || 'Period-diff under construction');
    }
    case 'anomalies': {
      const n = out.summary ? out.summary.findings_count : null;
      return n != null ? `Anomalies: ${n} findings` : (out.message || 'Anomalies under construction');
    }
    case 'violations':
      return out.message || 'FL-dependent';
    default:
      return 'OK';
  }
}

module.exports = {
  translate, classifyLocal, summarize, validateRouted, VALID_KEYS, bump, getStats,
  getKey, aiModel: AI_MODEL, aiTimeout: AI_TIMEOUT
};
