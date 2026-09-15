import { useEffect, useState } from 'react';
import { apiFetch } from '../../config/api';
import { exportCsv, printView } from '../../utils/exportCsv';
import './Reports.css';

// R3: Open Checks = checks emitidos sin cobrar (DateCheckCleared NULL).
export default function OpenChecks() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const d = await apiFetch('/check-register');
        if (live) setRows((Array.isArray(d) ? d : []).filter((c) => !c.date_cleared));
      } catch (e) {
        if (live) setError(e.message);
      }
    })();
    return () => { live = false; };
  }, []);

  if (error) return <div className="reports-page"><div className="reports-error">{error}</div></div>;
  if (!rows) return <div className="reports-page"><div className="reports-loading">Cargando…</div></div>;

  const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0);

  return (
    <div className="reports-page">
      <h2>Open Check Report</h2>
      <p className="reports-sub">
        Checks pendientes por HOA activa · {rows.length} · total ${total.toFixed(2)}
      </p>
      <div className="reports-bar">
        <button onClick={() => exportCsv('open-checks.csv', rows, [
          { key: 'check_number', label: 'CHECK#' }, { key: 'payee_name', label: 'PAYEE' },
          { key: 'amount', label: 'AMOUNT' }, { key: 'date_issued', label: 'ISSUED' },
          { key: 'bank_account', label: 'BANK' },
        ])}>EXPORT CSV</button>
        <button onClick={printView}>IMPRIMIR</button>
      </div>
      <table className="reports-table">
        <thead><tr><th>CHECK#</th><th>PAYEE</th><th>AMOUNT</th><th>ISSUED</th><th>BANK</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.check_txn_num || r.check_number}>
              <td>{r.check_number}</td><td>{r.payee_name}</td>
              <td>{Number(r.amount || 0).toFixed(2)}</td><td>{r.date_issued}</td><td>{r.bank_account}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
