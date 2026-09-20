import { useEffect, useState } from 'react';
import { apiFetch } from '../../config/api';
import { exportCsv, printView } from '../../utils/exportCsv';
import './Reports.css';

// Resumen de cuentas por cobrar agrupado por HOA y año fiscal.
// Variante de AR Summary orientada a admin (vista global "Todas las HOAs").
export default function ReceivablesSummary() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const d = await apiFetch('/reports/receivables-summary');
        if (live) setData(d);
      } catch (e) {
        if (live) setError(e.message);
      }
    })();
    return () => { live = false; };
  }, []);

  if (error) return <div className="reports-page"><div className="reports-error">{error}</div></div>;
  if (!data) return <div className="reports-page"><div className="reports-loading">Cargando…</div></div>;

  const { rows, grand_total } = data;

  return (
    <div className="reports-page">
      <h2>Receivables Summary</h2>
      <p className="reports-sub">
        {rows.length} grupo(s) · {rows.reduce((s, r) => s + Number(r.resident_count || 0), 0)} residentes · gran total AR ${Number(grand_total || 0).toFixed(2)}
      </p>
      <div className="reports-bar">
        <button onClick={() => exportCsv('receivables-summary.csv', rows, [
          { key: 'hoa_license', label: 'HOA' },
          { key: 'fiscal_year', label: 'FY' },
          { key: 'resident_count', label: 'RESIDENTS' },
          { key: 'required_annual', label: 'REQ ANNUAL' },
          { key: 'required_special', label: 'REQ SPECIAL' },
          { key: 'paid_annual_ytd', label: 'PAID ANNUAL' },
          { key: 'paid_special_ytd', label: 'PAID SPECIAL' },
          { key: 'total_ar', label: 'TOTAL AR' },
        ])}>EXPORT CSV</button>
        <button onClick={printView}>IMPRIMIR</button>
      </div>
      <table className="reports-table">
        <thead>
          <tr>
            <th>HOA</th>
            <th>FY Begins</th>
            <th>Residents</th>
            <th>Req Annual</th>
            <th>Req Special</th>
            <th>Paid Annual</th>
            <th>Paid Special</th>
            <th>Total AR</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.hoa_license}</td>
              <td>{r.fiscal_year ? String(r.fiscal_year).slice(0, 10) : '—'}</td>
              <td>{r.resident_count}</td>
              <td>${Number(r.required_annual || 0).toFixed(2)}</td>
              <td>${Number(r.required_special || 0).toFixed(2)}</td>
              <td>${Number(r.paid_annual_ytd || 0).toFixed(2)}</td>
              <td>${Number(r.paid_special_ytd || 0).toFixed(2)}</td>
              <td><strong>${Number(r.total_ar || 0).toFixed(2)}</strong></td>
            </tr>
          ))}
          {rows.length > 1 && (
            <tr style={{ background: '#fff176', fontWeight: 700 }}>
              <td colSpan={2}>GRAN TOTAL ({rows.length} HOAs)</td>
              <td>{rows.reduce((s, r) => s + Number(r.resident_count || 0), 0)}</td>
              <td>${rows.reduce((s, r) => s + Number(r.required_annual || 0), 0).toFixed(2)}</td>
              <td>${rows.reduce((s, r) => s + Number(r.required_special || 0), 0).toFixed(2)}</td>
              <td>${rows.reduce((s, r) => s + Number(r.paid_annual_ytd || 0), 0).toFixed(2)}</td>
              <td>${rows.reduce((s, r) => s + Number(r.paid_special_ytd || 0), 0).toFixed(2)}</td>
              <td>${Number(grand_total || 0).toFixed(2)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
