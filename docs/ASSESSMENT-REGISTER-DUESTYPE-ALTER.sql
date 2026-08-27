-- ASSESSMENT REGISTER — ALWAYS SEPARATE Annual/Special (Rick correction 2026-08-27)
-- Target: www.1mag1na.xyz / hoamanager26
-- Requires: ALTER TABLE (ADD COLUMN, DROP/CREATE INDEX), like migration 001 — run as admin/DBA.
-- Run in maintenance window after backing up AssessmentRegister + AssessmentRegisterPeriod.

-- Step 1 — Add DuesType discriminator (allows two registers with same Frequency)
ALTER TABLE AssessmentRegister
  ADD COLUMN DuesType ENUM('AnnualDues','SpecialAssessment') NOT NULL DEFAULT 'AnnualDues' AFTER Frequency;

-- Backfill existing rows (combined registers have no DuesType yet — keep as AnnualDues for now;
-- the correction for 001006 below will split it. For other residents, DuesType will be set correctly on next edit/init.)

-- Step 2 — Replace the UNIQUE key to include DuesType (so two Annually rows can coexist)
ALTER TABLE AssessmentRegister DROP INDEX uq_res_freq;
ALTER TABLE AssessmentRegister ADD UNIQUE KEY uq_res_freq (MgtCoClientID, HOALicenseNumber, ResidentAccountID, CurrentFiscalYearBegins, DuesType, Frequency);

-- Verification
-- SHOW CREATE TABLE AssessmentRegister;
-- SELECT ResidentAccountID, Frequency, DuesType, TotalYearlyRequiredAnnualDues, RequiredSpecialAssessment FROM AssessmentRegister WHERE ResidentAccountID='001006';

-- Step 3 — Correct 001006 / Jim Northrupt (currently 1 combined Annually $1,500) → 2 separate Annually $1,000 + $500
-- Run only after Steps 1-2 succeed. Delete the combined row and recreate the two separate ones via the new logic.
-- Option A: let the next PUT /api/residents edit trigger B4 sync (which will now split), or run this manual correction:
-- DELETE FROM AssessmentRegisterPeriod WHERE ResidentAccountID='001006';
-- DELETE FROM AssessmentRegister WHERE ResidentAccountID='001006';
-- The next POST /api/residents edit or a manual call to initializeAssessmentRegister will recreate:
--   AnnualDues Annually $1,000 (12? no, Annually 1×$1,000)
--   SpecialAssessment Annually $500 (1×$500)
-- For now, if you want to keep 001006 as-is until Rick tests, skip this step — the code's fallback (combined) will keep it working until you run the deletes.

-- Rollback (if needed)
-- ALTER TABLE AssessmentRegister DROP INDEX uq_res_freq;
-- ALTER TABLE AssessmentRegister ADD UNIQUE KEY uq_res_freq (MgtCoClientID, HOALicenseNumber, ResidentAccountID, CurrentFiscalYearBegins, Frequency);
-- ALTER TABLE AssessmentRegister DROP COLUMN DuesType;
