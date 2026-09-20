import { useEffect, useState } from 'react';
import { apiFetch } from '../../config/api';
import { exportCsv, printView } from '../../utils/exportCsv';
import './Reports.css';

// Histórico de saldos de la cuenta Escrow por año fiscal.
export default function HistoricEscrow() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const d = await apiFetch('/reports/escrow-historic');
        if (live) setRows(d.rows || []);
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
      <h2>Historic Escrow</h2>
      <p className="reports-sub">
        Saldos anuales · {rows.length} ejercicio(s) · Bank ID 301 (Wells Fargo)
      </p>
      <div className="reports-bar">
        <button onClick={() => exportCsv('historic-escrow.csv', rows, [
          { key: 'fiscal_year', label: 'FISCAL YEAR' },
          { key: 'opening_balance', label: 'OPENING' },
          { key: 'closing_balance', label: 'CLOSING' },
          { key: 'last_posted_date', label: 'LAST POSTED' },
        ])}>EXPORT CSV</button>
        <button onClick={printView}>IMPRIMIR</button>
      </div>
      <table className="reports-table">
        <thead>
          <tr>
            <th>Fiscal Year</th>
            <th>Opening Balance</th>
            <th>Closing Balance</th>
            <th>Net Change</th>
            <th>Last Posted</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const open = Number(r.opening_balance || 0);
            const close = Number(r.closing_balance || 0);
            const net = close - open;
            return (
              <tr key={r.fiscal_year}>
                <td><strong>{r.fiscal_year}</strong></td>
                <td>${open.toFixed(2)}</td>
                <td>${close.toFixed(2)}</td>
                <td><strong style={{ color: net >= 0 ? '#15803d' : '#b91c1c' }}>${net.toFixed(2)}</strong></td>
                <td>{r.last_posted_date || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
