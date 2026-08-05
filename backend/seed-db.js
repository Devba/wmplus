const db = require('./db');

async function seedPascalTables() {
  try {
    console.log('Seeding ResidentMaster...');
    await db.query(`
      INSERT INTO ResidentMaster (
        ResidentAccountID, FirstName, LastName, DisplayName, ResidenceAddress, BillingAddress,
        City, StateCode, ZipCode, PrimaryPhone, PrimaryCell, EmailAddress, MoveInDate,
        ResidentType, OwnerFlag, ActiveResidentFlag, ACHFlag, AnnualDuesRate, AnnualDues,
        AnnualDuesPaidYTD, AnnualDuesBalance, MgtCoClientID, HOALicenseNumber, OperatorID, TimeStampCreated
      ) VALUES 
      ('RES-001', 'James', 'Mitchell', 'James Mitchell', '8901 Palm Vista Cir #101', '8901 Palm Vista Cir #101', 'Miami', 'FL', '33156', '305-555-3001', '786-555-3001', 'james.mitchell@email.com', '2019-03-15', 'Owner', 'Y', 'Y', 'Y', 3600.00, 3600.00, 3600.00, 0.00, 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW()),
      ('RES-002', 'Sofia', 'Rodriguez', 'Sofia Rodriguez', '8901 Palm Vista Cir #102', '8901 Palm Vista Cir #102', 'Miami', 'FL', '33156', '305-555-3002', '786-555-3002', 'sofia.rodriguez@email.com', '2020-06-01', 'Owner', 'Y', 'Y', 'N', 3600.00, 3600.00, 1800.00, 1800.00, 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW()),
      ('RES-003', 'William', 'Chen', 'William Chen', '8901 Palm Vista Cir #103', '8901 Palm Vista Cir #103', 'Miami', 'FL', '33156', '305-555-3003', '786-555-3003', 'william.chen@email.com', '2018-01-10', 'Owner', 'Y', 'Y', 'Y', 3600.00, 3600.00, 3600.00, 0.00, 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW()),
      ('RES-004', 'Amanda', 'Foster', 'Amanda Foster', '8901 Palm Vista Cir #104', 'PO Box 44512', 'Miami', 'FL', '33156', '305-555-3004', '786-555-3004', 'amanda.foster@email.com', '2021-09-20', 'Owner', 'Y', 'Y', 'N', 3600.00, 3600.00, 2700.00, 900.00, 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW()),
      ('RES-005', 'Robert', 'Patel', 'Robert Patel', '8901 Palm Vista Cir #201', '8901 Palm Vista Cir #201', 'Miami', 'FL', '33156', '305-555-3005', '786-555-3005', 'robert.patel@email.com', '2017-11-05', 'Owner', 'Y', 'Y', 'Y', 3600.00, 3600.00, 3600.00, 0.00, 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW())
      ON DUPLICATE KEY UPDATE TimeStampUpdated=NOW()
    `);

    console.log('Seeding VendorMaster...');
    await db.query(`
      INSERT INTO VendorMaster (
        VendorID, VendorName, AddressLine1, City, StateCode, ZipCode, PrimaryPhone, EmailAddress, ContactName, VendorType, TaxID, DefaultGLNumber, ActiveFlag, MgtCoClientID, HOALicenseNumber, OperatorID, TimeStampCreated
      ) VALUES
      ('VEND-001', 'GreenScape Landscaping Inc', '7700 NW 42nd St', 'Miami', 'FL', '33166', '305-555-2001', 'billing@greenscape.com', 'Miguel Torres', 'Landscaping', '65-1234567', 5030, 'Y', 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW()),
      ('VEND-002', 'AquaClear Pool Services', '3300 S Dixie Hwy', 'Miami', 'FL', '33133', '305-555-2002', 'service@aquaclear.com', 'Jenny Liu', 'Pool', '65-2345678', 5040, 'Y', 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW()),
      ('VEND-003', 'Shield Guard Security LLC', '1500 NE 163rd St', 'North Miami', 'FL', '33162', '305-555-2003', 'ops@shieldguard.com', 'Marcus Brown', 'Security', '65-3456789', 5110, 'Y', 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW()),
      ('VEND-004', 'Tropical Pest Solutions', '900 W Flagler St', 'Miami', 'FL', '33130', '305-555-2004', 'info@tropicalpest.com', 'Ana Delgado', 'Pest Control', '65-4567890', 5050, 'Y', 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW()),
      ('VEND-005', 'Elite Elevator Corp', '2100 Ponce de Leon Blvd', 'Coral Gables', 'FL', '33134', '305-555-2005', 'maintenance@eliteelevator.com', 'David Kim', 'Elevator', '65-5678901', 5120, 'Y', 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW())
      ON DUPLICATE KEY UPDATE TimeStampUpdated=NOW()
    `);

    console.log('Seeding HOAProfile...');
    await db.query(`
      INSERT INTO HOAProfile (
        ProfileID, MgtCoClientID, HOALicenseNumber, HOAName, AddressLine1, City, StateCode, ZipCode, ContactName, ContactPhone, ContactEmail, ActiveFlag, OperatorID, TimeStampCreated
      ) VALUES
      (1, 'MGTCO-001', 'HOA-FL-2024-001', 'Palm Vista Estates HOA', '8901 Palm Vista Circle', 'Miami', 'FL', '33156', 'Maria Gonzalez', '305-555-4001', 'board@palmvista.com', 'Y', 'SYSTEM', NOW())
      ON DUPLICATE KEY UPDATE HOAName='Palm Vista Estates HOA', ContactName='Maria Gonzalez', ContactEmail='board@palmvista.com'
    `);

    console.log('Seeding CheckRegister...');
    await db.query(`
      INSERT INTO CheckRegister (
        CheckTransactionNumber, CheckNumber, GLAccountName, Amount, DateCheckIssued, DateCheckCleared, MonthCleared, GLNumber, VendorResidentID, VendorInvoiceNumber, VendorInvoiceDate, VendorInvoiceAmount, CheckNotation, BankAccount, BankAccountID, Status, MgtCoClientID, HOALicenseNumber, OperatorID, TimeStampCreated
      ) VALUES
      ('CR-2026-00001', '10001', 'Management Fee Expense', 4500.00, '2026-01-05', '2026-01-09', 1, 5000, 'MGTCO-001', 'INV-MGT-2601', '2026-01-01', 4500.00, 'Jan 2026 management fee', 'Operating', 1, 'Cleared', 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW()),
      ('CR-2026-00002', '10002', 'Landscaping & Grounds', 2800.00, '2026-01-10', '2026-01-14', 1, 5030, 'VEND-001', 'GS-26001', '2026-01-01', 2800.00, 'Jan lawn and grounds maint', 'Operating', 1, 'Cleared', 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW()),
      ('CR-2026-00003', '10003', 'Pool Maintenance', 850.00, '2026-01-10', '2026-01-15', 1, 5040, 'VEND-002', 'AQ-26001', '2026-01-01', 850.00, 'Jan pool service', 'Operating', 1, 'Cleared', 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW())
      ON DUPLICATE KEY UPDATE TimeStampUpdated=NOW()
    `);

    console.log('Seeding DepositRegister...');
    await db.query(`
      INSERT INTO DepositRegister (
        DepositTransactionNumber, DepositorAccountName, Amount, BankAccountName, BankAccountID, GLAccountName, GLNumber, DateDeposited, DateCleared, MonthCleared, ResidentAccountID, DepositNotation, Status, MgtCoClientID, HOALicenseNumber, OperatorID, TimeStampCreated
      ) VALUES
      ('DP-2026-00001', 'James Mitchell', 900.00, 'Operating', 1, 'Annual Assessment Revenue', 4000, '2026-01-02', '2026-01-05', 1, 'RES-001', 'Q1 annual assessment - ACH', 'Cleared', 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW()),
      ('DP-2026-00002', 'Sofia Rodriguez', 900.00, 'Operating', 1, 'Annual Assessment Revenue', 4000, '2026-01-05', '2026-01-08', 1, 'RES-002', 'Q1 annual assessment - check', 'Cleared', 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW()),
      ('DP-2026-00003', 'William Chen', 900.00, 'Operating', 1, 'Annual Assessment Revenue', 4000, '2026-01-02', '2026-01-05', 1, 'RES-003', 'Q1 annual assessment - ACH', 'Cleared', 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW())
      ON DUPLICATE KEY UPDATE TimeStampUpdated=NOW()
    `);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedPascalTables();
