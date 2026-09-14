-- seed catalog copies per HOA (desde set HOA-FL-2024-001). Reversible:
-- DELETE FROM <t> WHERE HOALicenseNumber LIKE 'LIC-HOA%';
USE hoamanager26_dev;

INSERT INTO DuesRates (SectionType, RateType, CurrentRate, NextRate, HOALicenseNumber)
SELECT SectionType, RateType, CurrentRate, NextRate, 'LIC-HOA1' FROM DuesRates
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM DuesRates AS x WHERE x.HOALicenseNumber='LIC-HOA1' LIMIT 1);
INSERT INTO DuesRates (SectionType, RateType, CurrentRate, NextRate, HOALicenseNumber)
SELECT SectionType, RateType, CurrentRate, NextRate, 'LIC-HOA2' FROM DuesRates
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM DuesRates AS x WHERE x.HOALicenseNumber='LIC-HOA2' LIMIT 1);
INSERT INTO DuesRates (SectionType, RateType, CurrentRate, NextRate, HOALicenseNumber)
SELECT SectionType, RateType, CurrentRate, NextRate, 'LIC-HOA3' FROM DuesRates
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM DuesRates AS x WHERE x.HOALicenseNumber='LIC-HOA3' LIMIT 1);
INSERT INTO DuesRates (SectionType, RateType, CurrentRate, NextRate, HOALicenseNumber)
SELECT SectionType, RateType, CurrentRate, NextRate, 'LIC-HOA4' FROM DuesRates
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM DuesRates AS x WHERE x.HOALicenseNumber='LIC-HOA4' LIMIT 1);
INSERT INTO DuesRates (SectionType, RateType, CurrentRate, NextRate, HOALicenseNumber)
SELECT SectionType, RateType, CurrentRate, NextRate, 'LIC-HOA5' FROM DuesRates
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM DuesRates AS x WHERE x.HOALicenseNumber='LIC-HOA5' LIMIT 1);
INSERT INTO DuesRates (SectionType, RateType, CurrentRate, NextRate, HOALicenseNumber)
SELECT SectionType, RateType, CurrentRate, NextRate, 'LIC-HOA6' FROM DuesRates
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM DuesRates AS x WHERE x.HOALicenseNumber='LIC-HOA6' LIMIT 1);

INSERT INTO FineTypesList (FineCategory, SortOrder, LetterCode, ViolationType, GLCode, FineAmount, ActiveFlag, HOALicenseNumber)
SELECT FineCategory, SortOrder, LetterCode, ViolationType, GLCode, FineAmount, ActiveFlag, 'LIC-HOA1' FROM FineTypesList
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM FineTypesList AS x WHERE x.HOALicenseNumber='LIC-HOA1' LIMIT 1);
INSERT INTO FineTypesList (FineCategory, SortOrder, LetterCode, ViolationType, GLCode, FineAmount, ActiveFlag, HOALicenseNumber)
SELECT FineCategory, SortOrder, LetterCode, ViolationType, GLCode, FineAmount, ActiveFlag, 'LIC-HOA2' FROM FineTypesList
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM FineTypesList AS x WHERE x.HOALicenseNumber='LIC-HOA2' LIMIT 1);
INSERT INTO FineTypesList (FineCategory, SortOrder, LetterCode, ViolationType, GLCode, FineAmount, ActiveFlag, HOALicenseNumber)
SELECT FineCategory, SortOrder, LetterCode, ViolationType, GLCode, FineAmount, ActiveFlag, 'LIC-HOA3' FROM FineTypesList
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM FineTypesList AS x WHERE x.HOALicenseNumber='LIC-HOA3' LIMIT 1);
INSERT INTO FineTypesList (FineCategory, SortOrder, LetterCode, ViolationType, GLCode, FineAmount, ActiveFlag, HOALicenseNumber)
SELECT FineCategory, SortOrder, LetterCode, ViolationType, GLCode, FineAmount, ActiveFlag, 'LIC-HOA4' FROM FineTypesList
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM FineTypesList AS x WHERE x.HOALicenseNumber='LIC-HOA4' LIMIT 1);
INSERT INTO FineTypesList (FineCategory, SortOrder, LetterCode, ViolationType, GLCode, FineAmount, ActiveFlag, HOALicenseNumber)
SELECT FineCategory, SortOrder, LetterCode, ViolationType, GLCode, FineAmount, ActiveFlag, 'LIC-HOA5' FROM FineTypesList
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM FineTypesList AS x WHERE x.HOALicenseNumber='LIC-HOA5' LIMIT 1);
INSERT INTO FineTypesList (FineCategory, SortOrder, LetterCode, ViolationType, GLCode, FineAmount, ActiveFlag, HOALicenseNumber)
SELECT FineCategory, SortOrder, LetterCode, ViolationType, GLCode, FineAmount, ActiveFlag, 'LIC-HOA6' FROM FineTypesList
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM FineTypesList AS x WHERE x.HOALicenseNumber='LIC-HOA6' LIMIT 1);

INSERT INTO GLAccounts (GLNumber, GLName, SourceTable, Description, BankType, BankID, PC, ParentGL, ConsolidatedParentGL, DC, AR, EffectiveDate, CreatedBy, CreatedDate, LastEditedBy, SystemLocked, ActiveFlag, SortOrder, TimeStampCreated, TimeStampUpdated, UseInCR, UseInDP, UseInAPR, UseInBDC, UseInXFER, HOALicenseNumber)
SELECT GLNumber, GLName, SourceTable, Description, BankType, BankID, PC, ParentGL, ConsolidatedParentGL, DC, AR, EffectiveDate, CreatedBy, CreatedDate, LastEditedBy, SystemLocked, ActiveFlag, SortOrder, TimeStampCreated, TimeStampUpdated, UseInCR, UseInDP, UseInAPR, UseInBDC, UseInXFER, 'LIC-HOA1' FROM GLAccounts
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM GLAccounts AS x WHERE x.HOALicenseNumber='LIC-HOA1' LIMIT 1);
INSERT INTO GLAccounts (GLNumber, GLName, SourceTable, Description, BankType, BankID, PC, ParentGL, ConsolidatedParentGL, DC, AR, EffectiveDate, CreatedBy, CreatedDate, LastEditedBy, SystemLocked, ActiveFlag, SortOrder, TimeStampCreated, TimeStampUpdated, UseInCR, UseInDP, UseInAPR, UseInBDC, UseInXFER, HOALicenseNumber)
SELECT GLNumber, GLName, SourceTable, Description, BankType, BankID, PC, ParentGL, ConsolidatedParentGL, DC, AR, EffectiveDate, CreatedBy, CreatedDate, LastEditedBy, SystemLocked, ActiveFlag, SortOrder, TimeStampCreated, TimeStampUpdated, UseInCR, UseInDP, UseInAPR, UseInBDC, UseInXFER, 'LIC-HOA2' FROM GLAccounts
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM GLAccounts AS x WHERE x.HOALicenseNumber='LIC-HOA2' LIMIT 1);
INSERT INTO GLAccounts (GLNumber, GLName, SourceTable, Description, BankType, BankID, PC, ParentGL, ConsolidatedParentGL, DC, AR, EffectiveDate, CreatedBy, CreatedDate, LastEditedBy, SystemLocked, ActiveFlag, SortOrder, TimeStampCreated, TimeStampUpdated, UseInCR, UseInDP, UseInAPR, UseInBDC, UseInXFER, HOALicenseNumber)
SELECT GLNumber, GLName, SourceTable, Description, BankType, BankID, PC, ParentGL, ConsolidatedParentGL, DC, AR, EffectiveDate, CreatedBy, CreatedDate, LastEditedBy, SystemLocked, ActiveFlag, SortOrder, TimeStampCreated, TimeStampUpdated, UseInCR, UseInDP, UseInAPR, UseInBDC, UseInXFER, 'LIC-HOA3' FROM GLAccounts
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM GLAccounts AS x WHERE x.HOALicenseNumber='LIC-HOA3' LIMIT 1);
INSERT INTO GLAccounts (GLNumber, GLName, SourceTable, Description, BankType, BankID, PC, ParentGL, ConsolidatedParentGL, DC, AR, EffectiveDate, CreatedBy, CreatedDate, LastEditedBy, SystemLocked, ActiveFlag, SortOrder, TimeStampCreated, TimeStampUpdated, UseInCR, UseInDP, UseInAPR, UseInBDC, UseInXFER, HOALicenseNumber)
SELECT GLNumber, GLName, SourceTable, Description, BankType, BankID, PC, ParentGL, ConsolidatedParentGL, DC, AR, EffectiveDate, CreatedBy, CreatedDate, LastEditedBy, SystemLocked, ActiveFlag, SortOrder, TimeStampCreated, TimeStampUpdated, UseInCR, UseInDP, UseInAPR, UseInBDC, UseInXFER, 'LIC-HOA4' FROM GLAccounts
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM GLAccounts AS x WHERE x.HOALicenseNumber='LIC-HOA4' LIMIT 1);
INSERT INTO GLAccounts (GLNumber, GLName, SourceTable, Description, BankType, BankID, PC, ParentGL, ConsolidatedParentGL, DC, AR, EffectiveDate, CreatedBy, CreatedDate, LastEditedBy, SystemLocked, ActiveFlag, SortOrder, TimeStampCreated, TimeStampUpdated, UseInCR, UseInDP, UseInAPR, UseInBDC, UseInXFER, HOALicenseNumber)
SELECT GLNumber, GLName, SourceTable, Description, BankType, BankID, PC, ParentGL, ConsolidatedParentGL, DC, AR, EffectiveDate, CreatedBy, CreatedDate, LastEditedBy, SystemLocked, ActiveFlag, SortOrder, TimeStampCreated, TimeStampUpdated, UseInCR, UseInDP, UseInAPR, UseInBDC, UseInXFER, 'LIC-HOA5' FROM GLAccounts
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM GLAccounts AS x WHERE x.HOALicenseNumber='LIC-HOA5' LIMIT 1);
INSERT INTO GLAccounts (GLNumber, GLName, SourceTable, Description, BankType, BankID, PC, ParentGL, ConsolidatedParentGL, DC, AR, EffectiveDate, CreatedBy, CreatedDate, LastEditedBy, SystemLocked, ActiveFlag, SortOrder, TimeStampCreated, TimeStampUpdated, UseInCR, UseInDP, UseInAPR, UseInBDC, UseInXFER, HOALicenseNumber)
SELECT GLNumber, GLName, SourceTable, Description, BankType, BankID, PC, ParentGL, ConsolidatedParentGL, DC, AR, EffectiveDate, CreatedBy, CreatedDate, LastEditedBy, SystemLocked, ActiveFlag, SortOrder, TimeStampCreated, TimeStampUpdated, UseInCR, UseInDP, UseInAPR, UseInBDC, UseInXFER, 'LIC-HOA6' FROM GLAccounts
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM GLAccounts AS x WHERE x.HOALicenseNumber='LIC-HOA6' LIMIT 1);

INSERT INTO LetterRules (RuleType, Letter1Amount, Letter1PercentYN, Letter1Percent, Letter1GL, Letter2Amount, Letter2PercentYN, Letter2Percent, Letter2GL, FinalAmount, FinalGL, TimeStampUpdated, HOALicenseNumber)
SELECT RuleType, Letter1Amount, Letter1PercentYN, Letter1Percent, Letter1GL, Letter2Amount, Letter2PercentYN, Letter2Percent, Letter2GL, FinalAmount, FinalGL, TimeStampUpdated, 'LIC-HOA1' FROM LetterRules
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM LetterRules AS x WHERE x.HOALicenseNumber='LIC-HOA1' LIMIT 1);
INSERT INTO LetterRules (RuleType, Letter1Amount, Letter1PercentYN, Letter1Percent, Letter1GL, Letter2Amount, Letter2PercentYN, Letter2Percent, Letter2GL, FinalAmount, FinalGL, TimeStampUpdated, HOALicenseNumber)
SELECT RuleType, Letter1Amount, Letter1PercentYN, Letter1Percent, Letter1GL, Letter2Amount, Letter2PercentYN, Letter2Percent, Letter2GL, FinalAmount, FinalGL, TimeStampUpdated, 'LIC-HOA2' FROM LetterRules
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM LetterRules AS x WHERE x.HOALicenseNumber='LIC-HOA2' LIMIT 1);
INSERT INTO LetterRules (RuleType, Letter1Amount, Letter1PercentYN, Letter1Percent, Letter1GL, Letter2Amount, Letter2PercentYN, Letter2Percent, Letter2GL, FinalAmount, FinalGL, TimeStampUpdated, HOALicenseNumber)
SELECT RuleType, Letter1Amount, Letter1PercentYN, Letter1Percent, Letter1GL, Letter2Amount, Letter2PercentYN, Letter2Percent, Letter2GL, FinalAmount, FinalGL, TimeStampUpdated, 'LIC-HOA3' FROM LetterRules
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM LetterRules AS x WHERE x.HOALicenseNumber='LIC-HOA3' LIMIT 1);
INSERT INTO LetterRules (RuleType, Letter1Amount, Letter1PercentYN, Letter1Percent, Letter1GL, Letter2Amount, Letter2PercentYN, Letter2Percent, Letter2GL, FinalAmount, FinalGL, TimeStampUpdated, HOALicenseNumber)
SELECT RuleType, Letter1Amount, Letter1PercentYN, Letter1Percent, Letter1GL, Letter2Amount, Letter2PercentYN, Letter2Percent, Letter2GL, FinalAmount, FinalGL, TimeStampUpdated, 'LIC-HOA4' FROM LetterRules
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM LetterRules AS x WHERE x.HOALicenseNumber='LIC-HOA4' LIMIT 1);
INSERT INTO LetterRules (RuleType, Letter1Amount, Letter1PercentYN, Letter1Percent, Letter1GL, Letter2Amount, Letter2PercentYN, Letter2Percent, Letter2GL, FinalAmount, FinalGL, TimeStampUpdated, HOALicenseNumber)
SELECT RuleType, Letter1Amount, Letter1PercentYN, Letter1Percent, Letter1GL, Letter2Amount, Letter2PercentYN, Letter2Percent, Letter2GL, FinalAmount, FinalGL, TimeStampUpdated, 'LIC-HOA5' FROM LetterRules
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM LetterRules AS x WHERE x.HOALicenseNumber='LIC-HOA5' LIMIT 1);
INSERT INTO LetterRules (RuleType, Letter1Amount, Letter1PercentYN, Letter1Percent, Letter1GL, Letter2Amount, Letter2PercentYN, Letter2Percent, Letter2GL, FinalAmount, FinalGL, TimeStampUpdated, HOALicenseNumber)
SELECT RuleType, Letter1Amount, Letter1PercentYN, Letter1Percent, Letter1GL, Letter2Amount, Letter2PercentYN, Letter2Percent, Letter2GL, FinalAmount, FinalGL, TimeStampUpdated, 'LIC-HOA6' FROM LetterRules
WHERE HOALicenseNumber='HOA-FL-2024-001'
  AND NOT EXISTS (SELECT 1 FROM LetterRules AS x WHERE x.HOALicenseNumber='LIC-HOA6' LIMIT 1);
