-- Backfill v6 PROD — DETERMINISTIC — for hoamanager26 (prod)
-- Execute with privileged user (Ricktest) on www.1mag1na.xyz:
--   mysql -h www.1mag1na.xyz -u Ricktest -p hoamanager26 < backfill-v6-prod.sql
-- Or via phpMyAdmin / MySQL Workbench: copy/paste each block.

-- 1) AssessmentPaymentSource — deterministic per TransactionNumber exact
INSERT INTO AssessmentPaymentSource
  (TransactionNumber, SubmissionKey, ResidentAccountID, OriginalEntryType, OriginalAmount, PaymentDate, BankAccountID, GLNumber, ElectronicPaymentID, MgtCoClientID, HOALicenseNumber, CurrentFiscalYearBegins, Frequency, PeriodNumber, OperatorID, Status)
SELECT
  TransactionNumber,
  TransactionNumber AS SubmissionKey,
  MIN(ResidentAccountID) AS ResidentAccountID,
  CASE WHEN SUM(CASE WHEN PaymentType='SpecialAssessment' THEN 1 ELSE 0 END) > 0 THEN 'SpecialAssessment' ELSE 'AnnualDues' END AS OriginalEntryType,
  SUM(TotalAmount) AS OriginalAmount,
  MIN(PaymentDate) AS PaymentDate,
  MIN(BankAccountID) AS BankAccountID,
  MIN(GLNumber) AS GLNumber,
  MIN(ElectronicPaymentID) AS ElectronicPaymentID,
  MIN(MgtCoClientID) AS MgtCoClientID,
  MIN(HOALicenseNumber) AS HOALicenseNumber,
  MIN(CurrentFiscalYearBegins) AS CurrentFiscalYearBegins,
  MIN(Frequency) AS Frequency,
  MIN(PeriodNumber) AS PeriodNumber,
  MIN(OperatorID) AS OperatorID,
  'POSTED' AS Status
FROM AssessmentPaymentRegister
WHERE Status='POSTED' AND DeletedFlag='N'
GROUP BY TransactionNumber
ON DUPLICATE KEY UPDATE TransactionNumber=VALUES(TransactionNumber);

-- Verify:
-- SELECT COUNT(*) AS src_cnt FROM AssessmentPaymentSource; -- should equal COUNT(DISTINCT TransactionNumber) from APR POSTED
-- SELECT TransactionNumber, OriginalEntryType, OriginalAmount, SubmissionKey FROM AssessmentPaymentSource ORDER BY TransactionNumber LIMIT 10;

-- 2) AssessmentPaymentRegister.SubmissionKey — deterministic via exact TransactionNumber join
UPDATE AssessmentPaymentRegister r
JOIN AssessmentPaymentSource s USING(TransactionNumber)
SET r.SubmissionKey = s.SubmissionKey
WHERE r.SubmissionKey IS NULL;

-- 3) CashFlow SubmissionKey — deterministic via exact SourceTransactionNumber ONLY
-- For each of the 6 interim tables (and future CashFlow_BankID_XXX after provisioning):
-- Run for each table separately, e.g.:
UPDATE CashFlowTransaction_Operating cf
JOIN AssessmentPaymentSource s ON cf.SourceTransactionNumber = s.TransactionNumber
SET cf.SubmissionKey = s.SubmissionKey
WHERE cf.SourceRegister='APR' AND cf.SubmissionKey IS NULL;

UPDATE CashFlowTransaction_Capital cf
JOIN AssessmentPaymentSource s ON cf.SourceTransactionNumber = s.TransactionNumber
SET cf.SubmissionKey = s.SubmissionKey
WHERE cf.SourceRegister='APR' AND cf.SubmissionKey IS NULL;

-- Repeat for _Escrow, _MoneyMarket, _Savings, _CD (and for each CashFlow_BankID_XXX after provisioning):
-- UPDATE CashFlowTransaction_Escrow cf JOIN AssessmentPaymentSource s ON cf.SourceTransactionNumber=s.TransactionNumber SET cf.SubmissionKey=s.SubmissionKey WHERE cf.SourceRegister='APR' AND cf.SubmissionKey IS NULL;
-- If no exact match, leave NULL and flag for manual review — DO NOT match via resident+date+amount heuristic.

-- 4) ResidentCreditLedger initial — with EventDate = PaymentDate, Status POSTED
INSERT INTO ResidentCreditLedger
  (ResidentAccountID, MgtCoClientID, HOALicenseNumber, CurrentFiscalYearBegins, BatchID, EventDate, Status, EventType, Amount, BalanceAfter, ReferenceTransactionNumber, SubmissionKey, OperatorID)
SELECT
  ResidentAccountID,
  MgtCoClientID,
  HOALicenseNumber,
  CurrentFiscalYearBegins,
  NULL AS BatchID,
  PaymentDate AS EventDate,
  'POSTED' AS Status,
  'CREDIT_CREATED' AS EventType,
  CreditAmount AS Amount,
  CreditAmount AS BalanceAfter, -- will be recomputed correctly on replay; initial running balance simplified
  TransactionNumber AS ReferenceTransactionNumber,
  SubmissionKey,
  OperatorID
FROM AssessmentPaymentRegister
WHERE Status='POSTED' AND DeletedFlag='N' AND CreditAmount > 0
ON DUPLICATE KEY UPDATE ReferenceTransactionNumber=VALUES(ReferenceTransactionNumber);

-- After backfill, verify:
-- SELECT COUNT(*) FROM AssessmentPaymentSource; -- should be 17 distinct txns for prod (19 rows)
-- SELECT TransactionNumber, COUNT(*) FROM AssessmentPaymentRegister WHERE SubmissionKey IS NULL GROUP BY TransactionNumber; -- should be 0
-- SELECT SourceTransactionNumber, SubmissionKey FROM CashFlowTransaction_Operating WHERE SourceRegister='APR' AND SubmissionKey IS NULL LIMIT 5; -- flag remainder for manual review
