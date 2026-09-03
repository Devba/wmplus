# Re: Historical APR Void / Replay — Review of your proposal

**To:** Rick  
**From:** Jose  
**Date:** 2026-09-01  
**Subject:** Historical APR Void / Replay — Answers to your 5 questions  
**Status:** **FOR DISCUSSION ONLY — No code or database changes until mutual approval**

Rick,

Thank you for the detailed proposal. I have reviewed it against the current schema (`AssessmentPaymentRegister`, `AssessmentRegister`, `AssessmentPaymentSummary`, `ResidentMaster`) and the live server code (`backend/server.js:3955-4621`, `4570-4621`). This review is read-only — no changes have been made.

**Overall assessment: the architecture is sound and I approve the direction**, subject to the four amendments and four findings detailed below. The companion summary and diagram are stored in `~/wmplus/docs/apr-void-historico-propuesta-rick.md`.

![Proposed Historical APR Void — Void + Replay](/workflows/apr-void-replay_20260901-1830.png)
*Figure 1 — Proposed Void + Replay flow (7 steps, atomic transaction). File: `~/wmplus/docs/workflows/apr-void-replay_20260901-1830.png` / `~/wmplus/public/workflows/apr-void-replay_20260901-1830.png` — `meta/muse-image` $0.01.*

---

## 1. Answers to your five questions

### Q1 — Is `AssessmentPaymentSource` the best way to preserve original intent? **Yes.**

I tested whether intent could be derived from `AssessmentPaymentRegister` alone. It mostly can (sum of a transaction's rows = amount entered; presence of a `SpecialAssessment` row implies SA entry), but one case is ambiguous: an SA-field entry made when SA is already fully paid produces a single credit-only row with `PaymentType='AnnualDues'` — indistinguishable from a genuine Annual Dues entry. A Source table is therefore necessary, not just convenient.

**Amendments I recommend:**

- Add `GLNumber` and a `SubmissionKey` grouping the up to two transaction numbers one UF submission can create. Today `CashFlow` is keyed to only the first `TransactionNumber` (`server.js:4388-4417`), so voiding one of two txns from the same submission leaves the cash ledger ambiguous. A `SubmissionKey` on both Source and CashFlow resolves it.
- `UNIQUE(TransactionNumber)`, one Source row per business transaction number — consistent with your rule that a separately-entered Annual Dues amount keeps its own transaction number.
- Since replay re-uses the **same** transaction numbers from the **same** Source records, Source never needs superseding — only `Status='VOID'`. Keep it truly immutable (amount, entry type, payment date/reference never rewritten).

### Q2 — Supersede and replace vs. edit in place? **Supersede and replace — agreed.**

Your example is definitive: a later `$100` that was `$100 Resident Credit` can become `$100 Special Assessment` after an earlier void, and a payment that produced one row can later need two. In-place editing cannot handle a change in row count or type.

**Implementation note:** Use `Status` values `POSTED / SUPERSEDED / VOID` and keep `DeletedFlag='Y'` as "hidden." Several existing queries filter `WHERE TransactionNumber=? AND DeletedFlag!='Y'` (e.g., `server.js:4576`). After replay a transaction number will have both superseded and active rows — those filters must become `Status='POSTED'`, otherwise the replayed transaction cannot be locked or voided correctly.

### Q3 — Is `APRRecalculationBatchID` appropriate? **Yes, with a leaner shape.**

I recommend a small header table `APRRecalculationBatch` (`batch_id`, `resident`, `voided_transaction`, `operator`, `timestamp`, `reason='historical APR Void'`, `status`) plus two nullable columns on `AssessmentPaymentRegister`: `RecalcBatchID` and `ReplacesAPRRowID` for row-level lineage. That answers your audit question directly — *"Transaction X was voided, which required A, B, C, D to be replayed; these were the original allocations and these are the recalculated ones"* — without duplicating data in a heavy detail table. A normalized detail table is fine if you prefer it, but the lineage columns already give you the query.

### Q4 — Rebuild from "immediately before the Void" or another baseline? **Your baseline is workable; I recommend a stronger invariant.**

Positions (SA paid, AD paid, Credit) are pure functions of (charges in `AssessmentRegister`, active APR rows). The current void rewinds aggregates subtractively with `GREATEST(...,0)` clamps (`server.js:4583-4602`), which can silently mask errors.

**Recommendation:**

- **Do not rewind aggregates subtractively.** After replay, **recompute** all aggregates (`AssessmentRegister` YTD/due/Credit, `ResidentMaster.ResidentCreditBalance`, `AssessmentPaymentSummary`) directly from active APR rows. Self-healing, no drift.
- For the allocation replay itself, your sequential replay from the voided transaction onward is correct provided earlier transactions were never altered. Given a resident has only a handful of transactions, I recommend **replaying the full fiscal-year history from the start** — cost is trivial and it removes any dependence on baseline integrity. Either approach is defensible; I favor full-history for robustness.

### Q5 — Database integrity / concurrency? **Manageable with ordered locking.**

- **Lock order (to avoid deadlock):** within the replay transaction, lock in this sequence — resident's `AssessmentRegister` rows `FOR UPDATE` → all resident's APR rows `FOR UPDATE` → `ResidentMaster` row `FOR UPDATE`. `enter-payment` already locks `AssessmentRegister` first (`server.js:4077-4088`), so a concurrent payment for the same resident will block until replay commits — which is the desired serialization.
- Add a MySQL advisory lock `GET_LOCK('apr-replay:<ResidentAccountID>')` as a cheap second guard and reject a second concurrent void for the same resident.
- **Fiscal-year determinism:** replay must use each Source record's stored `CurrentFiscalYearBegins` / `PaymentDate` / `PeriodNumber`, never re-derive from today. Required amounts must come from the register's stored assigned amounts, not current `DuesRates`.
- **Idempotency:** dedupe on `BatchID` so a retried request cannot double-replay.
- `AssessmentPaymentSummary` is refreshed only once at the end, as you propose — agreed.

---

## 2. Findings from code review that affect the proposal

These do not change your design, but the historical replay builds on the void primitive, so they should be addressed alongside it:

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| **F1** | Current void reverses only `rows[0]` of the selected transaction | `server.js:4576-4592` — `SELECT ... WHERE TransactionNumber=?` then `txn = rows[0]`; aggregates use only that row | Multi-row transactions (e.g., `APR083126-12381556: $264.23 SA + $36.54 AD` in dev) would be under-reversed. Fix must be in scope for replay. |
| **F2** | `enter-payment` never touches `AssessmentRegisterPeriod` (schedule), but void decrements `PeriodAmount` | `server.js:4363-4364` vs `4589-4592` | Void corrupts schedule data. Historical path should leave Period untouched, like entry does. |
| **F3** | `ResidentMaster.ResidentCreditBalance` is incremented on entry but never reversed on void | `server.js:4351-4361` vs void path | Both latest-void and historical replay must include it in the position rebuild. |
| **F4** | CashFlow is one row per UF submission, keyed to the first `TransactionNumber` only | `server.js:4388-4417` | Voiding one of two txns from the same submission voids a CashFlow row whose amount includes the other live txn's cash. Define the rule (I suggest: void CashFlow only when all txns of its `SubmissionKey` are voided) and ensure replay never re-posts CashFlow — allocation only. |

---

## 3. Open questions for your confirmation

1. Confirm that **F1–F4 fixes** should be folded into this procedure's scope (I recommend landing the void-primitive fixes first, since replay depends on them).
2. **Full-history replay vs. minimal replay from voided transaction** — do you prefer the minimal replay you proposed or the full-year recomputation I recommend?
3. Is **Resident Credit** currently consumed by fines/AR (`CreditUsedForDuesAndViolationsYTD` is `0` everywhere today)? If that can happen, replay must preserve consumption events.
4. Confirm the **CashFlow rule for shared-submission voids** (F4).

---

## 4. Proposed next steps

1. You confirm Q1–Q5 amendments and the four open questions above.
2. We backfill `AssessmentPaymentSource` for existing history (17 rows in dev, fully derivable today) before go-live.
3. We land the void-primitive fixes (F1–F4), then the historical replay, all inside one DB transaction per your steps 4–12, with `AssessmentPaymentSummary` refresh only on success.

Again, **no server, React, or database changes will be made until we have mutual written approval** of the complete procedure.

Thank you for the thorough proposal — happy to walk through the diagram (Figure 1) together.

Best regards,  
**Jose**

---

*Attachments:* `apr-void-historico-propuesta-rick.md` (summary), `apr-void-replay_20260901-1830.png` (flow diagram). Second simulation image `apr-void-simulacion_20260901.png` available on request (Before/After with sample data, `meta/muse-image` $0.01, 314KB). Generations logged in `~/wmplus/docs/workflows/generations.jsonl`.*
