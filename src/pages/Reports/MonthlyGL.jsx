import { useEffect, useState } from 'react';
import { apiFetch } from '../../config/api';
import { exportCsv, printView } from '../../utils/exportCsv';
import './Reports.css';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Monthly GL Report: GL con columnas Ene-Dic + Total para un FY (todos los bancos).
export default function MonthlyGL() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [fiscalYear, setFiscalYear] = useState('2026');

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const d = await apiFetch(`/reports/monthly-gl?fiscalYear=${fiscalYear}`);
        if (live) setData(d);
      } catch (e) {
        if (live) setError(e.message);
      }
    })();
    return () => { live = false; };
  }, [fiscalYear]);

  if (error) return <div className="reports-page"><div className="reports-error">{error}</div></div>;
  if (!data) return <div className="reports-page"><div className="reports-loading">Cargando…</div></div>;

  const { rows, monthTotals, grandTotal, fiscalYear: fy } = data;

  // CSV con columnas mensuales
  const csvRows = rows.map((r) => ({
    gl: r.gl_number,
    jan: r.m1, feb: r.m2, mar: r.m3, apr: r.m4, may: r.m5, jun: r.m6,
    jul: r.m7, aug: r.m8, sep: r.m9, oct: r.m10, nov: r.m11, dec: r.m12,
    total: r.total,
  }));

  return (
    <div className="reports-page">
      <h2>Monthly General Ledger Report</h2>
      <p className="reports-sub">
        FY {fy} · {rows.length} GLs · gran total ${Number(grandTotal || 0).toFixed(2)}
      </p>
      <div className="reports-bar">
        <select value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)} className="reports-year-select">
          <option value="2026">2026</option>
          <option value="2025">2025</option>
        </select>
        <button onClick={() => exportCsv('monthly-gl.csv', csvRows, [
          { key: 'gl', label: 'GL' },
          { key: 'jan', label: 'JAN' }, { key: 'feb', label: 'FEB' }, { key: 'mar', label: 'MAR' },
          { key: 'apr', label: 'APR' }, { key: 'may', label: 'MAY' }, { key: 'jun', label: 'JUN' },
          { key: 'jul', label: 'JUL' }, { key: 'aug', label: 'AUG' }, { key: 'sep', label: 'SEP' },
          { key: 'oct', label: 'OCT' }, { key: 'nov', label: 'NOV' }, { key: 'dec', label: 'DEC' },
          { key: 'total', label: 'TOTAL' },
        ])}>EXPORT CSV</button>
        <button onClick={printView}>IMPRIMIR</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="reports-table" style={{ minWidth: 900 }}>
          <thead>
            <tr>
              <th>GL</th>
              {MONTH_NAMES.map((m) => <th key={m}>{m}</th>)}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.gl_number}>
                <td><strong>{r.gl_number}</strong></td>
                {MONTH_NAMES.map((_, i) => {
                  const v = r['m' + (i + 1)];
                  return (
                    <td key={i} style={{ color: v === 0 ? '#999' : v > 0 ? '#15803d' : '#b91c1c' }}>
                      {v === 0 ? '—' : `$${Number(v).toFixed(2)}`}
                    </td>
                  );
                })}
                <td><strong>${Number(r.total || 0).toFixed(2)}</strong></td>
              </tr>
            ))}
            {rows.length > 0 && (
              <tr style={{ background: '#fff176', fontWeight: 700 }}>
                <td>TOTAL MES</td>
                {monthTotals.map((v, i) => (
                  <td key={i}>${Number(v).toFixed(2)}</td>
                ))}
                <td><strong>${Number(grandTotal || 0).toFixed(2)}</strong></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
