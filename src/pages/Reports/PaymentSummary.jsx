import { useEffect, useState } from 'react';
import { apiFetch } from '../../config/api';
import { exportCsv, printView } from '../../utils/exportCsv';
import './Reports.css';

// R3: Payment Summary = agregado de pagos APR por residente (scoped).
export default function PaymentSummary() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const d = await apiFetch('/apr/list?limit=500');
        const txns = d.transactions || [];
        const byRes = {};
        txns.forEach((t) => {
          const k = t.ResidentAccountID || '?';
          const cur = byRes[k] || {
            account: k,
            name: [t.FirstName, t.LastName].filter(Boolean).join(' ') || k,
            count: 0, total: 0, last: '',
          };
          cur.count += 1;
          cur.total += Number(t.TotalAmount || t.AnnualDuesPayment || 0);
          if (!cur.last || (t.PaymentDate || '') > cur.last) cur.last = t.PaymentDate || '';
          byRes[k] = cur;
        });
        if (live) setRows(Object.values(byRes).sort((a, b) => b.total - a.total));
      } catch (e) {
        if (live) setError(e.message);
      }
    })();
    return () => { live = false; };
  }, []);

  if (error) return <div className="reports-page"><div className="reports-error">{error}</div></div>;
  if (!rows) return <div className="reports-page"><div className="reports-loading">Cargando…</div></div>;

  const grand = rows.reduce((s, r) => s + r.total, 0);

  return (
    <div className="reports-page">
      <h2>Payment Summary</h2>
      <p className="reports-sub">
        Pagos APR agregados por residente · {rows.length} residentes · total ${grand.toFixed(2)}
      </p>
      <div className="reports-bar">
        <button onClick={() => exportCsv('payment-summary.csv', rows, [
          { key: 'account', label: 'ACCT#' }, { key: 'name', label: 'RESIDENT' },
          { key: 'count', label: 'PAYMENTS' }, { key: 'total', label: 'TOTAL' },
          { key: 'last', label: 'LAST PAYMENT' },
        ])}>EXPORT CSV</button>
        <button onClick={printView}>IMPRIMIR</button>
      </div>
      <table className="reports-table">
        <thead><tr><th>ACCT#</th><th>RESIDENT</th><th>PAYMENTS</th><th>TOTAL</th><th>LAST</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.account}>
              <td>{r.account}</td><td>{r.name}</td><td>{r.count}</td>
              <td>{r.total.toFixed(2)}</td><td>{r.last}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
