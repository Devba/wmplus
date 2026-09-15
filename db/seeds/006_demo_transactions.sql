-- seed 006 transacciones demo (re-ejecutable tras wipe de estas tablas).
-- DEV: 12 checks + 8 deposits + 10 payments. RL: 3+2+3. Rollback:
-- DELETE FROM ... WHERE OperatorID='SEED';
USE hoamanager26_dev;

-- Idempotencia: limpia cargas SEED previas.
DELETE FROM AssessmentPaymentRegister WHERE OperatorID='SEED';
DELETE FROM DepositRegister WHERE OperatorID='SEED';
DELETE FROM CheckRegister WHERE OperatorID='SEED';

INSERT INTO CheckRegister (CheckTransactionNumber, CheckNumber, Amount, DateCheckIssued, DateCheckCleared, MonthCleared, GLNumber, VendorResidentID, CheckNotation, BankAccount, BankAccountID, Status, DeletedFlag, MgtCoClientID, HOALicenseNumber, OperatorID) VALUES
  ('CHK-DEV-01',9001,137.5,'2026-08-11',NULL,NULL,'50000','VEND-001','Pago demo CHK-DEV-01','Operating',1,'Outstanding','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('CHK-DEV-02',9002,175.0,'2026-08-12',NULL,NULL,'50000','VEND-001','Pago demo CHK-DEV-02','Operating',1,'Outstanding','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('CHK-DEV-03',9003,212.5,'2026-08-13',NULL,NULL,'50000','VEND-001','Pago demo CHK-DEV-03','Operating',1,'Outstanding','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('CHK-DEV-04',9004,250.0,'2026-08-14',NULL,NULL,'50000','VEND-001','Pago demo CHK-DEV-04','Operating',1,'Outstanding','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('CHK-DEV-05',9005,287.5,'2026-08-15',NULL,NULL,'50000','VEND-001','Pago demo CHK-DEV-05','Operating',1,'Outstanding','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('CHK-DEV-06',9006,325.0,'2026-08-16',NULL,NULL,'50000','VEND-001','Pago demo CHK-DEV-06','Operating',1,'Outstanding','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('CHK-DEV-07',9007,362.5,'2026-08-17',NULL,NULL,'50000','VEND-001','Pago demo CHK-DEV-07','Operating',1,'Outstanding','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('CHK-DEV-08',9008,241.25,'2026-07-06','2026-08-02',8,'50000','VEND-001','Pago demo CHK-DEV-08','Operating',1,'Cleared','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('CHK-DEV-09',9009,282.5,'2026-07-07','2026-08-03',8,'50000','VEND-001','Pago demo CHK-DEV-09','Operating',1,'Cleared','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('CHK-DEV-10',9010,323.75,'2026-07-08','2026-08-04',8,'50000','VEND-001','Pago demo CHK-DEV-10','Operating',1,'Cleared','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('CHK-DEV-11',9011,365.0,'2026-07-09','2026-08-05',8,'50000','VEND-001','Pago demo CHK-DEV-11','Operating',1,'Cleared','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('CHK-DEV-12',9012,406.25,'2026-07-10','2026-08-06',8,'50000','VEND-001','Pago demo CHK-DEV-12','Operating',1,'Cleared','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('CHK-RL-01',9001,137.5,'2026-08-11',NULL,NULL,'50000','VEND-001','Pago demo CHK-RL-01','Operating',1,'Outstanding','N','MGTCO-001','LIC-HOA1','SEED'),
  ('CHK-RL-02',9002,175.0,'2026-08-12',NULL,NULL,'50000','VEND-001','Pago demo CHK-RL-02','Operating',1,'Outstanding','N','MGTCO-001','LIC-HOA1','SEED'),
  ('CHK-RL-03',9003,241.25,'2026-07-06','2026-08-02',8,'50000','VEND-001','Pago demo CHK-RL-03','Operating',1,'Cleared','N','MGTCO-001','LIC-HOA1','SEED');

INSERT INTO DepositRegister (DepositTransactionNumber, DepositorAccountName, Amount, BankAccountName, BankAccountID, DateDeposited, DateCleared, MonthCleared, ResidentAccountID, Status, DeletedFlag, MgtCoClientID, HOALicenseNumber, OperatorID) VALUES
  ('DEP-DEV-01','Residente 070001',213.2,'Operating',1,'2026-08-13',NULL,NULL,'070001','Outstanding','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('DEP-DEV-02','Residente 070002',276.4,'Operating',1,'2026-08-14',NULL,NULL,'070002','Outstanding','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('DEP-DEV-03','Residente 070003',339.6,'Operating',1,'2026-08-15',NULL,NULL,'070003','Outstanding','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('DEP-DEV-04','Residente 070004',402.8,'Operating',1,'2026-08-16',NULL,NULL,'070004','Outstanding','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('DEP-DEV-05','Residente 070005',466.0,'Operating',1,'2026-08-17',NULL,NULL,'070005','Outstanding','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('DEP-DEV-06','Residente 070001',355.0,'Operating',1,'2026-07-11','2026-08-03',8,'070001','Cleared','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('DEP-DEV-07','Residente 070002',410.0,'Operating',1,'2026-07-12','2026-08-04',8,'070002','Cleared','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('DEP-DEV-08','Residente 070003',465.0,'Operating',1,'2026-07-13','2026-08-05',8,'070003','Cleared','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('DEP-RL-01','Residente 070001',213.2,'Operating',1,'2026-08-13',NULL,NULL,'070001','Outstanding','N','MGTCO-001','LIC-HOA1','SEED'),
  ('DEP-RL-02','Residente 070001',355.0,'Operating',1,'2026-07-11','2026-08-03',8,'070001','Cleared','N','MGTCO-001','LIC-HOA1','SEED');

INSERT INTO AssessmentPaymentRegister (TransactionNumber, ResidentAccountID, PaymentType, AnnualDuesPayment, TotalAmount, PaymentDate, BankAccountID, GLNumber, Status, DeletedFlag, MgtCoClientID, HOALicenseNumber, OperatorID) VALUES
  ('TXN-DEV-01','070001','AnnualDues',260.0,260.0,'2026-08-04',1,'40000','POSTED','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('TXN-DEV-02','070002','AnnualDues',270.0,270.0,'2026-08-05',1,'40000','POSTED','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('TXN-DEV-03','070003','SpecialAssessment',0,280.0,'2026-08-06',1,'40000','POSTED','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('TXN-DEV-04','070004','AnnualDues',290.0,290.0,'2026-08-07',1,'40000','POSTED','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('TXN-DEV-05','070005','AnnualDues',300.0,300.0,'2026-08-08',1,'40000','POSTED','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('TXN-DEV-06','070006','SpecialAssessment',0,310.0,'2026-08-09',1,'40000','POSTED','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('TXN-DEV-07','070007','AnnualDues',320.0,320.0,'2026-08-10',1,'40000','POSTED','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('TXN-DEV-08','070008','AnnualDues',330.0,330.0,'2026-08-11',1,'40000','POSTED','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('TXN-DEV-09','070009','SpecialAssessment',0,340.0,'2026-08-12',1,'40000','POSTED','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('TXN-DEV-10','0700010','AnnualDues',350.0,350.0,'2026-08-13',1,'40000','POSTED','N','MGTCO-001','HOA-FL-2024-001','SEED'),
  ('TXN-RL-01','010001','AnnualDues',260.0,260.0,'2026-08-04',1,'40000','POSTED','N','MGTCO-001','LIC-HOA1','SEED'),
  ('TXN-RL-02','010002','AnnualDues',270.0,270.0,'2026-08-05',1,'40000','POSTED','N','MGTCO-001','LIC-HOA1','SEED'),
  ('TXN-RL-03','010003','SpecialAssessment',0,280.0,'2026-08-06',1,'40000','POSTED','N','MGTCO-001','LIC-HOA1','SEED');
