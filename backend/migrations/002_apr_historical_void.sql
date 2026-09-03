-- 002_apr_historical_void.sql — PROPOSAL ONLY (DISCUSSION ONLY, DO NOT EXECUTE UNTIL MUTUAL APPROVAL)
-- Final schema for Historical APR Void + Full-Year Replay — RECONCILED v6 (BravoFrontend + 7-bank/5-bank, 11-point review)
-- Business Rule: Separate physical CashFlow per BankID, No Views (accounting principle) — per Rick Architecture Update
-- Fixes F1-F4, Rick confirmations 2026-09-01 + 7-bank/5-bank separate CF & P&L per bank + market business rules + 11-point review §§1-11 reconciled
-- Author: Jose — for Hal & Rick review — RECONCILED v6 (BravoFrontend ffdea5c, 7 open items reconciled)
-- Date: 2026-09-01 — Status: PROPOSAL v6 — BravoFrontend pulled, split-bank verified (001006 $600 → $500 Capital/2 + $100 Operating/1), deterministic backfill, tenant-isolated, composite CF identity

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- ============================================================================
-- 1) AssessmentPaymentSource — immutable record of original payment intent
-- One row per APR business transaction number (UF submission can create 1-2 rows
-- sharing one SubmissionKey but with distinct TransactionNumbers).
-- RECONCILED 2026-09-01 BravoFrontend: SubmissionKey groups the originating
-- UF submission, but is NOT necessarily one physical CashFlow receipt.
-- One submission with SA $500 + overflow $100 AD now creates TWO physical
-- receipts: $500 → SA bank (Capital 2) and $100 → AD bank (Operating 1), both
-- sharing the same SubmissionKey and TransactionNumber APR090126-11074218.
-- Physical receipt is therefore per (SubmissionKey, BankAccountID), not per
-- SubmissionKey alone (Rick §5). Source stores intent (OriginalEntryType/
-- OriginalAmount/SubmissionKey); the authoritative destination BankAccountID
-- lives on each AssessmentPaymentRegister allocation row and CashFlow row
-- (server.js:4314-4380 getAssessmentBank + 4760-4830 split-bank posting).
-- Reconciling change from earlier proposal where SubmissionKey was assumed = 1 receipt.
-- ============================================================================
CREATE TABLE IF NOT EXISTS AssessmentPaymentSource (
  SourceID                  INT AUTO_INCREMENT PRIMARY KEY,
  TransactionNumber         VARCHAR(32)  NOT NULL,
  SubmissionKey             VARCHAR(36)  NOT NULL COMMENT 'Groups 1-2 business txns from one UF submission; physical receipt is per (SubmissionKey, BankAccountID) — one submission may create 2 receipts in different banks (BravoFrontend split-bank)',
  ResidentAccountID         VARCHAR(32)  NOT NULL,
  OriginalEntryType         ENUM('SpecialAssessment','AnnualDues') NOT NULL COMMENT 'Where user entered the amount; determines overflow rules',
  OriginalAmount            DECIMAL(10,2) NOT NULL COMMENT 'Amount as entered before allocation',
  PaymentDate               DATE         NOT NULL,
  BankAccountID             INT          NULL COMMENT 'Bank effective for the source intent at PaymentDate (from DuesProgramming/History); allocation rows hold authoritative destination per split SA→SA bank / overflow→AD bank — see server.js getAssessmentBank',

  GLNumber                  INT          NULL,
  ElectronicPaymentID       VARCHAR(64)  NULL,
  MgtCoClientID             VARCHAR(64)  NULL,
  HOALicenseNumber          VARCHAR(64)  NULL,
  CurrentFiscalYearBegins   DATE         NULL,
  Frequency                 VARCHAR(32)  NULL,
  PeriodNumber              TINYINT      NULL,
  OperatorID                VARCHAR(64)  NULL,
  Status                    ENUM('POSTED','VOID') NOT NULL DEFAULT 'POSTED' COMMENT 'Immutable except VOID on void',
  TimeStampCreated          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  TimeStampUpdated          DATETIME     NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source_txn (TransactionNumber),
  KEY idx_source_submission (SubmissionKey),
  KEY idx_source_resident_fy (ResidentAccountID, CurrentFiscalYearBegins),
  KEY idx_source_resident_date (ResidentAccountID, PaymentDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Immutable source of APR business payments; replay reads this, never APR rows';


-- ============================================================================
-- 2) APRRecalculationBatch — lean audit header for each historical replay
-- Detail lives in superseded/replacement APR rows (RecalcBatchID linkage).
-- ============================================================================
CREATE TABLE IF NOT EXISTS APRRecalculationBatch (
  BatchID                   VARCHAR(36)  NOT NULL PRIMARY KEY COMMENT 'UUID v4',
  ResidentAccountID         VARCHAR(32)  NOT NULL,
  VoidedTransactionNumber   VARCHAR(32)  NOT NULL,
  FiscalYearBegins          DATE         NOT NULL COMMENT 'FY of voided txn; replay rebuilds full FY from start',
  OperatorID                VARCHAR(64)  NOT NULL,
  Reason                    VARCHAR(128) NOT NULL DEFAULT 'historical APR Void',
  Status                    ENUM('COMPLETED','FAILED','IN_PROGRESS') NOT NULL DEFAULT 'IN_PROGRESS',
  ReplayedTransactionNumbers JSON         NULL COMMENT 'Ordered array of later business txn numbers replayed',
  ReplayedCount             INT          NOT NULL DEFAULT 0,
  TimeStampCreated          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  TimeStampCompleted        DATETIME     NULL,
  KEY idx_batch_resident_fy (ResidentAccountID, FiscalYearBegins),
  KEY idx_batch_voided (VoidedTransactionNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Audit header for historical APR Void+Replay; row detail via APR RecalcBatchID';


-- ============================================================================
-- 3) ResidentCreditLedger — separate table for credit creation & consumption
-- Implements point 5 (Hal& Rick 2026-09-01): preserve both sides of credit even
-- though consumption is currently zero. Replay must be able to reproduce it.
-- Payment overages create credits; later consumption events apply them.
-- This table is append-only; replay appends new consumption rows as needed.
-- ============================================================================
CREATE TABLE IF NOT EXISTS ResidentCreditLedger (
  LedgerID                  INT AUTO_INCREMENT PRIMARY KEY,
  ResidentAccountID         VARCHAR(32)  NOT NULL,
  BatchID                   VARCHAR(36)  NULL COMMENT 'NULL for original payment overages; set for replay-generated rows',
  EventDate                 DATE         NULL COMMENT 'DECIDED Punto 2: immutable economic date = PaymentDate of source, not replay TimeStamp',
  Status                    ENUM('POSTED','SUPERSEDED') NOT NULL DEFAULT 'POSTED' COMMENT 'DECIDED Punto 2: active vs superseded for replay; balance = SUM WHERE Status=POSTED',
  EventType                 ENUM('CREDIT_CREATED','CREDIT_CONSUMED') NOT NULL,
  Amount                    DECIMAL(10,2) NOT NULL COMMENT 'Positive for created, positive for consumed (signed via EventType)',
  BalanceAfter              DECIMAL(10,2) NOT NULL COMMENT 'Running credit balance after this event',
  AppliedTo                 VARCHAR(32)  NULL COMMENT 'For CONSUMED: AnnualDues | SpecialAssessment | Fines | etc.',
  ReferenceTransactionNumber VARCHAR(32) NULL COMMENT 'Source txn that created/consumed the credit',
  SubmissionKey             VARCHAR(36)  NULL,
  MgtCoClientID             VARCHAR(64)  NULL,
  HOALicenseNumber          VARCHAR(64)  NULL,
  CurrentFiscalYearBegins   DATE         NULL,
  OperatorID                VARCHAR(64)  NULL,
  TimeStampCreated          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  SupersededAt              DATETIME     NULL COMMENT 'DECIDED Punto 2: when superseded by replay',
  RecalcBatchID_ledger      VARCHAR(36)  NULL COMMENT 'DECIDED Punto 2: Batch that superseded this credit event',
  KEY idx_ledger_resident_fy (ResidentAccountID, CurrentFiscalYearBegins),
  KEY idx_ledger_resident_date (ResidentAccountID, EventDate),
  KEY idx_ledger_batch (BatchID),
  KEY idx_ledger_ref_txn (ReferenceTransactionNumber),
  KEY idx_ledger_status (Status),
  CONSTRAINT fk_ledger_batch FOREIGN KEY (BatchID) REFERENCES APRRecalculationBatch(BatchID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Append-only credit lifecycle: overages and consumptions; replay rebuilds from Source+APR';


-- ============================================================================
-- 4) Alter AssessmentPaymentRegister — add lineage + grouping for replay
-- Existing columns (from 001_apr_unified_register.sql):
--   APRTransactionID PK, TransactionNumber, ResidentAccountID, PaymentType,
--   PaymentDate, AnnualDuesPayment, SpecialAssessmentPayment, CreditAmount,
--   TotalAmount, BankAccountID, GLNumber, ElectronicPaymentID, Status,
--   DeletedFlag, MgtCoClientID, HOALicenseNumber, CurrentFiscalYearBegins,
--   Frequency, PeriodNumber, OperatorID, TimeStampCreated/Updated
-- New columns:
-- ============================================================================
ALTER TABLE AssessmentPaymentRegister
  ADD COLUMN IF NOT EXISTS SubmissionKey  VARCHAR(36) NULL COMMENT 'Groups 1-2 txns from one UF submission; NULL for pre-migration rows until backfill' AFTER TransactionNumber,
  ADD COLUMN IF NOT EXISTS RecalcBatchID  VARCHAR(36) NULL COMMENT 'Batch that superseded or created this row; NULL for original postings' AFTER Status,
  ADD COLUMN IF NOT EXISTS ReplacesAPRTransactionID INT NULL COMMENT 'For replacement rows: APRTransactionID of superseded row it replaces' AFTER RecalcBatchID,
  ADD COLUMN IF NOT EXISTS SupersededAt  DATETIME NULL COMMENT 'When row was marked SUPERSEDED' AFTER ReplacesAPRTransactionID,
  ADD INDEX IF NOT EXISTS idx_apr_submission (SubmissionKey),
  ADD INDEX IF NOT EXISTS idx_apr_recalc_batch (RecalcBatchID),
  ADD INDEX IF NOT EXISTS idx_apr_replaces (ReplacesAPRTransactionID);

-- Enforce Status values to include SUPERSEDED going forward (keep existing POSTED/VOID/VOID etc.)
-- MySQL ENUM alteration is done by modifying column; keep VARCHAR for flexibility:
-- No FK on RecalcBatchID to allow pre-migration NULLs; add later if desired:
-- ALTER TABLE AssessmentPaymentRegister ADD CONSTRAINT fk_apr_batch FOREIGN KEY (RecalcBatchID) REFERENCES APRRecalculationBatch(BatchID) ON DELETE SET NULL;

-- Ensure future queries filter Status='POSTED' for active allocations.
-- Example canonical view for active APR allocations:
-- CREATE OR REPLACE VIEW vActiveAPR AS
--   SELECT * FROM AssessmentPaymentRegister WHERE Status='POSTED' AND DeletedFlag='N';


-- ============================================================================
-- 5) CashFlow — Separate physical table per BankID, No Views (ACCOUNTING PRINCIPLE)
-- RECONCILED 2026-09-01 BravoFrontend split-bank + 7-bank client (separate CF & P&L per bank,
-- different GL#s and market increase/decrease per bank — Rick client 7 banks, 5 banks):
-- CashFlow is per physical receipt per (SubmissionKey, BankAccountID/BankID), not per
-- SubmissionKey alone (Rick §§4-5). A UF submission with SA $500→SA bank (BankID 201/Capital 2)
-- + $100→AD bank (BankID 101/Operating 1) creates TWO receipts in TWO physical tables
-- sharing one SubmissionKey and TransactionNumber (verified 001006 APR090126-11074218).
-- REVISED per Hal & Rick correction: voiding one of 2 txns sharing a SubmissionKey but in
-- DIFFERENT banks voids only that bank's receipt (e.g., void $500 → Capital $0 / Operating $100 stays);
-- if a single bank's receipt was $600 split as $500+$100 within same BankID, active must = SUM
-- remaining POSTED for (SubmissionKey, BankID), not keep $600. Preserve audit: supersede original
-- row, create replacement with adjusted amount; only when all txns of (key,bank) are VOID does
-- active become $0. Replay never re-posts extra CashFlow beyond replacement.
-- IMPLEMENTATION: Each actual BankID has its own physical table CashFlow_BankID_XXX
-- (e.g., CashFlow_BankID_101, CashFlow_BankID_201, ..._401) with CashFlowRowControl per BankID.
-- Interim 6-type tables (_Operating/_Capital/...) are TEMP and will be migrated to per-BankID tables.
-- No Views — separate books as required. Procedure resolves table by BankID:
--   resolveCashFlowTable(BankAccountID) → CashFlow_BankID_<BankID> (not a view).
-- ============================================================================
-- For each cfTable in ['CashFlowTransaction_Operating','CashFlowTransaction_Capital','CashFlowTransaction_Escrow','CashFlowTransaction_MoneyMarket','CashFlowTransaction_Savings','CashFlowTransaction_CD']:
--   ALTER TABLE <cfTable>
--     ADD COLUMN IF NOT EXISTS SubmissionKey VARCHAR(36) NULL COMMENT 'Groups CashFlow receipt for UF submission with 1-2 APR txns' AFTER SourceTransactionNumber,
--     ADD COLUMN IF NOT EXISTS SubmissionTxnCount TINYINT NULL DEFAULT 1 COMMENT 'How many APR business txns this receipt covers (1 or 2)',
--     ADD COLUMN IF NOT EXISTS ActiveCashInAmount DECIMAL(10,2) NULL COMMENT 'Active reconciled amount = SUM of POSTED Source OriginalAmounts for this SubmissionKey; NULL means equals CashInAmount' AFTER CashInAmount,
--     ADD COLUMN IF NOT EXISTS RecalcBatchID VARCHAR(36) NULL COMMENT 'Batch that superseded/replaced this CashFlow row' AFTER SubmissionKey,
--     ADD COLUMN IF NOT EXISTS SupersededAt DATETIME NULL AFTER RecalcBatchID,
--     ADD INDEX IF NOT EXISTS idx_cf_submission (SubmissionKey),
--     ADD INDEX IF NOT EXISTS idx_cf_submission_txn (SubmissionKey, SourceTransactionNumber);

-- Example (Operating):
-- ALTER TABLE CashFlowTransaction_Operating
--   ADD COLUMN IF NOT EXISTS SubmissionKey VARCHAR(36) NULL AFTER SourceTransactionNumber,
--   ADD COLUMN IF NOT EXISTS SubmissionTxnCount TINYINT NULL DEFAULT 1 AFTER SubmissionKey,
--   ADD COLUMN IF NOT EXISTS ActiveCashInAmount DECIMAL(10,2) NULL AFTER CashInAmount,
--   ADD COLUMN IF NOT EXISTS RecalcBatchID VARCHAR(36) NULL AFTER SubmissionKey,
--   ADD COLUMN IF NOT EXISTS SupersededAt DATETIME NULL AFTER RecalcBatchID,
--   ADD INDEX IF NOT EXISTS idx_cf_submission (SubmissionKey);


-- ============================================================================
-- 6) Backfill (to run once after DDL, before go-live) — RECONCILED §8 DETERMINISTIC
-- Rick §8: use exact TransactionNumber/SourceTransactionNumber where available; manual review for remainder, no heuristic.
-- ============================================================================
-- a) AssessmentPaymentSource backfill from existing AssessmentPaymentRegister — DETERMINISTIC:
--    For each distinct TransactionNumber (active rows only):
--      OriginalAmount = SUM(TotalAmount)  -- for SA txn with overflow, sum includes SA+AD rows sharing TransactionNumber
--      OriginalEntryType = 'SpecialAssessment' if EXISTS SA row in txn else 'AnnualDues'
--      SubmissionKey = TransactionNumber -- default 1-1; for UF submissions that created 2 txns with same cash receipt and exact same SourceTransactionNumber grouping, assign shared UUID ONLY if TransactionNumbers appear together in same CashFlow SourceTransactionNumber grouping (exact match), otherwise keep 1-1 and flag for manual review
--      -- HEURISTIC REMOVED: do NOT infer shared SubmissionKey from resident+date+operator same-second proximity.
--
-- b) AssessmentPaymentRegister.SubmissionKey backfill — DETERMINISTIC:
--    UPDATE AssessmentPaymentRegister r JOIN AssessmentPaymentSource s USING(TransactionNumber)
--      SET r.SubmissionKey = s.SubmissionKey;
--    -- Where no exact match, flag for manual review, do not auto-assign via resident+date+amount.
--
-- c) CashFlow SubmissionKey backfill — DETERMINISTIC per Rick §8:
--    For each CashFlow row where SourceRegister='APR':
--      Use exact SourceTransactionNumber = AssessmentPaymentSource.TransactionNumber match ONLY;
--      set SubmissionKey = Source.SubmissionKey, SubmissionTxnCount = count of Source rows sharing that key.
--      If no exact match, flag for manual review — do NOT match via resident+date+amount heuristic.
--
-- d) ResidentCreditLedger initial population — with EventDate/Status per §2:
--    For each APR row where CreditAmount > 0 and Status='POSTED':
--      INSERT INTO ResidentCreditLedger (ResidentAccountID, EventType, Amount, BalanceAfter, ReferenceTransactionNumber, ...)
--      VALUES (..., 'CREDIT_CREATED', CreditAmount, running_balance, TransactionNumber, ...);

SET FOREIGN_KEY_CHECKS=1;

-- ============================================================================
-- 7) CashFlow Void truth table — RECONCILED 2026-09-01 BravoFrontend split-bank
-- Active CashFlow must reconcile to SUM of remaining POSTED allocations for
-- (SubmissionKey, BankAccountID) — i.e., per physical receipt per bank, not per
-- SubmissionKey alone (Rick §§4-5). A single SA source $600 that split as
-- $500→SA bank (Capital 2) and $100→AD bank (Operating 1) created TWO receipts
-- sharing one SubmissionKey (verified APR090126-11074218). Supersede original
-- row for audit; active row holds valid portion. Replay never creates extra
-- receipt beyond replacement.
-- ============================================================================
-- | Submission + banks | Void which?          | Active per (key,bank)               | CashFlow rows (audit)                          | Replay |
-- |--------------------|----------------------|-------------------------------------|----------------------------------------------|--------|
-- | $600 in 1 bank     | that $600            | $0                                  | original → VOID, no active                     | No new |
-- | $500 SA bank/ $100 AD bank (1 SubmissionKey, 2 banks) | $500 SA void | SA bank $0, AD bank $100              | SA receipt $500→VOID, AD receipt $100 stays active | No new |
-- | same 2-bank receipt| $100 AD void         | SA bank $500, AD bank $0              | SA receipt stays $500, AD $100→VOID              | No new |
-- | same 2-bank receipt| both void            | $0 + $0                              | both receipts → VOID                         | No new |
-- | $500+$100 in SAME bank (single-bank split) | $500 void | $100 (only $100 remains in that bank) | original $600→superseded, replacement $100 active | No new |
-- | $500+$100 same bank| $100 void            | $500                                  | original $600→superseded, replacement $500 active | No new |
-- | none void          | —                    | $500 + $100 (or $600)                | receipts active as posted                     | —      |
-- Procedure (per BankAccountID):
--   activePerBank = COALESCE(SUM(allocation Amount routed to BankAccountID
--                 FROM active APR rows WHERE SubmissionKey=? AND BankAccountID=?), 0)
--   -- Practically: SUM(OriginalAmount) of POSTED Source that would route to that bank
--   -- at its PaymentDate, or SUM(AnnualDuesPayment+SpecialAssessmentPayment+Credit routed to that bank)
--   IF activePerBank = 0 THEN mark CashFlow VoidFlag='Y' WHERE SubmissionKey=? AND BankAccountID=?;
--   ELSIF activePerBank != original CashInAmount for that (key,bank) THEN supersede original + INSERT replacement with CashInAmount=activePerBank;
--   ELSE keep original row.
-- Note: DuesProgramming + AssessmentBankAssignmentHistory determines effective
-- bank per payment date; replay must resolve bank as in server.js getAssessmentBank
-- (payDate >= BankChangeEffectiveDate ? Pending else laterChanges.OldBankAccountID logic).
