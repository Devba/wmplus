/* ===========================================================
   SERVICE LAYER v1 — function registry (Track A).
   Contrato congelado: 7 entradas (Q1..Q8 menos Q6-bloqueada).
   - ready: calcula de verdad contra tablas existentes.
   - stub: valida parametros + devuelve resolved windows (honesto,
     sin inventar numeros). Q4/Q8 hasta implementacion completa.
   - disabled: Q6 espera definiciones FL de Rick/Hal.
   Todas exigen HOA concreta (nada de cross-HOA hasta regla expresa).
   Lecturas por readOnlyPool (doble blindaje con wm_reader).
   =========================================================== */

const db = require('../db');

const ro = () => db.readOnlyPool || db;

function tenantOf(ctx) {
  return {
    client_id: ctx.clientId || null,
    license_number: ctx.licenseNumber || null
  };
}

function lineage(table, filter, count) {
  return [{ table, filter, rows: count }];
}

/* Q1+Q2 — una sola funcion autoritativa: saldo + pagos que lo produjeron. */
async function accountHistory(ctx, deps) {
  const { resident, asOf, licenseNumber, clientId } = ctx;
  if (!resident) throw Object.assign(new Error('Parametro resident requerido'), { status: 400 });

  const rdb = ro();
  const [balRows] = await rdb.query(
    `SELECT ar.ResidentAccountID AS account_id,
            rm.FirstName AS first_name, rm.LastName AS last_name,
            rm.DisplayName AS display_name,
            ar.TotalYearlyRequiredAnnualDues AS yearly_required,
            ar.TotalAnnualDuesPaymentsYTD AS paid_ytd,
            ar.AssessmentPaidBalanceDue AS balance_due,
            ar.CurrentAssessmentPaymentDue AS current_due,
            ar.TotalCurrentAR AS total_ar,
            ar.CurrentFiscalYearBegins AS fiscal_year_begins
       FROM AssessmentRegister ar
       LEFT JOIN ResidentMaster rm
         ON rm.ResidentAccountID = ar.ResidentAccountID
        AND rm.HOALicenseNumber = ar.HOALicenseNumber
      WHERE ar.ResidentAccountID = ?
        AND ar.HOALicenseNumber = ?
        AND (ar.ActiveFlag IS NULL OR ar.ActiveFlag != 'N')
      LIMIT 1`,
    [resident, licenseNumber]
  );

  const [payRows] = await rdb.query(
    `SELECT TransactionNumber AS txn, PaymentDate AS date,
            PaymentType AS type, AnnualDuesPayment AS annual,
            SpecialAssessmentPayment AS special, CreditAmount AS credit,
            TotalAmount AS total, BankAccountID AS bank,
            GLNumber AS gl, Status AS status,
            CurrentFiscalYearBegins AS fy_begins,
            TimeStampCreated AS created_utc
       FROM AssessmentPaymentRegister
      WHERE ResidentAccountID = ?
        AND HOALicenseNumber = ?
        AND PaymentDate <= ?
        AND (DeletedFlag IS NULL OR DeletedFlag != 'Y')
      ORDER BY PaymentDate DESC, APRTransactionID DESC
      LIMIT 500`,
    [resident, licenseNumber, asOf]
  );

  const b = balRows[0] || null;
  const payTotal = payRows.reduce((s, r) => s + Number(r.total || 0), 0);
  return {
    success: true,
    function: 'getResidentAccountHistory',
    tenant: tenantOf(ctx),
    params_resolved: { resident, as_of: asOf },
    summary: {
      balance_due: b ? Number(b.balance_due || 0) : null,
      total_ar: b ? Number(b.total_ar || 0) : null,
      payments_count: payRows.length,
      payments_total: payTotal
    },
    result: { balance: b, payments: payRows },
    lineage: [
      ...lineage('AssessmentRegister', `resident=${resident}`, b ? 1 : 0),
      ...lineage('AssessmentPaymentRegister', `resident=${resident} date<=${asOf}`, payRows.length)
    ],
    filters_applied: { resident, as_of: asOf, license_number: licenseNumber }
  };
}

/* Q3 — cheques pendientes (outstanding) a traves de as_of. */
async function outstandingChecks(ctx) {
  const { asOf, licenseNumber } = ctx;
  const [rows] = await ro().query(
    `SELECT CheckTransactionNumber AS txn, CheckNumber AS check_no,
            VendorResidentID AS payee, Amount AS amount,
            GLNumber AS gl, BankAccount AS bank,
            DateCheckIssued AS issued, DateCheckCleared AS cleared,
            Status AS status
       FROM CheckRegister
      WHERE HOALicenseNumber = ?
        AND DateCheckIssued IS NOT NULL
        AND DateCheckIssued <= ?
        AND (DateCheckCleared IS NULL OR DateCheckCleared > ?)
        AND (Status IS NULL OR Status NOT IN ('Cleared', 'Voided', 'VOID'))
        AND (DeletedFlag IS NULL OR DeletedFlag != 'Y')
      ORDER BY DateCheckIssued ASC
      LIMIT 1000`,
    [licenseNumber, asOf, asOf]
  );
  const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0);
  return {
    success: true,
    function: 'getOutstandingChecks',
    tenant: tenantOf(ctx),
    params_resolved: { as_of: asOf },
    summary: { count: rows.length, total },
    result: rows,
    lineage: lineage('CheckRegister', `issued<=${asOf} AND (cleared IS NULL OR cleared>${asOf})`, rows.length),
    filters_applied: { as_of: asOf, license_number: licenseNumber }
  };
}

/* Q4 — diff real entre dos periodos, componiendo primitivas cerradas.
   subject gl: compara count/net de gl-transactions en ambas ventanas.
   subject checks|vendor: compara snapshots a fin de cada ventana.
   Sin SQL nuevo: reutiliza run() de las hermanas. */
async function periodDiff(ctx, deps) {
  const { resolveFiscalWindow } = deps;
  const { licenseNumber } = ctx;
  const w1 = await resolveFiscalWindow(ro(), licenseNumber, {
    fy: ctx.fy || null, from: ctx.from || null, to: ctx.to || null
  });
  const w2 = await resolveFiscalWindow(ro(), licenseNumber, {
    fy: ctx.compare_fy || null, from: ctx.compare_from || null, to: ctx.compare_to || null
  });
  const subject = ctx.subject || (ctx.gl ? 'gl' : ctx.vendor ? 'vendor' : 'checks');
  const sub = { ...ctx };
  let a, b, basis;
  if (subject === 'gl') {
    if (!ctx.gl) throw Object.assign(new Error('period-diff gl requiere parametro gl'), { status: 400 });
    a = await FUNCTIONS['gl-transactions'].run({ ...sub, from: w1.startDate, to: w1.endDate, fy: null }, deps);
    b = await FUNCTIONS['gl-transactions'].run({ ...sub, from: w2.startDate, to: w2.endDate, fy: null }, deps);
    basis = { metric: 'net', a: a.summary.net, b: b.summary.net };
  } else if (subject === 'vendor') {
    if (!ctx.vendor) throw Object.assign(new Error('period-diff vendor requiere parametro vendor'), { status: 400 });
    a = await FUNCTIONS['vendor-invoices'].run({ ...sub, asOf: w1.endDate }, deps);
    b = await FUNCTIONS['vendor-invoices'].run({ ...sub, asOf: w2.endDate }, deps);
    basis = { metric: 'invoices_total', a: a.summary.invoices_total, b: b.summary.invoices_total };
  } else {
    a = await FUNCTIONS['outstanding-checks'].run({ ...sub, asOf: w1.endDate }, deps);
    b = await FUNCTIONS['outstanding-checks'].run({ ...sub, asOf: w2.endDate }, deps);
    basis = { metric: 'total', a: a.summary.total, b: b.summary.total };
  }
  const delta = Number(basis.a || 0) - Number(basis.b || 0);
  const pct = Number(basis.b || 0) !== 0 ? (delta / Number(basis.b)) * 100 : null;
  return {
    success: true,
    function: 'getPeriodDiff',
    tenant: tenantOf(ctx),
    params_resolved: { subject, period: w1, compare_period: w2 },
    summary: { subject, metric: basis.metric, period_value: basis.a, compare_value: basis.b, delta, pct },
    result: { period: { window: w1, summary: a.summary }, compare_period: { window: w2, summary: b.summary } },
    lineage: [...a.lineage, ...b.lineage],
    filters_applied: { subject, license_number: licenseNumber }
  };
}

/* Q5 — transacciones por GL# en ventana (todos los bancos del ledger). */
async function glTransactions(ctx, deps) {
  const { resolveFiscalWindow } = deps;
  const { licenseNumber } = ctx;
  const gl = String(ctx.gl || '').trim();
  if (!gl) throw Object.assign(new Error('Parametro gl requerido'), { status: 400 });
  const win = await resolveFiscalWindow(ro(), licenseNumber, {
    fy: ctx.fy || null, from: ctx.from || null, to: ctx.to || null
  });
  const [banks] = await ro().query(
    `SELECT BankID FROM BankAccount WHERE ActiveFlag = 'Y' ORDER BY BankID`
  );
  const rows = [];
  for (const b of banks) {
    const table = `CashFlow_BankID_${b.BankID}`;
    try {
      const [r] = await ro().query(
        `SELECT TransactionDate AS date, GLNumber AS gl,
                CashInAmount AS cash_in, CashOutAmount AS cash_out,
                SourceRegister AS source, SourceTransactionNumber AS source_txn,
                BankAccountID AS bank_account
           FROM ${table}
          WHERE BankAccountID IS NOT NULL
            AND GLNumber = ?
            AND TransactionDate >= ?
            AND TransactionDate <= ?
            AND HOALicenseNumber = ?
            AND (VoidFlag IS NULL OR VoidFlag != 'Y')
            AND (DeletedFlag IS NULL OR DeletedFlag != 'Y')
          ORDER BY TransactionDate ASC
          LIMIT 2000`,
        [gl, win.startDate, win.endDate, licenseNumber]
      );
      for (const x of r) rows.push({ bank: b.BankID, ...x });
    } catch (e) {
      if (e.code !== 'ER_NO_SUCH_TABLE') throw e;
    }
  }
  rows.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const net = rows.reduce((s, r) => s + Number(r.cash_in || 0) - Number(r.cash_out || 0), 0);
  return {
    success: true,
    function: 'getGLTransactions',
    tenant: tenantOf(ctx),
    params_resolved: { gl, window: win },
    summary: { count: rows.length, net },
    result: rows,
    lineage: lineage('CashFlow_BankID_*', `gl=${gl} ${win.startDate}..${win.endDate}`, rows.length),
    filters_applied: { gl, ...win, license_number: licenseNumber }
  };
}

/* Q7 — facturas por vendor (campos invoice del CheckRegister). */
async function vendorInvoices(ctx) {
  const { asOf, licenseNumber } = ctx;
  const vendor = String(ctx.vendor || '').trim();
  if (!vendor) throw Object.assign(new Error('Parametro vendor requerido'), { status: 400 });
  const like = `%${vendor.replace(/[%_]/g, '')}%`;
  const [rows] = await ro().query(
    `SELECT CheckTransactionNumber AS txn, CheckNumber AS check_no,
            VendorResidentID AS vendor, VendorInvoiceNumber AS invoice_no,
            VendorInvoiceDate AS invoice_date, VendorInvoiceAmount AS invoice_amount,
            Amount AS check_amount, DateCheckIssued AS issued,
            DateCheckCleared AS cleared, Status AS status
       FROM CheckRegister
      WHERE HOALicenseNumber = ?
        AND (VendorResidentID LIKE ? OR VendorInvoiceNumber LIKE ?)
        AND (DateCheckIssued IS NULL OR DateCheckIssued <= ?)
        AND (DeletedFlag IS NULL OR DeletedFlag != 'Y')
      ORDER BY VendorInvoiceDate DESC, DateCheckIssued DESC
      LIMIT 1000`,
    [licenseNumber, like, like, asOf]
  );
  const total = rows.reduce((s, r) => s + Number(r.invoice_amount || 0), 0);
  return {
    success: true,
    function: 'getVendorInvoices',
    tenant: tenantOf(ctx),
    params_resolved: { vendor, as_of: asOf },
    summary: { count: rows.length, invoices_total: total },
    result: rows,
    lineage: lineage('CheckRegister', `vendor LIKE ${vendor}`, rows.length),
    filters_applied: { vendor, as_of: asOf, license_number: licenseNumber }
  };
}

/* Q6 — DISABLED: espera definiciones FL. */
async function outstandingViolations(ctx) {
  return {
    success: false,
    function: 'getOutstandingViolations',
    status: 'blocked',
    message: 'FL-dependiente: espera definiciones de Manage Violations (Rick/Hal). Sin implementacion anticipada.',
    tenant: tenantOf(ctx),
    params_resolved: {},
    summary: null,
    result: null,
    lineage: [],
    filters_applied: { license_number: ctx.licenseNumber }
  };
}

/* Q8 — STUB honesto: marco de anomalias pendiente; overdue sigue a FL. */
async function anomalies(ctx) {
  return {
    success: true,
    function: 'getAnomalies',
    status: 'not_yet_implemented',
    message: 'Marco de anomalias en construccion (Track A). Overdue de assessments seguira reglas FL al definirse.',
    tenant: tenantOf(ctx),
    params_resolved: { as_of: ctx.asOf },
    summary: null,
    result: null,
    lineage: [],
    filters_applied: { as_of: ctx.asOf, license_number: ctx.licenseNumber }
  };
}

const FUNCTIONS = {
  'account-history': { key: 'account-history', fn: 'getResidentAccountHistory', questions: ['Q1', 'Q2'], status: 'ready', run: accountHistory },
  'outstanding-checks': { key: 'outstanding-checks', fn: 'getOutstandingChecks', questions: ['Q3'], status: 'ready', run: outstandingChecks },
  'period-diff': { key: 'period-diff', fn: 'getPeriodDiff', questions: ['Q4'], status: 'ready', run: periodDiff },
  'gl-transactions': { key: 'gl-transactions', fn: 'getGLTransactions', questions: ['Q5'], status: 'ready', run: glTransactions },
  'vendor-invoices': { key: 'vendor-invoices', fn: 'getVendorInvoices', questions: ['Q7'], status: 'ready', run: vendorInvoices },
  'violations': { key: 'violations', fn: 'getOutstandingViolations', questions: ['Q6'], status: 'disabled', run: outstandingViolations },
  'anomalies': { key: 'anomalies', fn: 'getAnomalies', questions: ['Q8'], status: 'stub', run: anomalies }
};

module.exports = { FUNCTIONS };
