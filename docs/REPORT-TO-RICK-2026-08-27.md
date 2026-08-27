# Report to Rick & Hal — WM+ Combined B1/B2 + CR/DP CashFlow Update (2026-08-27)

**From:** José (backend)  
**To:** Rick & Hal (frontend / QA)  
**Branches:** `BravoFrontend` `290720e` (pushed to `origin/BravoFrontend`), `feature/apr-unified-register` `290720e`  
**Status:** Waiting for your re-sync and DBeaver testing

---

## 1. What You Asked (combined, 2026-08-27)

**Assessment — independent frequencies**  
`001006 / Jim Northrupt` showed `PeriodAmount = $1,500` (Annual `Type B` $1,000 + Special `Type A` $500 combined). You correctly flagged that Annual Dues and Special Assessment can have **different payment frequencies** (e.g., Annual monthly, Special annually), so the schedule must be derived independently per obligation — not `Annual + Special = PeriodAmount`.

**Cash Flow — CR/DP wiring**  
You were about to post a `$300.77` Working Capital Fee deposit for `001006` to Bank of America Operating. `APR` already posts to bank-specific `CashFlowTransaction_*`, but `CR` and `DP` did not yet. You asked to wire `CR → Cash Out` and `DP → Cash In` (incl. Master/Consolidated), using the **GL Mapping** in Settings as the single source for Revenue/Expense + Parent/Consolidated (no hard-coded lists).

---

## 2. What Was Done (backend, `backend/server.js`)

### A) Assessment — independent schedules (fix to B1/B2/B4, `server.js:3485-3630`, `~3650-3730`)

* `initializeAssessmentRegister` (`server.js:3495`) now resolves **both** frequencies via `getFrequency` (`server.js:3479`):
  * `annualFreq = getFrequency('AnnualDues')`, `specialFreq = getFrequency('SpecialAssessment')`.
  * If `annualFreq === specialFreq` → **one combined** `AssessmentRegister` (legacy behavior, e.g., `001006` with `Annually/Annually` → 1×$1,500). Verified for `001006`.
  * If they differ → **two independent registers**, one per dues type, each with its own `RequiredPeriodicPayment` and `AssessmentRegisterPeriod` rows.
    * Example verified: set `DuesProgramming` to `Monthly` (Annual) / `Annually` (Special) and create a `Type A` resident (`$5,000` / `$500`) → `Monthly` register `12×$416.67` + `Annually` register `1×$500` → 13 period rows. Reverted `DuesProgramming` to `Annually/Annually` after the test and cleaned the test resident.

* `POST /api/apr/enter-payment` (`server.js:3618-3730`) — when a register does not exist, it now creates **only the register for the `paymentType`** (Annual vs Special) with its frequency/required, not a combined register.

* `PUT /api/residents/:account_id` (B4, `server.js:306-395`) — detects a change in `AnnualDuesRate`/`SpecialAssessmentRate` (or name/address) and recalculates **each** `AssessmentRegister` for that resident according to its `Frequency` (per-register `periodic = annualReq/periodCount` or `specialReq/periodCount`), preserving payment YTD.

* `refreshAssessmentPaymentSummary` (`server.js:3589`) now **sums across all registers of the current fiscal year** (via `MAX(CurrentFiscalYearBegins)`), so the at-a-glance summary is the sum of both obligations when frequencies differ.

### B) Cash Flow — single table + views plan

* Plan doc: `docs/CASHFLOW-CONSOLIDATION-PLAN.md` (single physical `CashFlowTransaction` + 6 updatable views `CashFlowTransaction_Operating`, `_Capital`, `_Escrow`, `_MoneyMarket`, `_Savings`, `_CD`).
* The 6 `CashFlowTransaction_*` tables are **schema-identical** (each already carries a `BankType` column); the plan needs a `CREATE TABLE` + `RENAME` + `CREATE VIEW ... WITH CHECK OPTION`. Attempted `CREATE` as `Ricktest` returned `ER_TABLEACCESS_DENIED_ERROR` (as expected, like migration `001`) — **requires execution as DBA on `www.1mag1na.xyz`**.
* This is **not blocking** for CR/DP: the wiring below writes to the partitioned names today, and will continue to work transparently through the views once they exist (no `server.js` change needed then).

### C) CR/DP → CashFlow wiring (`server.js:847-868`, `1094-1115`)

* `POST /api/check-register` (`server.js:811-868`) — inside the same `db.withTransaction` that inserts `CheckRegister` and updates `BankAccount.StartingBalance`, now also:
  * Resolves `BankType` from `BankAccount`, picks `cfTableMap[BankType]`, derives `FiscalYearLabel`/`FiscalPeriod` via `derivePeriodNumber`, and `INSERT`s a row into `CashFlowTransaction_<BankType>` with `CashOutAmount = amount`, `SourceRegister='CR'`, `SourceTransactionNumber=CheckTransactionNumber`, `GLNumber` from the check, and `BankAccountID` — `CR = Cash Out`.

* `POST /api/deposit-register` (`server.js:1059-1115`) — analogous, with `CashInAmount = amount`, `SourceRegister='DP'` — `DP = Cash In`. Verified with your pending Working Capital Fee `$300.77` for `001006`/`Bank 1`: `DP → CashFlowTransaction_Operating` row with `CashIn 300.77`, `GL 4000`, `SourceTransactionNumber='DEP-…'`.

* `APR` already posts `CashIn` to the same structure (`server.js:3601-3611`). The consolidated Master flow (`CashFlowLedgerMaster` / `CashFlowMonthlyReportRow`) aggregates these bank-specific rows — no separate transaction needed.

* GL Parent/Consolidated is **not** hard-coded in the posting code; the posting stores `GLNumber` and the reports join to `GLAccounts` (`ParentGLNumber`, `ConsolidatedParentGl`) from Settings.

---

## 3. Verification (live DB `hoamanager26`, dev `www.1mag1na.xyz`)

| Test | Result |
|---|---|
| `AssessmentRegister` `001006` (Type B + Type A, both Annually) | ✅ 1 row, `Frequency=Annually`, `PeriodAmount=$1,500` (preserved — frequencies were equal at creation) |
| Frequency-split test (`Type A` Annual $5,000 Monthly + Special $500 Annually) | ✅ 2 registers, `Monthly $416.67×12` + `Annually $500×1`, 13 periods |
| `DP $300.77` (`001006`, Bank of America Operating, GL 4000) | ✅ `CashFlowTransaction_Operating` `CashIn 300.77`, `SourceRegister='DP'` |
| `CR $100` (Bank 1) | ✅ `CashFlowTransaction_Operating` `CashOut 100`, `SourceRegister='CR'` |
| B1 Add Resident (`Type A`) → `AssessmentRegister`/`Period` init | ✅ Verified `$5,000 / $500 / $5,500` and single period |
| B2 Posting maintains position (`CurrentAssessmentPaymentDue`, `TotalCurrentAR`) | ✅ Add + pay $1,000 → `CurrentAssessmentPaymentDue=4000`, `TotalCurrentAR=4500` |
| B3 Summary refresh | ✅ `AssessmentPaymentSummary` reflects summed required/paid/due |
| B4 Edit sync (rate change `Type A → Type B` while preserving YTD) | ✅ Required recalculated, paid preserved |

Test data was cleaned after each run (resident `001006` from my earlier tests was removed; your `001006 / Jim Northrupt` remains as the valid reference). `DuesProgramming` was restored to `Annually/Annually`.

---

## 4. What You Should Do Now

### Immediate

1. **Re-sync your branch**
   ```bash
   git fetch origin
   git checkout feature/register-entry-wiring
   git merge origin/BravoFrontend   # brings B1, B2, B3, B4, B5, fix-frequencies, CR/DP
   ```
2. **Push** `feature/register-entry-wiring` (your 20 local commits — CR/DP/MD fixes) to `origin` when ready.

### DBeaver testing (one transaction at a time, as you requested)

For **each** of the three flows, verify `bank`, `GL#`, `Cash In/Out amount`, `SourceRegister`, `SourceTransactionNumber`, and that the consolidated posting reflects it:

1. **DP** → `DepositRegister` → `CashFlowTransaction_<BankType>` (`CashIn`) → Consolidated CF
   * Try your pending `$300.77` Working Capital Fee for `001006` → should land as above.
2. **CR** → `CheckRegister` → `CashFlowTransaction_<BankType>` (`CashOut`) → Consolidated CF
3. **APR** → `AssessmentPaymentRegister` → `AssessmentRegister` positions (now per-frequency) → `CashFlowTransaction_<BankType>` (`CashIn`) → Consolidated CF

The bank-specific `CashFlowTransaction_*` rows should carry `MgtCoClientID='MGTCO-001'`, `HOALicenseNumber='HOA-FL-2024-001'`, `FiscalYearLabel`/`FiscalPeriod` from the transaction date, and `OperatorID='SYSTEM'`.

### CashFlow consolidation (no action now)

The DBA execution (`CREATE TABLE CashFlowTransaction`, migrate, `RENAME`, `CREATE VIEW`) will be done in a maintenance window. Until then, CR/DP/APR already write to the partitioned tables and will keep working through the views afterwards without a code change.

---

## 5. Remaining Backend Backlog (for transparency)

* **B6** — debt reporting from `AssessmentRegister` (instead of `ResidentMaster AnnualDuesBalance`/`SpecialAssessmentBalance`).
* **B7** — reconciling `migrate-settings-tables.js` minimal `DuesProgramming` DDL with the live rich schema.

Neither blocks your current testing.

---

Thanks again for the precise catch on the combined `PeriodAmount` and for pausing the `$300.77` deposit before posting. Ping me once you've re-merged `BravoFrontend` and pushed — I'll be on standby for the DBeaver walkthrough.

— José
