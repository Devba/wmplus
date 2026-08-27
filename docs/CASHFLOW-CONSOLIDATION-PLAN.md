# CashFlow Consolidation — Implementation Plan (one table + views)

**Date:** 2026-08-27
**Owner:** José (backend/DB)
**Approach (confirmed):** one physical table `CashFlowTransaction` (source of truth, `BankType` as discriminator) + the 6 partitioned names recreated as **updatable views** for backward compatibility. No `server.js` change required (`cfTableMap` in `server.js:~3530` keeps working because the INSERT already supplies `BankType`).

> WARNING: This is a **plan only** — the SQL below is NOT executed yet. Run it in a maintenance window after Jose's sign-off.

---

## 1. Current state (verified)

`hoamanager26` has 6 partitioned transaction tables, all **schema-identical**, differing only by the `BankType` DEFAULT:

| Table | BankType default |
|---|---|
| `CashFlowTransaction_Operating` | Operating |
| `CashFlowTransaction_Capital` | Capital |
| `CashFlowTransaction_Escrow` | Escrow |
| `CashFlowTransaction_MoneyMarket` | MoneyMarket |
| `CashFlowTransaction_Savings` | Savings |
| `CashFlowTransaction_CD` | CD |

Support tables (NOT partitioned, unchanged): `CashFlowLedgerMaster`, `CashFlowMonthlyReportRow`, `CashFlowPostingControl`, `CashFlowRowControl`, `CashFlow_Bank_Template`.

Note: `CashFlowTransaction_CD` exists in the DB but is **not** in `cfTableMap`, so the APR posting never writes CD today — it will be included once unified.

---

## 2. Step 1 — Create unified table

```sql
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
```

## 3. Step 2 — Migrate data (each shard already carries its `BankType`)

```sql
INSERT INTO CashFlowTransaction
  (CashFlowLedgerID, MgtCoClientID, HOALicenseNumber, BankType, FiscalYearLabel, FiscalPeriod,
   BankAccountID, BankIDLabel, BankIDNumber, SourceRegister, SourceTransactionNumber, SourceRowID,
   TransactionDate, ClearedDate, PostedDate, PostingStatus, TransactionDescription, PayeeDepositorName,
   VendorID, ResidentAccountID, GLNumber, GLAccountName, ParentGLNumber, DebitCreditFlag,
   CashInAmount, CashOutAmount, NetCashAmount, RunningBalanceAfterTransaction, BeginningBalanceImpactFlag,
   TransferGroupID, TransferFromBankAccountID, TransferToBankAccountID, CheckNumber, DepositReferenceNumber,
   Status, VoidFlag, DeletedFlag, CashFlowNotes, OperatorID, TimeStampCreated, TimeStampUpdated)
SELECT
  CashFlowLedgerID, MgtCoClientID, HOALicenseNumber, BankType, FiscalYearLabel, FiscalPeriod,
  BankAccountID, BankIDLabel, BankIDNumber, SourceRegister, SourceTransactionNumber, SourceRowID,
  TransactionDate, ClearedDate, PostedDate, PostingStatus, TransactionDescription, PayeeDepositorName,
  VendorID, ResidentAccountID, GLNumber, GLAccountName, ParentGLNumber, DebitCreditFlag,
  CashInAmount, CashOutAmount, NetCashAmount, RunningBalanceAfterTransaction, BeginningBalanceImpactFlag,
  TransferGroupID, TransferFromBankAccountID, TransferToBankAccountID, CheckNumber, DepositReferenceNumber,
  Status, VoidFlag, DeletedFlag, CashFlowNotes, OperatorID, TimeStampCreated, TimeStampUpdated
FROM CashFlowTransaction_Operating;
-- repeat for _Capital, _Escrow, _MoneyMarket, _Savings, _CD
```

## 4. Step 3 — Backup + rename old shards

```sql
RENAME TABLE
  CashFlowTransaction_Operating   TO z_bak_CashFlowTransaction_Operating,
  CashFlowTransaction_Capital     TO z_bak_CashFlowTransaction_Capital,
  CashFlowTransaction_Escrow      TO z_bak_CashFlowTransaction_Escrow,
  CashFlowTransaction_MoneyMarket TO z_bak_CashFlowTransaction_MoneyMarket,
  CashFlowTransaction_Savings     TO z_bak_CashFlowTransaction_Savings,
  CashFlowTransaction_CD          TO z_bak_CashFlowTransaction_CD;
```

## 5. Step 4 — Recreate the 6 names as updatable views

```sql
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
```

> Why no `server.js` change: MySQL updatable views allow INSERT/UPDATE/DELETE that route to the base table. `server.js` already supplies `BankType` on insert, so `cfTableMap` continues to target the view names transparently. `WITH CHECK OPTION` guarantees a row written through a view satisfies that view's `BankType`.

---

## 6. Verification

1. Row counts match: `SELECT BankType, COUNT(*) FROM CashFlowTransaction GROUP BY BankType` equals the sum of the former shards.
2. Round-trip write: insert a test row through `CashFlowTransaction_Operating` view, confirm it lands in `CashFlowTransaction` with `BankType='Operating'`, then delete it.
3. Smoke-test the live APR posting path (`POST /api/apr/enter-payment`) — it should write to the view/`CashFlowTransaction` without error.

## 7. Rollback

If anything fails: `DROP VIEW` the 6 views and `RENAME TABLE z_bak_CashFlowTransaction_* TO CashFlowTransaction_*`. Data is untouched in the backups.

## 8. Open items

- Decide whether `CashFlowTransaction_CD` should be wired into `cfTableMap` going forward (currently omitted).
- Confirm with Jose before executing in production (needs `CREATE VIEW` / `RENAME` privileges beyond `Ricktest` — run as DBA, like migration `001`).
