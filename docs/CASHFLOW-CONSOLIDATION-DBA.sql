-- CASHFLOW CONSOLIDATION — DBA EXECUTION SCRIPT
-- Target: www.1mag1na.xyz / hoamanager26
-- Requires: CREATE TABLE, INSERT, RENAME TABLE, CREATE VIEW, DROP VIEW
-- The app user 'Ricktest' does NOT have these privileges (like migration 001) — run as admin/DBA.
-- Run in a maintenance window. Keep a full DB backup before executing.

-- ===========================================================
-- Step 1 — Create unified table (idempotent)
-- ===========================================================
CREATE TABLE IF NOT EXISTS CashFlowTransaction (
  CashFlowTransactionID       BIGINT NOT NULL AUTO_INCREMENT,
  CashFlowLedgerID            INT          DEFAULT NULL,
  MgtCoClientID               VARCHAR(20)  NOT NULL,
  HOALicenseNumber            VARCHAR(20)  NOT NULL,
  BankType                    VARCHAR(20)  NOT NULL,
  FiscalYearLabel             VARCHAR(20)  DEFAULT NULL,
  FiscalPeriod                TINYINT      DEFAULT NULL,
  BankAccountID               INT          DEFAULT NULL,
  BankIDLabel                 VARCHAR(50)  DEFAULT NULL,
  BankIDNumber                TINYINT      DEFAULT NULL,
  SourceRegister              VARCHAR(40)  DEFAULT NULL,
  SourceTransactionNumber     VARCHAR(40)  DEFAULT NULL,
  SourceRowID                 VARCHAR(40)  DEFAULT NULL,
  TransactionDate             DATE         DEFAULT NULL,
  ClearedDate                 DATE         DEFAULT NULL,
  PostedDate                  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PostingStatus               VARCHAR(20)  DEFAULT 'POSTED',
  TransactionDescription       VARCHAR(255) DEFAULT NULL,
  PayeeDepositorName          VARCHAR(120) DEFAULT NULL,
  VendorID                    VARCHAR(20)  DEFAULT NULL,
  ResidentAccountID           VARCHAR(20)  DEFAULT NULL,
  GLNumber                    INT          DEFAULT NULL,
  GLAccountName               VARCHAR(120) DEFAULT NULL,
  ParentGLNumber              INT          DEFAULT NULL,
  DebitCreditFlag             CHAR(1)      DEFAULT NULL,
  CashInAmount                DECIMAL(14,2) DEFAULT 0.00,
  CashOutAmount               DECIMAL(14,2) DEFAULT 0.00,
  NetCashAmount               DECIMAL(14,2) DEFAULT NULL,
  RunningBalanceAfterTransaction DECIMAL(14,2) DEFAULT NULL,
  BeginningBalanceImpactFlag  CHAR(1)      DEFAULT 'N',
  TransferGroupID             VARCHAR(40)  DEFAULT NULL,
  TransferFromBankAccountID   INT          DEFAULT NULL,
  TransferToBankAccountID     INT          DEFAULT NULL,
  CheckNumber                 VARCHAR(40)  DEFAULT NULL,
  DepositReferenceNumber      VARCHAR(40)  DEFAULT NULL,
  Status                      VARCHAR(20)  DEFAULT NULL,
  VoidFlag                    CHAR(1)      DEFAULT 'N',
  DeletedFlag                 CHAR(1)      DEFAULT 'N',
  CashFlowNotes               VARCHAR(255) DEFAULT NULL,
  OperatorID                  VARCHAR(20)  DEFAULT NULL,
  TimeStampCreated            DATETIME     DEFAULT CURRENT_TIMESTAMP,
  TimeStampUpdated            DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (CashFlowTransactionID),
  UNIQUE KEY uq_bank_txn (BankType, SourceTransactionNumber),
  KEY idx_res (ResidentAccountID),
  KEY idx_src (SourceRegister, SourceTransactionNumber)
) ENGINE=InnoDB;

-- ===========================================================
-- Step 2 — Migrate data (each shard already carries its BankType)
-- ===========================================================
INSERT INTO CashFlowTransaction
  (CashFlowLedgerID, MgtCoClientID, HOALicenseNumber, BankType, FiscalYearLabel, FiscalPeriod,
   BankAccountID, BankIDLabel, BankIDNumber, SourceRegister, SourceTransactionNumber, SourceRowID,
   TransactionDate, ClearedDate, PostedDate, PostingStatus, TransactionDescription, PayeeDepositorName,
   VendorID, ResidentAccountID, GLNumber, GLAccountName, ParentGLNumber, DebitCreditFlag,
   CashInAmount, CashOutAmount, NetCashAmount, RunningBalanceAfterTransaction, BeginningBalanceImpactFlag,
   TransferGroupID, TransferFromBankAccountID, TransferToBankAccountID, CheckNumber, DepositReferenceNumber,
   Status, VoidFlag, DeletedFlag, CashFlowNotes, OperatorID, TimeStampCreated, TimeStampUpdated)
SELECT CashFlowLedgerID, MgtCoClientID, HOALicenseNumber, BankType, FiscalYearLabel, FiscalPeriod,
  BankAccountID, BankIDLabel, BankIDNumber, SourceRegister, SourceTransactionNumber, SourceRowID,
  TransactionDate, ClearedDate, PostedDate, PostingStatus, TransactionDescription, PayeeDepositorName,
  VendorID, ResidentAccountID, GLNumber, GLAccountName, ParentGLNumber, DebitCreditFlag,
  CashInAmount, CashOutAmount, NetCashAmount, RunningBalanceAfterTransaction, BeginningBalanceImpactFlag,
  TransferGroupID, TransferFromBankAccountID, TransferToBankAccountID, CheckNumber, DepositReferenceNumber,
  Status, VoidFlag, DeletedFlag, CashFlowNotes, OperatorID, TimeStampCreated, TimeStampUpdated
FROM CashFlowTransaction_Operating
WHERE SourceTransactionNumber NOT IN (SELECT SourceTransactionNumber FROM CashFlowTransaction WHERE BankType='Operating');

INSERT INTO CashFlowTransaction
  (CashFlowLedgerID, MgtCoClientID, HOALicenseNumber, BankType, FiscalYearLabel, FiscalPeriod,
   BankAccountID, BankIDLabel, BankIDNumber, SourceRegister, SourceTransactionNumber, SourceRowID,
   TransactionDate, ClearedDate, PostedDate, PostingStatus, TransactionDescription, PayeeDepositorName,
   VendorID, ResidentAccountID, GLNumber, GLAccountName, ParentGLNumber, DebitCreditFlag,
   CashInAmount, CashOutAmount, NetCashAmount, RunningBalanceAfterTransaction, BeginningBalanceImpactFlag,
   TransferGroupID, TransferFromBankAccountID, TransferToBankAccountID, CheckNumber, DepositReferenceNumber,
   Status, VoidFlag, DeletedFlag, CashFlowNotes, OperatorID, TimeStampCreated, TimeStampUpdated)
SELECT CashFlowLedgerID, MgtCoClientID, HOALicenseNumber, BankType, FiscalYearLabel, FiscalPeriod,
  BankAccountID, BankIDLabel, BankIDNumber, SourceRegister, SourceTransactionNumber, SourceRowID,
  TransactionDate, ClearedDate, PostedDate, PostingStatus, TransactionDescription, PayeeDepositorName,
  VendorID, ResidentAccountID, GLNumber, GLAccountName, ParentGLNumber, DebitCreditFlag,
  CashInAmount, CashOutAmount, NetCashAmount, RunningBalanceAfterTransaction, BeginningBalanceImpactFlag,
  TransferGroupID, TransferFromBankAccountID, TransferToBankAccountID, CheckNumber, DepositReferenceNumber,
  Status, VoidFlag, DeletedFlag, CashFlowNotes, OperatorID, TimeStampCreated, TimeStampUpdated
FROM CashFlowTransaction_Capital
WHERE SourceTransactionNumber NOT IN (SELECT SourceTransactionNumber FROM CashFlowTransaction WHERE BankType='Capital');

INSERT INTO CashFlowTransaction
  (CashFlowLedgerID, MgtCoClientID, HOALicenseNumber, BankType, FiscalYearLabel, FiscalPeriod,
   BankAccountID, BankIDLabel, BankIDNumber, SourceRegister, SourceTransactionNumber, SourceRowID,
   TransactionDate, ClearedDate, PostedDate, PostingStatus, TransactionDescription, PayeeDepositorName,
   VendorID, ResidentAccountID, GLNumber, GLAccountName, ParentGLNumber, DebitCreditFlag,
   CashInAmount, CashOutAmount, NetCashAmount, RunningBalanceAfterTransaction, BeginningBalanceImpactFlag,
   TransferGroupID, TransferFromBankAccountID, TransferToBankAccountID, CheckNumber, DepositReferenceNumber,
   Status, VoidFlag, DeletedFlag, CashFlowNotes, OperatorID, TimeStampCreated, TimeStampUpdated)
SELECT CashFlowLedgerID, MgtCoClientID, HOALicenseNumber, BankType, FiscalYearLabel, FiscalPeriod,
  BankAccountID, BankIDLabel, BankIDNumber, SourceRegister, SourceTransactionNumber, SourceRowID,
  TransactionDate, ClearedDate, PostedDate, PostingStatus, TransactionDescription, PayeeDepositorName,
  VendorID, ResidentAccountID, GLNumber, GLAccountName, ParentGLNumber, DebitCreditFlag,
  CashInAmount, CashOutAmount, NetCashAmount, RunningBalanceAfterTransaction, BeginningBalanceImpactFlag,
  TransferGroupID, TransferFromBankAccountID, TransferToBankAccountID, CheckNumber, DepositReferenceNumber,
  Status, VoidFlag, DeletedFlag, CashFlowNotes, OperatorID, TimeStampCreated, TimeStampUpdated
FROM CashFlowTransaction_Escrow
WHERE SourceTransactionNumber NOT IN (SELECT SourceTransactionNumber FROM CashFlowTransaction WHERE BankType='Escrow');

INSERT INTO CashFlowTransaction
  (CashFlowLedgerID, MgtCoClientID, HOALicenseNumber, BankType, FiscalYearLabel, FiscalPeriod,
   BankAccountID, BankIDLabel, BankIDNumber, SourceRegister, SourceTransactionNumber, SourceRowID,
   TransactionDate, ClearedDate, PostedDate, PostingStatus, TransactionDescription, PayeeDepositorName,
   VendorID, ResidentAccountID, GLNumber, GLAccountName, ParentGLNumber, DebitCreditFlag,
   CashInAmount, CashOutAmount, NetCashAmount, RunningBalanceAfterTransaction, BeginningBalanceImpactFlag,
   TransferGroupID, TransferFromBankAccountID, TransferToBankAccountID, CheckNumber, DepositReferenceNumber,
   Status, VoidFlag, DeletedFlag, CashFlowNotes, OperatorID, TimeStampCreated, TimeStampUpdated)
SELECT CashFlowLedgerID, MgtCoClientID, HOALicenseNumber, BankType, FiscalYearLabel, FiscalPeriod,
  BankAccountID, BankIDLabel, BankIDNumber, SourceRegister, SourceTransactionNumber, SourceRowID,
  TransactionDate, ClearedDate, PostedDate, PostingStatus, TransactionDescription, PayeeDepositorName,
  VendorID, ResidentAccountID, GLNumber, GLAccountName, ParentGLNumber, DebitCreditFlag,
  CashInAmount, CashOutAmount, NetCashAmount, RunningBalanceAfterTransaction, BeginningBalanceImpactFlag,
  TransferGroupID, TransferFromBankAccountID, TransferToBankAccountID, CheckNumber, DepositReferenceNumber,
  Status, VoidFlag, DeletedFlag, CashFlowNotes, OperatorID, TimeStampCreated, TimeStampUpdated
FROM CashFlowTransaction_MoneyMarket
WHERE SourceTransactionNumber NOT IN (SELECT SourceTransactionNumber FROM CashFlowTransaction WHERE BankType='MoneyMarket');

INSERT INTO CashFlowTransaction
  (CashFlowLedgerID, MgtCoClientID, HOALicenseNumber, BankType, FiscalYearLabel, FiscalPeriod,
   BankAccountID, BankIDLabel, BankIDNumber, SourceRegister, SourceTransactionNumber, SourceRowID,
   TransactionDate, ClearedDate, PostedDate, PostingStatus, TransactionDescription, PayeeDepositorName,
   VendorID, ResidentAccountID, GLNumber, GLAccountName, ParentGLNumber, DebitCreditFlag,
   CashInAmount, CashOutAmount, NetCashAmount, RunningBalanceAfterTransaction, BeginningBalanceImpactFlag,
   TransferGroupID, TransferFromBankAccountID, TransferToBankAccountID, CheckNumber, DepositReferenceNumber,
   Status, VoidFlag, DeletedFlag, CashFlowNotes, OperatorID, TimeStampCreated, TimeStampUpdated)
SELECT CashFlowLedgerID, MgtCoClientID, HOALicenseNumber, BankType, FiscalYearLabel, FiscalPeriod,
  BankAccountID, BankIDLabel, BankIDNumber, SourceRegister, SourceTransactionNumber, SourceRowID,
  TransactionDate, ClearedDate, PostedDate, PostingStatus, TransactionDescription, PayeeDepositorName,
  VendorID, ResidentAccountID, GLNumber, GLAccountName, ParentGLNumber, DebitCreditFlag,
  CashInAmount, CashOutAmount, NetCashAmount, RunningBalanceAfterTransaction, BeginningBalanceImpactFlag,
  TransferGroupID, TransferFromBankAccountID, TransferToBankAccountID, CheckNumber, DepositReferenceNumber,
  Status, VoidFlag, DeletedFlag, CashFlowNotes, OperatorID, TimeStampCreated, TimeStampUpdated
FROM CashFlowTransaction_Savings
WHERE SourceTransactionNumber NOT IN (SELECT SourceTransactionNumber FROM CashFlowTransaction WHERE BankType='Savings');

INSERT INTO CashFlowTransaction
  (CashFlowLedgerID, MgtCoClientID, HOALicenseNumber, BankType, FiscalYearLabel, FiscalPeriod,
   BankAccountID, BankIDLabel, BankIDNumber, SourceRegister, SourceTransactionNumber, SourceRowID,
   TransactionDate, ClearedDate, PostedDate, PostingStatus, TransactionDescription, PayeeDepositorName,
   VendorID, ResidentAccountID, GLNumber, GLAccountName, ParentGLNumber, DebitCreditFlag,
   CashInAmount, CashOutAmount, NetCashAmount, RunningBalanceAfterTransaction, BeginningBalanceImpactFlag,
   TransferGroupID, TransferFromBankAccountID, TransferToBankAccountID, CheckNumber, DepositReferenceNumber,
   Status, VoidFlag, DeletedFlag, CashFlowNotes, OperatorID, TimeStampCreated, TimeStampUpdated)
SELECT CashFlowLedgerID, MgtCoClientID, HOALicenseNumber, BankType, FiscalYearLabel, FiscalPeriod,
  BankAccountID, BankIDLabel, BankIDNumber, SourceRegister, SourceTransactionNumber, SourceRowID,
  TransactionDate, ClearedDate, PostedDate, PostingStatus, TransactionDescription, PayeeDepositorName,
  VendorID, ResidentAccountID, GLNumber, GLAccountName, ParentGLNumber, DebitCreditFlag,
  CashInAmount, CashOutAmount, NetCashAmount, RunningBalanceAfterTransaction, BeginningBalanceImpactFlag,
  TransferGroupID, TransferFromBankAccountID, TransferToBankAccountID, CheckNumber, DepositReferenceNumber,
  Status, VoidFlag, DeletedFlag, CashFlowNotes, OperatorID, TimeStampCreated, TimeStampUpdated
FROM CashFlowTransaction_CD
WHERE SourceTransactionNumber NOT IN (SELECT SourceTransactionNumber FROM CashFlowTransaction WHERE BankType='CD');

-- ===========================================================
-- Step 3 — Backup: rename old shards (keeps data if rollback needed)
-- ===========================================================
RENAME TABLE
  CashFlowTransaction_Operating   TO z_bak_CashFlowTransaction_Operating,
  CashFlowTransaction_Capital     TO z_bak_CashFlowTransaction_Capital,
  CashFlowTransaction_Escrow      TO z_bak_CashFlowTransaction_Escrow,
  CashFlowTransaction_MoneyMarket TO z_bak_CashFlowTransaction_MoneyMarket,
  CashFlowTransaction_Savings     TO z_bak_CashFlowTransaction_Savings,
  CashFlowTransaction_CD          TO z_bak_CashFlowTransaction_CD;

-- ===========================================================
-- Step 4 — Recreate the 6 names as updatable views
-- ===========================================================
CREATE VIEW CashFlowTransaction_Operating AS
  SELECT * FROM CashFlowTransaction WHERE BankType = 'Operating' WITH CHECK OPTION;
CREATE VIEW CashFlowTransaction_Capital AS
  SELECT * FROM CashFlowTransaction WHERE BankType = 'Capital' WITH CHECK OPTION;
CREATE VIEW CashFlowTransaction_Escrow AS
  SELECT * FROM CashFlowTransaction WHERE BankType = 'Escrow' WITH CHECK OPTION;
CREATE VIEW CashFlowTransaction_MoneyMarket AS
  SELECT * FROM CashFlowTransaction WHERE BankType = 'MoneyMarket' WITH CHECK OPTION;
CREATE VIEW CashFlowTransaction_Savings AS
  SELECT * FROM CashFlowTransaction WHERE BankType = 'Savings' WITH CHECK OPTION;
CREATE VIEW CashFlowTransaction_CD AS
  SELECT * FROM CashFlowTransaction WHERE BankType = 'CD' WITH CHECK OPTION;

-- ===========================================================
-- Verification (run after, as DBA or via app)
-- ===========================================================
-- SELECT BankType, COUNT(*) FROM CashFlowTransaction GROUP BY BankType;
-- SELECT COUNT(*) FROM z_bak_CashFlowTransaction_Operating; -- compare
-- Test write through view: INSERT INTO CashFlowTransaction_Operating (MgtCoClientID, HOALicenseNumber, BankType, BankAccountID, SourceRegister, SourceTransactionNumber, TransactionDate) VALUES ('MGTCO-001','HOA-FL-2024-001','Operating',1,'TEST','TEST-001','2026-08-27');
-- SELECT * FROM CashFlowTransaction WHERE SourceTransactionNumber='TEST-001';
-- DELETE FROM CashFlowTransaction WHERE SourceTransactionNumber='TEST-001';

-- ===========================================================
-- Rollback (if anything fails)
-- ===========================================================
-- DROP VIEW CashFlowTransaction_Operating;
-- DROP VIEW CashFlowTransaction_Capital;
-- DROP VIEW CashFlowTransaction_Escrow;
-- DROP VIEW CashFlowTransaction_MoneyMarket;
-- DROP VIEW CashFlowTransaction_Savings;
-- DROP VIEW CashFlowTransaction_CD;
-- RENAME TABLE
--   z_bak_CashFlowTransaction_Operating   TO CashFlowTransaction_Operating,
--   z_bak_CashFlowTransaction_Capital     TO CashFlowTransaction_Capital,
--   z_bak_CashFlowTransaction_Escrow      TO CashFlowTransaction_Escrow,
--   z_bak_CashFlowTransaction_MoneyMarket TO CashFlowTransaction_MoneyMarket,
--   z_bak_CashFlowTransaction_Savings     TO CashFlowTransaction_Savings,
--   z_bak_CashFlowTransaction_CD          TO CashFlowTransaction_CD;
-- DROP TABLE IF EXISTS CashFlowTransaction;
