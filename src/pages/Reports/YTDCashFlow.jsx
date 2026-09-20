import { useEffect, useState } from 'react';
import { apiFetch } from '../../config/api';
import { exportCsv, printView } from '../../utils/exportCsv';
import './Reports.css';

// YTD Cash Flow Analysis: totales del año por banco y GL.
// Muestra totales por GL (cross-bank) + desglose por banco.
export default function YTDCashFlow() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [fiscalYear, setFiscalYear] = useState('2026');

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const d = await apiFetch(`/reports/ytd-cash-flow?fiscalYear=${fiscalYear}`);
        if (live) setData(d);
      } catch (e) {
        if (live) setError(e.message);
      }
    })();
    return () => { live = false; };
  }, [fiscalYear]);

  if (error) return <div className="reports-page"><div className="reports-error">{error}</div></div>;
  if (!data) return <div className="reports-page"><div className="reports-loading">Cargando…</div></div>;

  const { rows, totalsByGL, grand, fiscalYear: fy } = data;

  return (
    <div className="reports-page">
      <h2>YTD Cash Flow Analysis</h2>
      <p className="reports-sub">
        FY {fy} · {rows.length} lineas banco+GL · {totalsByGL.length} GLs unicos
      </p>
      <div className="reports-bar">
        <select value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)} className="reports-year-select">
          <option value="2026">2026</option>
          <option value="2025">2025</option>
        </select>
        <button onClick={() => exportCsv('ytd-cash-flow.csv', rows, [
          { key: 'bank_id', label: 'BANK ID' },
          { key: 'bank_name', label: 'BANK' },
          { key: 'bank_type', label: 'TYPE' },
          { key: 'gl_number', label: 'GL' },
          { key: 'cash_in', label: 'CASH IN' },
          { key: 'cash_out', label: 'CASH OUT' },
          { key: 'net', label: 'NET' },
        ])}>EXPORT CSV</button>
        <button onClick={printView}>IMPRIMIR</button>
      </div>

      <h3 className="reports-h3">Totales por GL (todos los bancos)</h3>
      <table className="reports-table">
        <thead>
          <tr>
            <th>GL</th>
            <th>Cash In</th>
            <th>Cash Out</th>
            <th>Net</th>
          </tr>
        </thead>
        <tbody>
          {totalsByGL.map((r, i) => (
            <tr key={i}>
              <td><strong>{r.gl_number}</strong></td>
              <td>${Number(r.cash_in || 0).toFixed(2)}</td>
              <td>${Number(r.cash_out || 0).toFixed(2)}</td>
              <td><strong style={{ color: r.net >= 0 ? '#15803d' : '#b91c1c' }}>${Number(r.net || 0).toFixed(2)}</strong></td>
            </tr>
          ))}
          <tr style={{ background: '#fff176', fontWeight: 700 }}>
            <td>GRAN TOTAL</td>
            <td>${Number(grand.cash_in || 0).toFixed(2)}</td>
            <td>${Number(grand.cash_out || 0).toFixed(2)}</td>
            <td><strong>${Number(grand.net || 0).toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>

      <h3 className="reports-h3">Desglose por banco ({rows.length} lineas)</h3>
      <table className="reports-table">
        <thead>
          <tr>
            <th>Bank ID</th>
            <th>Bank</th>
            <th>Type</th>
            <th>GL</th>
            <th>Cash In</th>
            <th>Cash Out</th>
            <th>Net</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.bank_id}</td>
              <td>{r.bank_name}</td>
              <td>{r.bank_type}</td>
              <td>{r.gl_number}</td>
              <td>${Number(r.cash_in || 0).toFixed(2)}</td>
              <td>${Number(r.cash_out || 0).toFixed(2)}</td>
              <td>${Number(r.net || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
