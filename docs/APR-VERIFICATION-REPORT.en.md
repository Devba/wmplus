# WM+ APR — Assessment Table Architecture: Verification & Confirmed Decisions

**Date:** 2026-08-27
**Scope:** Verify the intended APR/assessment table architecture (frontend doc "APR / Assessment Table Relationship") against the live MySQL schema (`hoamanager26`) and the Node.js backend at `/home/alvaro/wmplus/backend` (`server.js` ~3,639 lines, `db.js`, `migrations/`). Read-only verification.

## 1. Executive Summary

All seven tables exist in the live database with schemas that match the *intended* roles. However, the **application code has only partially implemented** the intended architecture:

- `ResidentMaster` is still treated as the financial source of truth (amounts are written there on Add/Edit, and debt reporting reads its legacy balance columns).
- `AssessmentRegister` / `AssessmentRegisterPeriod` are only touched during payment posting and are **never initialized when a resident is created**; their "required/position" columns are never populated.
- `AssessmentPaymentRegister` is correctly implemented as the transactional APR source of truth.
- `AssessmentPaymentSummary` exists in the DB but has **zero code references** — it is never maintained.
- `DuesRates` is disconnected from the financial flow (amounts are hand-entered into `ResidentMaster` instead).

The live DB is healthier than the migration scripts suggest: `DuesProgramming` already has the **rich** schema (`AssessmentFrequency`, `DuesType`, `MgtCoClientID`, etc.), so the APR frequency lookup works. The minimal `DuesProgramming` DDL in `migrate-settings-tables.js` is stale vs. the live schema (drift risk, not a current runtime bug).

**Data state:** `ResidentMaster` = 1,010 rows (895 with legacy paid/balance values, 1,004 with synthetic `#xxx` address suffixes). The four new tables are all **empty (0 rows)**.

## 2. Per-Table Verification

| Table | Intended role | Verdict |
|---|---|---|
| ResidentMaster | Identity + assigned rate *types*; NOT transaction source | ⚠️ Schema supports role, but code writes financials there |
| DuesProgramming | HOA-wide schedule (frequency, due-dates) | ✅ Rich schema present and consistent with code |
| DuesRates | $ amounts by section / rate type | ⚠️ Correct table, disconnected from flow |
| AssessmentRegister | Resident FY position (required, YTD, due, balances) | ⚠️ Schema correct; only payment totals accumulated, never position |
| AssessmentRegisterPeriod | Per-period schedule (Frequency, PeriodNumber, PeriodAmount) | ⚠️ Correct shape; only populated via posting |
| AssessmentPaymentRegister | Transactional APR source of truth | ✅ Implemented and **transactional** |
| AssessmentPaymentSummary | At-a-glance resident summary (EM+ style) | ❌ Exists in DB, **zero code references** |

**Code behavior (file:line):** Add Resident `server.js:175-285` writes only `ResidentMaster`. APR Posting `server.js:3431-3555` is transactional (`db.withTransaction`, `db.js:36-49`) and updates `AssessmentPaymentRegister` + `AssessmentRegister` (payment totals only) + `AssessmentRegisterPeriod` + `CashFlow` + `ResidentMaster.ResidentCreditBalance`; it does **not** touch `AssessmentPaymentSummary`. Edit Resident `server.js:287-359` rewrites `ResidentMaster` legacy columns only, with no conditional register sync. Debt reporting reads `AnnualDuesBalance`/`SpecialAssessmentBalance` from `ResidentMaster` (`server.js:1300,1309,1384,1490`) — columns the app never maintains (seed-only).

## 3. Confirmed Architecture Decisions (José's confirmation)

**1. Responsibility split (7 tables):** ✅ **Confirmed.** Maintain as documented: `ResidentMaster` = identity + assigned rate-types (NOT transaction source); `DuesProgramming` = HOA schedule; `DuesRates` = $ amounts by section/rate-type; `AssessmentRegister` = resident position; `AssessmentRegisterPeriod` = per-period schedule; `AssessmentPaymentRegister` = transactional APR source of truth; `AssessmentPaymentSummary` = summary view. *Code action:* stop writing financial amounts into `ResidentMaster` (B1/B5).

**2. Does Add Resident initialize Register + Period?** ✅ **YES.** The server creates `AssessmentRegister` + the required `AssessmentRegisterPeriod` rows for the FY when inserting `ResidentMaster` (implement B1).

**3. Which Main Directory edits trigger sync?** ✅ Changes to `AnnualDuesRate` / `SpecialAssessmentRate` → controlled recalculation of `AssessmentRegister`/`Period`, **preserving** `AssessmentPaymentRegister` history (no delete/recreate). Implement B4.

**4. How is `AssessmentPaymentSummary` maintained?** ✅ **Transactionally within APR posting** (updated inside the same transaction as `AssessmentPaymentRegister` → `AssessmentRegister` → `CashFlow`). Implement B3.

**5. Retain `ResidentMaster` and clean in DBeaver?** ✅ **YES** — retain IDs/names/lookup; clean legacy amounts and `#` suffixes (see field list below), with a prior backup. Hal & Rick perform the cleanup.

**6. (implied) Do Hal & Rick perform the DBeaver cleanup?** ✅ YES, after reviewing the exact reset fields.

## 4. DBeaver Cleanup Scope — Field List (for Hal & Rick)

**Step 0 — Backup:** Export `ResidentMaster` (full table) before any update.

**Reset / NULL these legacy financial columns in `ResidentMaster`** (they move to `AssessmentRegister` under the new design):
`AnnualDues`, `AnnualDuesPaidYTD`, `AnnualDuesBalance`, `SpecialAssessmentDues`, `SpecialAssessmentPaidYTD`, `SpecialAssessmentBalance`, `FinesFeesBalance`, `PriorYearCredit`, `ResidentCreditBalance` (→ `0.00`), `NextYearAnnualDues`, `NextYearSpecialAssmtDues`, `NextYearAnnualDuesRate`, `NextYearSpecialAssmtRate`.

**KEEP** (used as assigned rate-type codes): `AnnualDuesRate`, `SpecialAssessmentRate`.

**Address / billing:** remove synthetic `#xxx` suffixes from `ResidenceAddress` (1,004 of 1,010 rows); standardize `BillingAddress` for dev testing.

**New tables:** `AssessmentRegister`, `AssessmentRegisterPeriod`, `AssessmentPaymentRegister`, `AssessmentPaymentSummary` are already empty (0 rows) — nothing to clear.

Exact reset fields to be reviewed before execution.

## 5. Code Change Backlog (for dev team)

- **B1 — Resident init:** On `POST /api/residents`, after `ResidentMaster` insert, derive amounts from `DuesProgramming` + `DuesRates` and create `AssessmentRegister` + required `AssessmentRegisterPeriod` rows for the FY.
- **B2 — Position columns:** Populate the "required/position" columns of `AssessmentRegister` (not just payment YTD totals).
- **B3 — Summary:** Implement `AssessmentPaymentSummary` maintenance (transactional at posting).
- **B4 — Edit sync:** In `PUT /api/residents`, detect `AnnualDuesRate`/`SpecialAssessmentRate` changes and recalculate `AssessmentRegister`/`Period`, preserving `AssessmentPaymentRegister` history.
- **B5 — Rate derivation:** Use `DuesRates` to derive amounts instead of hand-entering into `ResidentMaster`.
- **B6 — Debt source:** Report debt from `AssessmentRegister` (or maintained summary) instead of stale `ResidentMaster` balance columns.
- **B7 — Migration hygiene:** Reconcile `DuesProgramming` DDL in `migrate-settings-tables.js` (minimal) with the live rich schema; document the actual DDL used.

## 6. Instruction to Rick (frontend/dev)

> Rick: sync your branch — you are 19 commits behind `BravoFrontend` and do not have APR Phase 1 or OCR. Run `git merge BravoFrontend` into `feature/register-entry-wiring` before continuing.
>
> APR architecture **confirmed by José** (above). Summary for building UI:
> - Add Resident will automatically create `AssessmentRegister` + `AssessmentRegisterPeriod`.
> - APR posting is transactional and maintains `AssessmentPaymentSummary`.
> - Only rate-type changes on resident edit trigger recalculation (preserving history).
> - We will clean `ResidentMaster` in DBeaver (Hal & Rick) before assessment init; the four new tables are already empty.
>
> Do not build against the current VPS: APR is not yet deployed there; use `BravoFrontend` locally (`node server.js`) for testing.

## 7. Risks / Discrepancies

- **Migration drift:** `migrate-settings-tables.js` would build a minimal `DuesProgramming`; the live DB has the rich schema. Not a bug today, but a fresh environment could break the APR frequency lookup (`server.js:3424`).
- **Stale debt data:** Debt reporting depends on `ResidentMaster` balances the app never writes — only seed. Until B1/B2/B6, "who owes" is meaningless.
- **Partial register:** `AssessmentRegister` accumulates payments but never holds the "required" side, so `TotalCurrentAR` is a payment sum, not an AR balance.
- **Summary gap:** `AssessmentPaymentSummary` exists but is orphaned — the management at-a-glance view is unavailable.
- **Rick 19 commits behind** `BravoFrontend` → conflict risk and risk of testing against old code.
