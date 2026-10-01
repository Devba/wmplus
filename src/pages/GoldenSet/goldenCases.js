/* Golden-set cases: structural assertions only (no magic numbers).
   Each case runs POST /api/ai-filter with its own X-HOA-ID and checks:
   - status (200 / 403 / 422)
   - routed function key (when routed)
   - router source (router-local / router-openrouter)
   - summary shape (keys present, values NOT asserted)
   Exact counts/totals are deliberately NOT asserted: test data changes.
   A 403 on a 200-expected case means "skipped (out of scope for this user)". */

const CASES = [
  {
    id: 'q1', section: 'Q1+Q2 account-history', hoaId: '1', hoaLabel: 'HOA1',
    question: 'how much does resident 010003 owe',
    expect: { status: 200, fn: 'account-history', source: 'router-local', summaryKeys: ['balance_due', 'total_ar', 'payments_count'] }
  },
  {
    id: 'q1agg', section: 'Q1 aggregate hoa-ar-summary', hoaId: '9', hoaLabel: 'HOA7',
    question: 'how much do all residents owe',
    expect: { status: 200, fn: 'hoa-ar-summary', source: 'router-local', summaryKeys: ['debtors', 'total_ar'] }
  },
  {
    id: 'qres', section: 'Q-residents resident-count', hoaId: '9', hoaLabel: 'HOA7',
    question: 'how many residents are there?',
    expect: { status: 200, fn: 'resident-count', source: 'router-local', summaryKeys: ['total', 'active'] }
  },
  {
    id: 'q3', section: 'Q3 outstanding-checks', hoaId: '9', hoaLabel: 'HOA7',
    question: 'outstanding checks',
    expect: { status: 200, fn: 'outstanding-checks', source: 'router-local', summaryKeys: ['count', 'total'] }
  },
  {
    id: 'q4', section: 'Q4 period-diff', hoaId: '9', hoaLabel: 'HOA7',
    question: 'what changed between 2026-01-01 and 2026-06-30 compared with 2025-01-01 and 2025-06-30',
    expect: { status: 200, fn: 'period-diff', source: 'router-local', summaryKeys: ['subject', 'metric'] }
  },
  {
    id: 'q5', section: 'Q5 gl-transactions', hoaId: '4', hoaLabel: 'HOA4',
    question: 'GL 41700 transactions',
    expect: { status: 200, fn: 'gl-transactions', source: 'router-local', summaryKeys: ['count', 'net'] }
  },
  {
    id: 'q6', section: 'Q6 violations (disabled)', hoaId: '9', hoaLabel: 'HOA7',
    question: 'residents with fines',
    expect: { status: 403 }
  },
  {
    id: 'q7', section: 'Q7 vendor-invoices', hoaId: '9', hoaLabel: 'HOA7',
    question: 'invoices of vendor VEND-001',
    expect: { status: 200, fn: 'vendor-invoices', source: 'router-local', summaryKeys: ['count', 'invoices_total'] }
  },
  {
    id: 'q8', section: 'Q8 anomalies', hoaId: '9', hoaLabel: 'HOA7',
    question: 'anything unusual or overdue',
    expect: { status: 200, fn: 'anomalies', source: 'router-local', summaryKeys: ['findings_count'] }
  },
  {
    id: 'q422a', section: 'Unclassified → 422', hoaId: '9', hoaLabel: 'HOA7',
    question: 'how many residents live in Florida',
    expect: { status: 422 }
  },
  {
    id: 'q422b', section: 'Unclassified → 422', hoaId: '9', hoaLabel: 'HOA7',
    question: 'residents of florida',
    expect: { status: 422 }
  },
  {
    id: 'q422c', section: 'Unclassified → 422', hoaId: '9', hoaLabel: 'HOA7',
    question: 'how much does Sarah owe?',
    expect: { status: 422 }
  }
];

export default CASES;
