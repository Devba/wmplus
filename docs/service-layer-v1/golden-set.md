# AI Router — golden set (QA, 2026-09-28, revised 2026-09-30)

Each question: expected route + manually verifiable expectation in QA.
Expected `source`: `router-local` (classifier), `router-openrouter` (LLM),
`fallback`/`opencode` (legacy level 3, deprecated).

Input language: English or Spanish. **All output in English.**

## Q1+Q2 — account-history (ready)
- `how much does resident 010003 owe` (HOA 1) → `router-local` → `Balance Test RL-03: 300 (1 payments)`.
- Cross-HOA: same prompt with `X-HOA-ID: 4` → null balance, 0 payments (isolated).
- Historic `as_of` via `/api/svc/account-history?resident=010003&as_of=2026-01-01` → 0 payments.

## Q1 aggregate — hoa-ar-summary (ready)
- `how much do all residents owe` / HOA total → `HOA: N debtors, total X`.

## Q-residents — resident-count (ready, added 2026-09-30)
- `how many residents are there` / `cuantos residentes hay en total` (any HOA) → `router-local` → `HOA: N residents`.
- Direct: `/api/svc/resident-count` → `{ total, active }`.

## Q3 — outstanding-checks (ready)
- `outstanding checks` (HOA 1) → 2 checks, total 312.50.

## Q4 — period-diff (ready since ec54a09; was honest stub)
- `what changed between 2026-01-01 and 2026-06-30 compared to 2025-01-01 and 2025-06-30`
  → real diff over primitives (gl/vendor/checks), both windows resolved.

## Q5 — gl-transactions (ready)
- `GL 41700 transactions` (HOA 4) → 4 moves, net 12500 (= fixture).

## Q6 — violations (disabled)
- `residents with fines` → **403** + FL-dependent message. Never data.

## Q7 — vendor-invoices (ready)
- `invoices of vendor VEND-001` → vendor `VEND-001` (do not truncate token).

## Q8 — anomalies (ready since 5107a7a; was honest stub)
- `anything unusual or overdue` → real rules (high-balance / stale-check / unusual-gl with thresholds); overdue rule off pending FL.

## Unclassified (honest legacy cutoff)
- `residents of florida` → **422** (ad-hoc filter, outside v1 catalog).
- `how many residents live in Florida` / `how many residents live in Colorado` → **422**: `resident-count` takes no params (unfiltered totals only); filtered counts are outside v1.
- `how much does Sarah owe?` (name, no ID) → **422**: account-history needs a resident ID; a bare name must not fall back to the HOA aggregate.
- Free-form out-of-catalog questions → **422** with English examples. No free SQL on the server.

## Router rules
- Local does not classify → OpenRouter (prompt+catalog only) → null → legacy.
- The LLM never sees rows and never generates SQL. Q6 banned for the LLM too.
- Budget: local absorbs the repetitive; level 2 at ~$0.001/translation.
