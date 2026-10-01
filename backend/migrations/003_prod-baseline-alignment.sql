-- ============================================================================
-- 003_prod-baseline-alignment.sql — service-layer baseline
-- Aligns a pre-baseline database (prod or a local copy) with the
-- feature/service-layer schema. Verified drift prod<->dev (2026-10-01):
--   1) 8 tables missing HOALicenseNumber (varchar(32) NULL, no default)
--   2) YRLY_AssmtRegister (old) vs Annual_AssmtRegister (new): identical
--      35 cols, pure rename. NO web code reads either name (checked).
--
-- HOW TO RUN (never blind on prod):
--   1. Full backup first + verify it restores.
--   2. Rehearse on a CLONE, then run here in a maintenance window.
--   3. Set @HOA_LICENSE to this database's HOA before running
--      (prod = single HOA 'HOA-FL-2024-001').
--   4. The RENAME step needs Rick's OK (only step that can break a
--      legacy reader). Everything else is additive and rollback-free.
-- ROLLBACK:
--   - ADD COLUMN/BACKFILL: no rollback needed (nullable column, app
--     keeps working; to undo: ALTER TABLE t DROP COLUMN HOALicenseNumber).
--   - RENAME: RENAME TABLE Annual_AssmtRegister TO YRLY_AssmtRegister
--     (or restore the backup).
-- ============================================================================

-- 0) Which HOA lives in this database? (expect exactly 1 row for prod)
SELECT HOALicenseNumber AS hoa, COUNT(*) AS residents
  FROM ResidentMaster GROUP BY HOALicenseNumber;

-- 1) Add the scope column where missing (idempotent, instant: NULL, no default).
ALTER TABLE BankAccount   ADD COLUMN IF NOT EXISTS HOALicenseNumber varchar(32) NULL;
ALTER TABLE GLAccounts    ADD COLUMN IF NOT EXISTS HOALicenseNumber varchar(32) NULL;
ALTER TABLE FinesConfig   ADD COLUMN IF NOT EXISTS HOALicenseNumber varchar(32) NULL;
ALTER TABLE FineTypesList ADD COLUMN IF NOT EXISTS HOALicenseNumber varchar(32) NULL;
ALTER TABLE DuesRates     ADD COLUMN IF NOT EXISTS HOALicenseNumber varchar(32) NULL;
ALTER TABLE LetterRules   ADD COLUMN IF NOT EXISTS HOALicenseNumber varchar(32) NULL;
ALTER TABLE SystemSettings ADD COLUMN IF NOT EXISTS HOALicenseNumber varchar(32) NULL;
ALTER TABLE TimingSchedule ADD COLUMN IF NOT EXISTS HOALicenseNumber varchar(32) NULL;

-- 2) Backfill (replace 'HOA-FL-2024-001' with @HOA_LICENSE of THIS database).
--    Service-layer scope filters (WHERE HOALicenseNumber = ?) return NOTHING
--    while these stay NULL — do not skip this step.
UPDATE BankAccount    SET HOALicenseNumber = 'HOA-FL-2024-001' WHERE HOALicenseNumber IS NULL;
UPDATE GLAccounts     SET HOALicenseNumber = 'HOA-FL-2024-001' WHERE HOALicenseNumber IS NULL;
UPDATE FinesConfig    SET HOALicenseNumber = 'HOA-FL-2024-001' WHERE HOALicenseNumber IS NULL;
UPDATE FineTypesList  SET HOALicenseNumber = 'HOA-FL-2024-001' WHERE HOALicenseNumber IS NULL;
UPDATE DuesRates      SET HOALicenseNumber = 'HOA-FL-2024-001' WHERE HOALicenseNumber IS NULL;
UPDATE LetterRules    SET HOALicenseNumber = 'HOA-FL-2024-001' WHERE HOALicenseNumber IS NULL;
UPDATE SystemSettings SET HOALicenseNumber = 'HOA-FL-2024-001' WHERE HOALicenseNumber IS NULL;
UPDATE TimingSchedule SET HOALicenseNumber = 'HOA-FL-2024-001' WHERE HOALicenseNumber IS NULL;

-- 3) Rename (REQUIRES Rick's OK — only potentially-breaking step).
--    Tables are structurally identical (35/35 cols, same types).
-- RENAME TABLE YRLY_AssmtRegister TO Annual_AssmtRegister;

-- 4) Verify (all must return 0 / expected counts).
SELECT 'nulls_left' AS check_name, COUNT(*) AS n FROM (
  SELECT HOALicenseNumber FROM BankAccount    WHERE HOALicenseNumber IS NULL UNION ALL
  SELECT HOALicenseNumber FROM GLAccounts     WHERE HOALicenseNumber IS NULL UNION ALL
  SELECT HOALicenseNumber FROM FinesConfig    WHERE HOALicenseNumber IS NULL UNION ALL
  SELECT HOALicenseNumber FROM FineTypesList  WHERE HOALicenseNumber IS NULL UNION ALL
  SELECT HOALicenseNumber FROM DuesRates      WHERE HOALicenseNumber IS NULL UNION ALL
  SELECT HOALicenseNumber FROM LetterRules   WHERE HOALicenseNumber IS NULL UNION ALL
  SELECT HOALicenseNumber FROM SystemSettings WHERE HOALicenseNumber IS NULL UNION ALL
  SELECT HOALicenseNumber FROM TimingSchedule WHERE HOALicenseNumber IS NULL
) u;
SELECT table_name FROM information_schema.tables
 WHERE table_schema = DATABASE() AND table_name = 'Annual_AssmtRegister';
