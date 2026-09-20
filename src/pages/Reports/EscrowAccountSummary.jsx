import { useEffect, useState } from 'react';
import { apiFetch } from '../../config/api';
import { exportCsv, printView } from '../../utils/exportCsv';
import './Reports.css';

// Resumen tipo "estado de cuenta" de la cuenta Escrow (BankID 301, GL 1020).
// Muestra balance, breakdown por GL y estado de co-mingling.
export default function EscrowAccountSummary() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const d = await apiFetch('/reports/escrow-summary');
        if (live) setData(d);
      } catch (e) {
        if (live) setError(e.message);
      }
    })();
    return () => { live = false; };
  }, []);

  if (error) return <div className="reports-page"><div className="reports-error">{error}</div></div>;
  if (!data) return <div className="reports-page"><div className="reports-loading">Cargando…</div></div>;

  const { bank, ledger, fiscalYear, glBreakdown, totals } = data;

  const csvRows = [
    { gl_number: '', gl_name: 'TOTAL IN', cash_in: totals.cash_in, cash_out: '' },
    { gl_number: '', gl_name: 'TOTAL OUT', cash_in: '', cash_out: totals.cash_out },
    { gl_number: '', gl_name: 'NET', cash_in: '', cash_out: totals.net },
    ...glBreakdown,
  ];

  return (
    <div className="reports-page">
      <h2>Escrow Account Summary</h2>
      <p className="reports-sub">
        {bank.BankName} · Bank ID {bank.BankID} · GL {bank.GLCashAccount} · FY {fiscalYear} ·
        Co-Mingled: {bank.CoMingled === 'Y' ? `Y (with ${bank.CoMingledWith || '?'})` : 'N'}
      </p>

      <div className="reports-bar">
        <button onClick={() => exportCsv('escrow-summary.csv', csvRows, [
          { key: 'gl_number', label: 'GL#' },
          { key: 'gl_name', label: 'GL NAME' },
          { key: 'cash_in', label: 'CASH IN' },
          { key: 'cash_out', label: 'CASH OUT' },
        ])}>EXPORT CSV</button>
        <button onClick={printView}>IMPRIMIR</button>
      </div>

      <h3 className="reports-h3">Current Balance</h3>
      <table className="reports-table">
        <tbody>
          <tr><th>Opening Balance</th><td>${Number(ledger?.OpeningBalance || 0).toFixed(2)}</td></tr>
          <tr><th>Current Balance</th><td>${Number(ledger?.CurrentBalance || 0).toFixed(2)}</td></tr>
          <tr><th>Total Cash In (FY)</th><td>${Number(totals.cash_in || 0).toFixed(2)}</td></tr>
          <tr><th>Total Cash Out (FY)</th><td>${Number(totals.cash_out || 0).toFixed(2)}</td></tr>
          <tr><th>Net (FY)</th><td><strong>${Number(totals.net || 0).toFixed(2)}</strong></td></tr>
          <tr><th>Last Posted</th><td>{ledger?.LastPostedDateTime || '—'}</td></tr>
        </tbody>
      </table>

      <h3 className="reports-h3">GL Breakdown ({glBreakdown.length} cuentas)</h3>
      <table className="reports-table">
        <thead><tr><th>GL#</th><th>GL Name</th><th>Cash In</th><th>Cash Out</th><th>Net</th></tr></thead>
        <tbody>
          {glBreakdown.map((r, i) => {
            const net = Number(r.cash_in || 0) - Number(r.cash_out || 0);
            return (
              <tr key={i}>
                <td>{r.gl_number}</td>
                <td>{r.gl_name}</td>
                <td>${Number(r.cash_in || 0).toFixed(2)}</td>
                <td>${Number(r.cash_out || 0).toFixed(2)}</td>
                <td><strong>${net.toFixed(2)}</strong></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
