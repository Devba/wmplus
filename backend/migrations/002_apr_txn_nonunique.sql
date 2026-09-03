-- 002_apr_txn_nonunique.sql
-- Fix AssessmentPaymentRegister.TransactionNumber to allow multiple rows sharing one transaction number.
-- Context: 2026-08-29 DBeaver manual change: DROP UNIQUE uq_txn, ADD non-unique idx_apr_transaction_number.
-- Business rule: A single APR payment allocation (SA -> AD -> Credit) may intentionally create 2 rows
-- (e.g., SpecialAssessment row + AnnualDues overflow row) sharing one TransactionNumber (APRmmddyy-HHMMSSff).
-- The UNIQUE constraint prevented this; it must be a normal index.
-- This migration makes the manual DBeaver change permanent and idempotent.
-- Requires ALTER privilege (admin/DBA on www.1mag1na.xyz); hoamanager26_dev already patched via DBeaver + this script's logic.

-- Drop UNIQUE if it still exists (hoamanager26_dev already has it dropped; hoamanager26 already patched)
SET @has_uq := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'AssessmentPaymentRegister' AND INDEX_NAME = 'uq_txn');
SET @sql := IF(@has_uq > 0, 'ALTER TABLE AssessmentPaymentRegister DROP INDEX uq_txn', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Create non-unique index if missing (both DBs should have idx_apr_transaction_number after this)
SET @has_idx := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'AssessmentPaymentRegister' AND INDEX_NAME = 'idx_apr_transaction_number');
SET @sql2 := IF(@has_idx = 0, 'ALTER TABLE AssessmentPaymentRegister ADD INDEX idx_apr_transaction_number (TransactionNumber)', 'SELECT 1');
PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

-- Verify
-- SHOW CREATE TABLE AssessmentPaymentRegister; -- should show KEY idx_apr_transaction_number (TransactionNumber), no UNIQUE uq_txn
-- SHOW INDEX FROM AssessmentPaymentRegister;
