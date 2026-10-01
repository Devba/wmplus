/* ===========================================================
   AI EXPLORE — preguntas abiertas sobre filas del Main Directory.
   Solo is_admin. PII (nombres, direcciones, telefonos, emails,
   notas, copropietarios) NUNCA sale del servidor: el LLM ve
   pseudonimos R-### + columnas analiticas. Mapa R->cuenta solo
   en memoria del request; el panel resuelve nombres localmente.
   El LLM narra y cita pseudos; NO calcula (numeros = registry).
   Tope 150 filas + filtros. Todo acceso queda auditado en log.
   =========================================================== */

const db = require('../db');

const MAX_ROWS = 150;

function pseudo(i) {
  return `R-${String(i + 1).padStart(3, '0')}`;
}

async function fetchRows(licenseNumber, filters) {
  const conds = [`rm.HOALicenseNumber = ?`, `(rm.DeletedFlag IS NULL OR rm.DeletedFlag != 'Y')`];
  const params = [licenseNumber];
  if (filters.active_only) {
    conds.push(`rm.ActiveResidentFlag = 'Y'`);
  }
  if (filters.debtors_only) {
    conds.push(`COALESCE(ar.TotalCurrentAR, 0) > 0`);
  }
  const [rows] = await (db.readOnlyPool || db).query(
    `SELECT rm.ResidentAccountID AS account_id,
            rm.DisplayName AS display_name, rm.FirstName AS first_name, rm.LastName AS last_name,
            rm.City AS city, rm.StateCode AS state, rm.ZipCode AS zip,
            rm.MoveInDate AS move_in, rm.MoveOutDate AS move_out,
            rm.ResidentType AS type, rm.OwnerFlag AS owner,
            rm.ActiveResidentFlag AS active,
            rm.AnnualDuesRate AS annual_rate, rm.AnnualDues AS annual_dues,
            rm.SpecialAssessmentRate AS special_rate, rm.SpecialAssessmentDues AS special_dues,
            rm.FinesFeesBalance AS fines,
            COALESCE(ar.TotalCurrentAR, 0) AS total_ar,
            COALESCE(ar.AssessmentPaidBalanceDue, 0) AS balance_due
       FROM ResidentMaster rm
       LEFT JOIN AssessmentRegister ar
         ON ar.ResidentAccountID = rm.ResidentAccountID
        AND ar.HOALicenseNumber = rm.HOALicenseNumber
        AND (ar.ActiveFlag IS NULL OR ar.ActiveFlag != 'N')
      WHERE ${conds.join(' AND ')}
      ORDER BY rm.LastName ASC, rm.FirstName ASC, rm.ResidentAccountID ASC
      LIMIT ${MAX_ROWS + 1}`,
    params
  );
  return rows;
}

function anonymize(rows) {
  const lexicon = [];
  const anon = rows.map((r, i) => {
    const p = pseudo(i);
    // Nombre SOLO para el panel del admin (jamas viaja al LLM).
    const nm = r.display_name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.account_id;
    lexicon.push({ pseudo: p, account_id: r.account_id, name: nm });
    return {
      ref: p,
      city: r.city || '', state: r.state || '', zip: r.zip || '',
      move_in: r.move_in || '', move_out: r.move_out || '',
      type: r.type || '', owner: r.owner || '', active: r.active || 'Y',
      annual_rate: r.annual_rate || '', annual_dues: Number(r.annual_dues || 0),
      special_rate: r.special_rate || '', special_dues: Number(r.special_dues || 0),
      fines: Number(r.fines || 0),
      total_ar: Number(r.total_ar || 0), balance_due: Number(r.balance_due || 0)
    };
  });
  return { anon, lexicon };
}

async function askLlm(question, anonRows, tenant, deps) {
  const { getKey, aiModel, aiTimeout } = deps;
  const key = getKey();
  if (!key) throw Object.assign(new Error('Sin LLM configurado'), { status: 503 });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), aiTimeout);
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'https://dev.hoa-e-solutions.com/qa/',
        'X-Title': 'wmplus-ai-explore'
      },
  body: JSON.stringify({
        model: aiModel,
        temperature: 0.2,
        max_tokens: 800,
        messages: [
          {
            role: 'system',
            content: `You are an HOA analyst. You get ANONYMIZED resident rows (ref R-001... no names, addresses, phones or emails). Rules: 1) Answer in English, with simple markdown FORMAT: first line "## " + short headline with the key figure in **bold**; then 2-5 bullets with "- " for patterns and standout figures (numbers always in **bold**); close with one recommendation line if applicable. Only use "## ", "**", "- " and line breaks; no tables, HTML or code. 2) Cite rows by ref (R-012), never invent refs. 3) Do NOT compute exact totals/averages: describe patterns ("most", "a few with high balance"); if asked for an exact number say to use the reports function. 4) Never reveal or ask for personal data. 5) If the question cannot be answered with these columns, say so in one line. HOA: ${tenant}.`
          },
          { role: 'user', content: `Pregunta: ${String(question).slice(0, 500)}\n\nFilas (${anonRows.length}):\n${JSON.stringify(anonRows).slice(0, 60000)}` }
        ]
      })
    });
    if (!res.ok) throw Object.assign(new Error(`LLM HTTP ${res.status}`), { status: 502 });
    const data = await res.json();
    const text = data && data.choices && data.choices[0] &&
      data.choices[0].message && data.choices[0].message.content;
    if (!text) throw Object.assign(new Error('LLM sin respuesta'), { status: 502 });
    return String(text);
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchRows, anonymize, askLlm, MAX_ROWS };
