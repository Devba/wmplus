-- seed singletons por HOA (una fila base cada uno). Idempotente via NOT EXISTS.
USE hoamanager26_dev;

INSERT INTO FinesConfig (HOALicenseNumber, RestartDays, FineAmount)
SELECT 'LIC-HOA1', 0, 0.00 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM FinesConfig WHERE HOALicenseNumber='LIC-HOA1');
INSERT INTO TimingSchedule (HOALicenseNumber, Warning1Days, Warning2Days, Collection1Days, Collection2Days, FinalDays)
SELECT 'LIC-HOA1', 30, 60, 90, 120, 150 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM TimingSchedule WHERE HOALicenseNumber='LIC-HOA1');
INSERT INTO SystemSettings (HOALicenseNumber) SELECT 'LIC-HOA1' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM SystemSettings WHERE HOALicenseNumber='LIC-HOA1');
INSERT INTO FiscalYearSetup (MgtCoClientID, HOALicenseNumber, FiscalYearLabel, FiscalYearStartDate, FiscalYearEndDate, CurrentFiscalYearFlag, ClosedFlag, OperatorID)
SELECT 'MGTCO-001', 'LIC-HOA1', 'FY2026', '2026-01-01', '2026-12-31', 'Y', 'N', 'SEED' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM FiscalYearSetup WHERE HOALicenseNumber='LIC-HOA1' AND CurrentFiscalYearFlag='Y');
INSERT INTO FinesConfig (HOALicenseNumber, RestartDays, FineAmount)
SELECT 'LIC-HOA2', 0, 0.00 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM FinesConfig WHERE HOALicenseNumber='LIC-HOA2');
INSERT INTO TimingSchedule (HOALicenseNumber, Warning1Days, Warning2Days, Collection1Days, Collection2Days, FinalDays)
SELECT 'LIC-HOA2', 30, 60, 90, 120, 150 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM TimingSchedule WHERE HOALicenseNumber='LIC-HOA2');
INSERT INTO SystemSettings (HOALicenseNumber) SELECT 'LIC-HOA2' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM SystemSettings WHERE HOALicenseNumber='LIC-HOA2');
INSERT INTO FiscalYearSetup (MgtCoClientID, HOALicenseNumber, FiscalYearLabel, FiscalYearStartDate, FiscalYearEndDate, CurrentFiscalYearFlag, ClosedFlag, OperatorID)
SELECT 'MGTCO-001', 'LIC-HOA2', 'FY2026', '2026-01-01', '2026-12-31', 'Y', 'N', 'SEED' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM FiscalYearSetup WHERE HOALicenseNumber='LIC-HOA2' AND CurrentFiscalYearFlag='Y');
INSERT INTO FinesConfig (HOALicenseNumber, RestartDays, FineAmount)
SELECT 'LIC-HOA3', 0, 0.00 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM FinesConfig WHERE HOALicenseNumber='LIC-HOA3');
INSERT INTO TimingSchedule (HOALicenseNumber, Warning1Days, Warning2Days, Collection1Days, Collection2Days, FinalDays)
SELECT 'LIC-HOA3', 30, 60, 90, 120, 150 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM TimingSchedule WHERE HOALicenseNumber='LIC-HOA3');
INSERT INTO SystemSettings (HOALicenseNumber) SELECT 'LIC-HOA3' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM SystemSettings WHERE HOALicenseNumber='LIC-HOA3');
INSERT INTO FiscalYearSetup (MgtCoClientID, HOALicenseNumber, FiscalYearLabel, FiscalYearStartDate, FiscalYearEndDate, CurrentFiscalYearFlag, ClosedFlag, OperatorID)
SELECT 'MGTCO-001', 'LIC-HOA3', 'FY2026', '2026-01-01', '2026-12-31', 'Y', 'N', 'SEED' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM FiscalYearSetup WHERE HOALicenseNumber='LIC-HOA3' AND CurrentFiscalYearFlag='Y');
INSERT INTO FinesConfig (HOALicenseNumber, RestartDays, FineAmount)
SELECT 'LIC-HOA4', 0, 0.00 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM FinesConfig WHERE HOALicenseNumber='LIC-HOA4');
INSERT INTO TimingSchedule (HOALicenseNumber, Warning1Days, Warning2Days, Collection1Days, Collection2Days, FinalDays)
SELECT 'LIC-HOA4', 30, 60, 90, 120, 150 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM TimingSchedule WHERE HOALicenseNumber='LIC-HOA4');
INSERT INTO SystemSettings (HOALicenseNumber) SELECT 'LIC-HOA4' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM SystemSettings WHERE HOALicenseNumber='LIC-HOA4');
INSERT INTO FiscalYearSetup (MgtCoClientID, HOALicenseNumber, FiscalYearLabel, FiscalYearStartDate, FiscalYearEndDate, CurrentFiscalYearFlag, ClosedFlag, OperatorID)
SELECT 'MGTCO-001', 'LIC-HOA4', 'FY2026', '2026-01-01', '2026-12-31', 'Y', 'N', 'SEED' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM FiscalYearSetup WHERE HOALicenseNumber='LIC-HOA4' AND CurrentFiscalYearFlag='Y');
INSERT INTO FinesConfig (HOALicenseNumber, RestartDays, FineAmount)
SELECT 'LIC-HOA5', 0, 0.00 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM FinesConfig WHERE HOALicenseNumber='LIC-HOA5');
INSERT INTO TimingSchedule (HOALicenseNumber, Warning1Days, Warning2Days, Collection1Days, Collection2Days, FinalDays)
SELECT 'LIC-HOA5', 30, 60, 90, 120, 150 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM TimingSchedule WHERE HOALicenseNumber='LIC-HOA5');
INSERT INTO SystemSettings (HOALicenseNumber) SELECT 'LIC-HOA5' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM SystemSettings WHERE HOALicenseNumber='LIC-HOA5');
INSERT INTO FiscalYearSetup (MgtCoClientID, HOALicenseNumber, FiscalYearLabel, FiscalYearStartDate, FiscalYearEndDate, CurrentFiscalYearFlag, ClosedFlag, OperatorID)
SELECT 'MGTCO-001', 'LIC-HOA5', 'FY2026', '2026-01-01', '2026-12-31', 'Y', 'N', 'SEED' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM FiscalYearSetup WHERE HOALicenseNumber='LIC-HOA5' AND CurrentFiscalYearFlag='Y');
INSERT INTO FinesConfig (HOALicenseNumber, RestartDays, FineAmount)
SELECT 'LIC-HOA6', 0, 0.00 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM FinesConfig WHERE HOALicenseNumber='LIC-HOA6');
INSERT INTO TimingSchedule (HOALicenseNumber, Warning1Days, Warning2Days, Collection1Days, Collection2Days, FinalDays)
SELECT 'LIC-HOA6', 30, 60, 90, 120, 150 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM TimingSchedule WHERE HOALicenseNumber='LIC-HOA6');
INSERT INTO SystemSettings (HOALicenseNumber) SELECT 'LIC-HOA6' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM SystemSettings WHERE HOALicenseNumber='LIC-HOA6');
INSERT INTO FiscalYearSetup (MgtCoClientID, HOALicenseNumber, FiscalYearLabel, FiscalYearStartDate, FiscalYearEndDate, CurrentFiscalYearFlag, ClosedFlag, OperatorID)
SELECT 'MGTCO-001', 'LIC-HOA6', 'FY2026', '2026-01-01', '2026-12-31', 'Y', 'N', 'SEED' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM FiscalYearSetup WHERE HOALicenseNumber='LIC-HOA6' AND CurrentFiscalYearFlag='Y');
INSERT INTO FinesConfig (HOALicenseNumber, RestartDays, FineAmount)
SELECT 'HOA-FL-2024-001', 0, 0.00 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM FinesConfig WHERE HOALicenseNumber='HOA-FL-2024-001');
INSERT INTO TimingSchedule (HOALicenseNumber, Warning1Days, Warning2Days, Collection1Days, Collection2Days, FinalDays)
SELECT 'HOA-FL-2024-001', 30, 60, 90, 120, 150 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM TimingSchedule WHERE HOALicenseNumber='HOA-FL-2024-001');
INSERT INTO SystemSettings (HOALicenseNumber) SELECT 'HOA-FL-2024-001' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM SystemSettings WHERE HOALicenseNumber='HOA-FL-2024-001');
INSERT INTO FiscalYearSetup (MgtCoClientID, HOALicenseNumber, FiscalYearLabel, FiscalYearStartDate, FiscalYearEndDate, CurrentFiscalYearFlag, ClosedFlag, OperatorID)
SELECT 'MGTCO-001', 'HOA-FL-2024-001', 'FY2026', '2026-01-01', '2026-12-31', 'Y', 'N', 'SEED' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM FiscalYearSetup WHERE HOALicenseNumber='HOA-FL-2024-001' AND CurrentFiscalYearFlag='Y');
