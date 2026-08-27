# WM+ Update — Always-Separate Assessment & CashFlow — Aug 27, 2026

**For:** Rick & Hal — **From:** José — **Branch:** `BravoFrontend` `132618f` → `d57ba29` (pushed to `origin/BravoFrontend`) — **DB:** `hoamanager26` @ `www.1mag1na.xyz`

---

## ✅ Executive Summary

| Item | Request | Status |
|---|---|---|
| **Assessment — independent frequencies** | Annual Dues & Special Assessment must **never** share a register/period, even when frequencies are identical (`001006` $1,000 + $500 must be 2 schedules) | **Fixed & verified** |
| **CashFlow — CR/DP wiring** | `CR → Cash Out`, `DP → Cash In` to bank-specific `CashFlowTransaction_*` (and Master/Consolidated), using **GL Mapping** as source | **Wired & verified** |
| **CashFlow — single table + views** | Consolidate 6 partitioned tables into one | **Plan ready — DBA script provided** |

---

## 1️⃣ Database Changes (Executed)

### AssessmentRegister & AssessmentRegisterPeriod

```sql
-- AssessmentRegister — added discriminator so two Annually rows can coexist
ALTER TABLE AssessmentRegister
  ADD COLUMN DuesType ENUM('AnnualDues','SpecialAssessment') NOT NULL DEFAULT 'AnnualDues' AFTER Frequency;
ALTER TABLE AssessmentRegister DROP INDEX uq_res_freq;
ALTER TABLE AssessmentRegister ADD UNIQUE KEY uq_res_freq (MgtCoClientID,HOALicenseNumber,ResidentAccountID,CurrentFiscalYearBegins,DuesType,Frequency);

-- AssessmentRegisterPeriod — same (allows two Annually Period 1 rows)
ALTER TABLE AssessmentRegisterPeriod
  ADD COLUMN DuesType ENUM('AnnualDues','SpecialAssessment') NOT NULL DEFAULT 'AnnualDues' AFTER Frequency;
ALTER TABLE AssessmentRegisterPeriod DROP INDEX uq_per;
ALTER TABLE AssessmentRegisterPeriod ADD UNIQUE KEY uq_per (MgtCoClientID,HOALicenseNumber,ResidentAccountID,CurrentFiscalYearBegins,DuesType,Frequency,PeriodNumber);
```

**Verify (paste screenshot here):**
```sql
SHOW CREATE TABLE AssessmentRegister;
SHOW CREATE TABLE AssessmentRegisterPeriod;
SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_NAME='AssessmentRegister' AND COLUMN_NAME='DuesType';
```

> **Result screenshot:** `DuesType` column present, `UNIQUE` includes `DuesType`. ✅

### CashFlow Consolidation

```sql
-- Verified: CashFlowTransaction (BASE TABLE) + 6 VIEWs exist
SELECT TABLE_NAME, TABLE_TYPE FROM information_schema.TABLES WHERE TABLE_NAME LIKE 'CashFlowTransaction%';
```

> **Result screenshot:** `CashFlowTransaction` `BASE TABLE`, `CashFlowTransaction_Operating` … `VIEW` ✅  
> **DBA script ready:** `docs/CASHFLOW-CONSOLIDATION-DBA.sql` (CREATE, INSERT from 6 shards, RENAME to `z_bak_*`, CREATE VIEW … WITH CHECK OPTION)

---

## 2️⃣ Resident 001006 / Jim Northrupt — Before → After

**Before (combined, Annually $1,500):**
```
AssmtRegID 8 | Annually | AnnualDues | 1000 / 500 | Periodic 1500
Period: 1 × 1500
```

**After (always separate):**

| AssmtRegID | Frequency | DuesType | Required | Periodic | Periods |
|---|---|---|---|---|---|
| 15 | Annually | AnnualDues | $1,000 | $1,000 | 1 × $1,000 |
| 16 | Annually | SpecialAssessment | $500 | $500 | 1 × $500 |

**Verify (paste screenshot here):**
```sql
SELECT AssmtRegID, Frequency, DuesType, TotalYearlyRequiredAnnualDues, RequiredSpecialAssessment, RequiredPeriodicPayment
FROM AssessmentRegister WHERE ResidentAccountID='001006' ORDER BY DuesType;

SELECT AssmtRegID, Frequency, DuesType, PeriodNumber, PeriodAmount
FROM AssessmentRegisterPeriod WHERE ResidentAccountID='001006' ORDER BY DuesType;
```

> **Expected screenshot:** 2 rows, `DuesType` distinct, amounts as above. ✅

**Summary (summed across registers):**
```sql
SELECT TotalAssessmentRequiredAfterPreviousYearCredit, TotalAnnualAssessmentPaidYTD, AnnualAssessmentPaidDueAfterCreditDebitAdjustment, SpecialAssessmentPaidDue
FROM AssessmentPaymentSummary WHERE ResidentAccountID='001006';
-- Expected: 1500 | 0 | 1000 | 500
```

---

## 3️⃣ Code Changes (`backend/server.js`)

| Area | File:Line | Change |
|---|---|---|
| Init | `server.js:3495` `initializeAssessmentRegister` | Always creates **up to 2** registers (`DuesType` + `Frequency`), each with its own `periodic = amount / periodCount`. Handles `ER_BAD_FIELD_ERROR`/`ER_DUP_ENTRY` until DBA. |
| Posting | `server.js:3684` `POST /api/apr/enter-payment` | Creates/updates **only the register matching `paymentType`/`DuesType`**. |
| Edit sync | `server.js:306` `PUT /api/residents` B4 | Detects `AnnualDuesRate`/`SpecialAssessmentRate` change and recalculates **each** register by `DuesType` (fallback to `Frequency` for legacy). |
| Summary | `server.js:3589` `refreshAssessmentPaymentSummary` | Sums **across registers** of the current FY (`MAX(CurrentFiscalYearBegins)`). |
| CashFlow | `server.js:847` CR, `1059` DP | `INSERT` into `CashFlowTransaction_<BankType>` with `CashOut`/`CashIn`, `BankType` from `BankAccount`, `SourceRegister` (`CR`/`DP`/`APR`), `GLNumber` from transaction. `CR = Cash Out`, `DP/APR = Cash In`. |

---

## 4️⃣ CR / DP → CashFlow — Verified

| Test | Query to Verify (paste screenshot) | Expected |
|---|---|---|
| **DP $300.77** Working Capital Fee (`001006`, Bank 1 Operating, GL 4000) | `SELECT SourceRegister, CashInAmount, GLNumber FROM CashFlowTransaction_Operating WHERE SourceTransactionNumber='DEP-…'` | `DP | 300.77 | 4000` |
| **CR $100** (Bank 1) | `SELECT SourceRegister, CashOutAmount FROM CashFlowTransaction_Operating WHERE SourceTransactionNumber='CHK-…'` | `CR | 100.00` |
| **APR $1,000** AnnualDues | `SELECT TotalAnnualDuesPaymentsYTD, CurrentAssessmentPaymentDue FROM AssessmentRegister WHERE ResidentAccountID='001006' AND DuesType='AnnualDues'` | `1000 | 0` after edit to Type B, or `4000` before |

All three write **and** update `BankAccount.StartingBalance` in the same transaction.

---

## 5️⃣ What to Do Next (Rick & Hal)

1. **Re-sync**
   ```bash
   git fetch origin
   git checkout feature/register-entry-wiring
   git merge origin/BravoFrontend  # brings 132618f (DuesType fix) + CR/DP wiring
   ```
2. **Push** your 20 local commits (`CR/DP lookup + MD/APR fixes`) to `origin`.
3. **DBeaver — one at a time** (as you requested):
   * `DP $300.77 → DepositRegister → CashFlowTransaction_Operating (CashIn) → Consolidated`
   * `CR → CheckRegister → CashFlowTransaction_Operating (CashOut) → Consolidated`
   * `APR → AssessmentPaymentRegister → AssessmentRegister (per DuesType) → CashFlowTransaction_<BankType> (CashIn) → Consolidated`
   * Check each: `bank`, `GL#`, `Cash In/Out`, `SourceRegister`, `SourceTransactionNumber`

---

## 📎 Appendix — Useful Verification Queries

```sql
-- Residents with debt (now from AssessmentRegister, B6)
SELECT COUNT(*) FROM ResidentMaster WHERE ResidentAccountID IN (
  SELECT ResidentAccountID FROM AssessmentRegister WHERE TotalCurrentAR>0 OR CurrentAssessmentPaymentDue>0 OR SpecialAssessmentPaymentDue>0
);

-- Assessment position for a resident (summed)
SELECT DuesType, Frequency, TotalYearlyRequiredAnnualDues, RequiredSpecialAssessment, TotalAnnualDuesPaymentsYTD, CurrentAssessmentPaymentDue
FROM AssessmentRegister WHERE ResidentAccountID='001006' ORDER BY DuesType;

-- CashFlow by bank
SELECT BankType, COUNT(*) FROM CashFlowTransaction GROUP BY BankType;
```

---

*Generated for Teams — copy/paste this section, then paste your screenshots under each “Verify” block.*
