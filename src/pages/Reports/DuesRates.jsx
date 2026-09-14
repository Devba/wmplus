import { useEffect, useState } from 'react';
import { apiFetch } from '../../config/api';
import { exportCsv, printView } from '../../utils/exportCsv';
import './Reports.css';

// Tier 1: Dues Rates por HOA (reusa dues-programming, sin backend nuevo).
function rateRows(data, section) {
  const sec = data?.[section] || {};
  return Object.entries(sec.rates || {}).map(([rateType, v]) => ({
    section, rateType, current: v.currentRate, next: v.nextRate,
  }));
}

export default function DuesRates() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const d = await apiFetch('/settings/dues-programming');
        if (live) setData(d);
      } catch (e) {
        if (live) setError(e.message);
      }
    })();
    return () => { live = false; };
  }, []);

  if (error) return <div className="reports-page"><div className="reports-error">{error}</div></div>;
  if (!data) return <div className="reports-page"><div className="reports-loading">Cargando…</div></div>;

  const rows = [...rateRows(data, 'annualDues'), ...rateRows(data, 'specialAssessment')];

  return (
    <div className="reports-page">
      <h2>Dues Rates</h2>
      <p className="reports-sub">
        Por HOA activa · annual: {data.annualDues?.paymentFrequency} vto {data.annualDues?.dueDate}
      </p>
      <div className="reports-bar">
        <button onClick={() => exportCsv('dues-rates.csv', rows, [
          { key: 'section', label: 'SECTION' }, { key: 'rateType', label: 'RATE TYPE' },
          { key: 'current', label: 'CURRENT' }, { key: 'next', label: 'NEXT' },
        ])}>EXPORT CSV</button>
        <button onClick={printView}>IMPRIMIR</button>
      </div>
      <table className="reports-table">
        <thead><tr><th>SECTION</th><th>RATE TYPE</th><th>CURRENT</th><th>NEXT</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}><td>{r.section}</td><td>{r.rateType}</td><td>{r.current}</td><td>{r.next}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
