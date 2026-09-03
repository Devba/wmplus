# V6 Implemented — Illustrated Guide of What Was Done

**For Rick & Hal — English version — 5 new images**

**Status:** V6 Approved by Rick & Hal → **Implemented and verified end-to-end in production** (`hoamanager26`)
**Real test case:** Resident `001007`, historical void of `APR083126-12381556`, batch `BATCH-1788352625889-kkni3` COMPLETED

---

## Point 1 — DDL V6 created in production

**Analogy:** Before moving any money, we built the **4 new filing cabinets** where all historical-void information now lives.

- `AssessmentPaymentSource` — the **immutable** cabinet: stores what the operator originally entered (amount, whether it came from the SA or AD box). Never rewritten; only flips to `VOID`.
- `APRRecalculationBatch` — the **audit file** for every replay (with `MgtCoClientID`/`HOALicenseNumber` — HOA-client isolation).
- `ResidentCreditLedger` — the **credit notebook** with `EventDate` (original economic date, not the replay date) and `Status POSTED/SUPERSEDED`.
- `AssessmentPaymentRegister` — gained **lineage** columns: `SubmissionKey`, `RecalcBatchID`, `ReplacesAPRTransactionID`, `SupersededAt`.

![Point 1 — DDL V6 in production](../public/workflows/v6-impl-fig1-ddl_20260902.png)

---

## Point 2 — Deterministic backfill: 19 APR rows → 17 Source rows

**Analogy:** We copied the **original intent** of every historical payment into the immutable cabinet, grouping by exact `TransactionNumber` — like filing invoices by invoice number, **not by "similar date and amount"**.

- 19 physical rows in `AssessmentPaymentRegister` → **17 distinct business transactions** → **15 `POSTED` rows** in `AssessmentPaymentSource` (the remaining 2 were already `VOID` and intentionally excluded).
- Each `SubmissionKey = TransactionNumber` (1 to 1). The `resident+date+amount` heuristic is forbidden — anything that doesn't match exactly goes to manual review.

![Point 2 — Deterministic backfill](../public/workflows/v6-impl-fig2-backfill_20260902.png)

---

## Point 3 — F1–F4 fixes in the Void code

**Analogy:** The old void was like a teller who, when cancelling an invoice, refunded **only the first receipt** and also **crossed out calendar lines**. Fixed:

- **F1** — Before: reversed only `rows[0]`; now reverses **all rows** of the transaction (a `$500 SA + $100 AD` transaction reverses the full $600).
- **F2** — Before: decremented `PeriodAmount` (the obligation schedule); now the **schedule is never touched**.
- **F3** — Before: credit stayed inflated; now `ResidentCreditBalance` is **recomputed from the Ledger** (`POSTED` only, with tenant `MgtCo/HOA` — the detail Rick flagged).
- **F4** — Before: the whole CashFlow receipt was voided even when voiding only part; now **only the voided transaction's cash lines are voided**.

![Point 3 — F1-F4 fixes](../public/workflows/v6-impl-fig3-f1f4_20260902.png)

---

## Point 4 — Real historical void executed and verified (001007)

**Analogy:** We erased **the resident's entire fiscal-year book** and reprinted it from January, using the **bank that was effective on each date** — not today's bank.

**Real case:** Void of `APR083126-12381556` (2 rows: SA $264.23 + AD $36.54) on resident `001007`:

| Concept | BEFORE | AFTER |
|---|---|---|
| Annual Dues | 1000/1000 (due 0) | **965/1000 (due 35)** |
| Special Assessment | 500/500 (due 0) | **235.77/500 (due 264.23)** |
| Resident Credit | 1.54 | **0** |
| APR rows | 12 active | 12 `SUPERSEDED` + 10 re-`POSTED` |

- **F1 verified:** both rows of the voided transaction were `SUPERSEDED` — the reversal is complete.
- **F3 verified:** the old 1.54 credit correctly disappears — without the voided transaction's overflow, the $700 payment covers Annual Dues in full (700 vs 698.46+1.54 before).
- Batch `BATCH-1788352625889-kkni3` **COMPLETED** with tenant, 10 transactions replayed.

![Point 4 — Real historical void](../public/workflows/v6-impl-fig4-void-real_20260902.png)

---

## Point 5 — CashFlow per BankID: only the voided transaction's cash is voided

**Analogy:** 7 separate physical checkbooks (one per real bank). When voiding a payment, only the receipt **in the checkbook where that money landed** is crossed out — the other checkbooks never notice.

- 6 physical tables created: `CashFlow_BankID_101/201/301/401/451/501` (V6 transactional structure with `SubmissionKey`, `CashInAmount`, `RecalcBatchID`).
- **Rick's rule applied:** the replay **never re-posts CashFlow** — the money did not move again.
- Verified: CF for `12381556` (300.77) → `VoidFlag=Y`; CF for replayed `12441098` (700) → **untouched** (`VoidFlag=N`).
- Active cash per bank always equals the still-valid portion of the payment.

![Point 5 — CashFlow per BankID](../public/workflows/v6-impl-fig5-cashflow-bankid_20260902.png)

---

## Final state and next step

| Item | Status |
|---|---|
| DDL V6 in production | ✅ Created and verified |
| Deterministic backfill | ✅ 15 Source rows (2 VOID excluded on purpose) |
| F1-F4 fixes | ✅ In code and verified in a real test |
| Historical full-year void | ✅ Executed: batch COMPLETED, 10 transactions replayed |
| CashFlow per BankID | ✅ 6 tables provisioned + replay rule applied |
| **Next step** | **Controlled end-to-end testing by Rick & Hal** — we are ready when you are |

*Prepared by Jose — 2026-09-02 — V6 Implemented — 5 new images (meta/muse-image $0.01 each)*
