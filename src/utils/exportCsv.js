// Utilidad Tier 1: exportar arreglos de objetos a CSV (nativo, sin dependencias).
// Uso: exportCsv('residentes.csv', filas, [{ key: 'acctNo', label: 'ACCT#' }, ...])
export function exportCsv(filename, rows, columns) {
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = columns.map((c) => esc(c.label || c.key)).join(',');
  const body = (rows || []).map((r) => columns.map((c) => esc(r[c.key])).join(','));
  const blob = new Blob([[head, ...body].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 500);
}

// Impresión de la vista actual (respeta print.css global).
export function printView() {
  window.print();
}
