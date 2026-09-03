# Jose Decisions — Points 3, 5 and 6 (Rick 11-point review)

**Date:** 2026-09-01 — **Decided by:** Jose — **Status:** DECIDED for v5 — **Basis:** BravoFrontend ffdea5c, 7-bank/5-bank, Separate per BankID No Views

---

## Point 3 — (SubmissionKey, BankAccountID) does not identify an individual Cash Flow line

**Decision:** **Natural composite key `(TransactionNumber, BankAccountID, GLNumber, PaymentType)`**, no new `AllocationLineID`.

**Why:**
- It is the exact grouping already used by `server.js:4790-4792` `key = transactionNumber|bankAccountId|glNumber|paymentType` for split-bank posting — we reuse the same key for supersede, no extra column.
- Covers Rick's case: SA $500 + $100 AD overflow sharing same `SubmissionKey+TransactionNumber+BankAccountID` but different `PaymentType/GL` → two distinct lines by `GL/PaymentType`.
- `AllocationLineID` would be redundant and require migration/backfill for 17 dev rows and all future rows; the composite is already stable and FK-free. If a collision appears later (same GL and PaymentType duplicated in same bank/transaction, unlikely), we add `AllocationLineID` as an evolution without breaking history — v5 leaves the door open.

**v5 implementation:**
- APR supersede: `WHERE TransactionNumber=? AND BankAccountID=? AND GLNumber=? AND PaymentType=? AND Status='POSTED'`
- CashFlow supersede: `WHERE SourceTransactionNumber=? AND BankAccountID=? AND GLNumber=? AND PaymentType IN (...)` — total per bank still `SUM per (SubmissionKey, BankAccountID)` but identification is per composite line; `LIMIT 1` removed.

---

## Point 5 — Old-bank 45-day rule / technical assistance

**Decision:** **Automatic block of the normal Void if it touches an old bank → 409 Requires Technical Assistance**, no auto-transfer.

**v5 rule:**
- For each affected APR row, resolve `effectiveBankToday = DuesProgramming.DepositBankAccountID` for its `DuesType` today.
- If `row.BankAccountID != effectiveBankToday` **and** there exists `AssessmentBankAssignmentHistory` with `OldBankAccountID = row.BankAccountID` and `EffectiveDate <= row.PaymentDate + 45d` (or `row.PaymentDate < EffectiveDate` and `EffectiveDate <= CURRENT_DATE`), then:
  ```json
  409 { error: "Transaction resides in former assessment bank — requires technical assistance",
        details: "Money remains in old bank; transfer only after 45-day clearing as separate bank-transfer transaction. Contact support.",
        batchStatus: "PENDING_TECH" }
  ```
- No `UPDATE CashFlow` or `INSERT` is performed automatically; an `APRRecalculationBatch` with `Status='PENDING_TECH'` is created for audit and support performs the manual post-45d transfer (separate transaction, not a receipt rewrite).

**Why:** respects “money remains in old bank for 45 days” and “modification in old bank requires assistance” without creating automatic money-movement logic.

---

## Point 6 — Immutable identifier for CashFlow_BankID_XXX and provisioning

**Decision:** **`BankAccountID` (internal INT PK, e.g., 101) is the immutable identifier** for `CashFlow_BankID_XXX`, **not** the visible `BankID` string (e.g., "101" editable) and not a recyclable ID.

**Why:**
- `BankAccountID` is `AUTO_INCREMENT` never reused, FK-safe, not editable via UI; `BankID` string (`BankAccount.BankID` "101") is a visible designation a user could edit and would break `resolveCashFlowTable`.
- Physical table will be `CashFlow_BankID_101` where `101 = BankAccountID` (or `CashFlow_BankAccount_101` — we choose numeric `BankID` equal to `BankAccountID` for simplicity; mapping `BankAccountID → BankID` is documented).

**Automatic provisioning:**
- On `BankAccount` creation in *Banking Settings*, trigger/procedure `provisionCashFlowStructure(BankAccountID)` does `CREATE TABLE CashFlow_BankID_<BankAccountID> LIKE CashFlow_Bank_Template` + `INSERT INTO CashFlowRowControl (BankAccountID, ...)` per `BankID`.
- `resolveCashFlowTable(BankAccountID)` → `CashFlow_BankID_<BankAccountID>` (today maps to 6 interim for transition, tomorrow to per-BankID physical). History remains agnostic.

---

**Next:** update `002` DDL v5, `apr-void-procedimiento-final` v5 and regenerate PDFs with high contrast, and publish at `http://154.12.226.83:8899/` as `v5-decisions-3-5-6`.
