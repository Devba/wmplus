import { useEffect, useState } from 'react';
import { apiFetch } from '../../config/api';
import { exportCsv, printView } from '../../utils/exportCsv';
import './Reports.css';

// R3: AR Summary v1 = saldos por residente (scoped).
// NOTA: buckets por vencimiento (30/60/90) pendientes — el modelo no tiene
// due-date por assessment (ver docs, R4).
export default function ARSummary() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const d = await apiFetch('/reports/ar-summary');
        if (live) setRows(d.rows || []);
      } catch (e) {
        if (live) setError(e.message);
      }
    })();
    return () => { live = false; };
  }, []);

  if (error) return <div className="reports-page"><div className="reports-error">{error}</div></div>;
  if (!rows) return <div className="reports-page"><div className="reports-loading">Cargando…</div></div>;

  const grand = rows.reduce((s, r) => s + Number(r.total_ar || 0), 0);

  return (
    <div className="reports-page">
      <h2>AR Summary</h2>
      <p className="reports-sub">
        Saldos por residente · {rows.length} · total ${grand.toFixed(2)}
      </p>
      <div className="reports-bar">
        <button onClick={() => exportCsv('ar-summary.csv', rows, [
          { key: 'account_id', label: 'ACCT#' }, { key: 'first_name', label: 'FIRST' },
          { key: 'last_name', label: 'LAST' }, { key: 'yearly_required', label: 'YEARLY REQ' },
          { key: 'paid_ytd', label: 'PAID YTD' }, { key: 'balance_due', label: 'BALANCE' },
          { key: 'total_ar', label: 'TOTAL AR' },
        ])}>EXPORT CSV</button>
        <button onClick={printView}>IMPRIMIR</button>
      </div>
      <table className="reports-table">
        <thead><tr><th>ACCT#</th><th>NAME</th><th>YEARLY REQ</th><th>PAID YTD</th><th>BALANCE</th><th>TOTAL AR</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.account_id}>
              <td>{r.account_id}</td><td>{[r.first_name, r.last_name].filter(Boolean).join(' ')}</td>
              <td>{Number(r.yearly_required || 0).toFixed(2)}</td>
              <td>{Number(r.paid_ytd || 0).toFixed(2)}</td>
              <td>{Number(r.balance_due || 0).toFixed(2)}</td>
              <td>{Number(r.total_ar || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
