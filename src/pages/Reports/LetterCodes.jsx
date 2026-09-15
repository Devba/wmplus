import { useEffect, useState } from 'react';
import { apiFetch } from '../../config/api';
import { exportCsv, printView } from '../../utils/exportCsv';
import './Reports.css';

// Tier 1: Letter Codes por HOA (reusa fines-late-fees, sin backend nuevo).
export default function LetterCodes() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const d = await apiFetch('/settings/fines-late-fees');
        if (live) setData(d);
      } catch (e) {
        if (live) setError(e.message);
      }
    })();
    return () => { live = false; };
  }, []);

  if (error) return <div className="reports-page"><div className="reports-error">{error}</div></div>;
  if (!data) return <div className="reports-page"><div className="reports-loading">Cargando…</div></div>;

  const rows = [
    ...(data.fineTypesList?.timed || []).map((r) => ({ cat: 'timed', code: r[0], type: r[1], gl: r[2], amount: r[3], active: r[4] })),
    ...(data.fineTypesList?.immediate || []).map((r) => ({ cat: 'immediate', code: r[0], type: r[1], gl: r[2], amount: r[3], active: r[4] })),
  ];

  return (
    <div className="reports-page">
      <h2>Violation Letter Codes</h2>
      <p className="reports-sub">Catálogo por HOA activa · {rows.length} tipos · Fuente VBA: hoja VIOLATION LETTER CODES A18:D48 · Reglas en Settings › Fines/Late Fees</p>
      <div className="reports-bar">
        <button onClick={() => exportCsv('letter-codes.csv', rows, [
          { key: 'cat', label: 'CATEGORY' }, { key: 'code', label: 'LETTER CODE' },
          { key: 'type', label: 'VIOLATION TYPE' }, { key: 'gl', label: 'GL CODE' },
          { key: 'amount', label: 'FINE $$' }, { key: 'active', label: 'ACTIVE' },
        ])}>EXPORT CSV</button>
        <button onClick={printView}>IMPRIMIR</button>
      </div>
      <table className="reports-table">
        <thead><tr><th>CAT</th><th>LETTER CODE</th><th>VIOLATION TYPE</th><th>GL</th><th>FINE $$</th><th>ACT</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}><td>{r.cat}</td><td>{r.code}</td><td>{r.type}</td><td>{r.gl}</td><td>{r.amount}</td><td>{r.active}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
