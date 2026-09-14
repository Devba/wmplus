import { useEffect, useState } from 'react';
import { apiFetch } from '../../config/api';
import { exportCsv, printView } from '../../utils/exportCsv';
import './Reports.css';

// Tier 1: GL Accounts por HOA (reusa gl-mapping, sin backend nuevo).
export default function GLAccounts() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const d = await apiFetch('/settings/gl-mapping');
        if (live) setRows(d.glAccounts || []);
      } catch (e) {
        if (live) setError(e.message);
      }
    })();
    return () => { live = false; };
  }, []);

  if (error) return <div className="reports-page"><div className="reports-error">{error}</div></div>;
  if (!rows) return <div className="reports-page"><div className="reports-loading">Cargando…</div></div>;

  return (
    <div className="reports-page">
      <h2>GL Accounts</h2>
      <p className="reports-sub">Catálogo por HOA activa · {rows.length} cuentas</p>
      <div className="reports-bar">
        <button onClick={() => exportCsv('gl-accounts.csv', rows, [
          { key: 'glNumber', label: 'GL#' }, { key: 'glName', label: 'NAME' },
          { key: 'pc', label: 'P/C' }, { key: 'dc', label: 'D/C' },
          { key: 'bankType', label: 'BANK TYPE' },
        ])}>EXPORT CSV</button>
        <button onClick={printView}>IMPRIMIR</button>
      </div>
      <table className="reports-table">
        <thead><tr><th>GL#</th><th>NAME</th><th>P/C</th><th>D/C</th><th>BANK TYPE</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}><td>{r.glNumber}</td><td>{r.glName}</td><td>{r.pc}</td><td>{r.dc}</td><td>{r.bankType}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
