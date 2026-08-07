const db = require('./db');

// =============================================================
// W M+ SETTINGS — COMPLETE SCHEMA MIGRATION
// Creates all tables needed for the Settings pages if they
// do not already exist. Safe to re-run (idempotent).
// =============================================================

async function tableExists(name) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [name]
  );
  return rows[0].cnt > 0;
}

async function runMigration() {
  try {
    console.log('\n🔄 Starting W M+ Settings complete schema migration...\n');

    // ─────────────────────────────────────────────────────────
    // 1. BankAccount  (Banking / Fiscal Year Setup page)
    // ─────────────────────────────────────────────────────────
    if (!(await tableExists('BankAccount'))) {
      console.log('➕ Creating table BankAccount...');
      await db.query(`
        CREATE TABLE BankAccount (
          BankAccountID   INT AUTO_INCREMENT PRIMARY KEY,
          BankType        VARCHAR(30)      NOT NULL DEFAULT '',
          BankName        VARCHAR(100)     NOT NULL DEFAULT '',
          BankID          VARCHAR(10)      NOT NULL DEFAULT '',
          ActiveFlag      CHAR(1)          NOT NULL DEFAULT 'Y',
          CheckMode       VARCHAR(20)      NOT NULL DEFAULT 'None',
          StartCheckNumber VARCHAR(20)     NOT NULL DEFAULT '',
          GLCashAccount   VARCHAR(10)      NOT NULL DEFAULT '',
          AccountNumber   VARCHAR(30)      NOT NULL DEFAULT '',
          RoutingNumber   CHAR(9)          NOT NULL DEFAULT '',
          StartingBalance DECIMAL(12,2)    NOT NULL DEFAULT 0.00,
          StartingMonth   VARCHAR(15)      NOT NULL DEFAULT 'January',
          ContactPerson   VARCHAR(100)     NOT NULL DEFAULT '',
          ContactTel      VARCHAR(25)      NOT NULL DEFAULT '',
          ContactEmail    VARCHAR(100)     NOT NULL DEFAULT '',
          CoMingled       CHAR(1)          NOT NULL DEFAULT 'N',
          CoMingledWith   VARCHAR(30)      NOT NULL DEFAULT '',
          Notes           VARCHAR(1000)    NOT NULL DEFAULT '',
          TimeStampCreated  DATETIME       DEFAULT NOW(),
          TimeStampUpdated  DATETIME       DEFAULT NOW()
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('✅ BankAccount created.');

      // Seed default bank rows
      const defaultBanks = [
        ['Operating', 'Bank of America', '101', 'Y', 'System', '1001', '1010'],
        ['Capital',   'Bank of America', '201', 'Y', 'None',   '',     '1010'],
        ['Escrow',    'Wells Fargo',      '301', 'Y', 'Manual', '9001', '1020'],
        ['Money Market', 'Truist',        '401', 'Y', 'None',   '',     '1010'],
        ['Savings',   'First Citizens',   '451', 'Y', 'None',   '',     '1010'],
        ['CD',        'Synovus',          '501', 'Y', 'None',   '',     '1010']
      ];
      for (const [type, name, id, active, checkMode, startCheck, gl] of defaultBanks) {
        await db.query(`
          INSERT INTO BankAccount (BankType, BankName, BankID, ActiveFlag, CheckMode, StartCheckNumber, GLCashAccount)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [type, name, id, active, checkMode, startCheck, gl]);
      }
      console.log('🌱 Seeded 6 default bank accounts.');
    } else {
      console.log('ℹ️  Table BankAccount already exists.');
    }

    // ─────────────────────────────────────────────────────────
    // 2. FiscalYearSetup  (Banking page — Fiscal Setup row)
    // ─────────────────────────────────────────────────────────
    if (!(await tableExists('FiscalYearSetup'))) {
      console.log('➕ Creating table FiscalYearSetup...');
      await db.query(`
        CREATE TABLE FiscalYearSetup (
          FiscalYearSetupID         INT AUTO_INCREMENT PRIMARY KEY,
          OpeningRetainedEarnings   DECIMAL(14,2) DEFAULT 0.00,
          EndingRetainedEarnings    DECIMAL(14,2) DEFAULT 0.00,
          CurrentFiscalYearIncome   DECIMAL(14,2) DEFAULT 0.00,
          AccountsReceivable        DECIMAL(14,2) DEFAULT 0.00,
          AccountsPayable           DECIMAL(14,2) DEFAULT 0.00,
          InterestEarned            DECIMAL(14,2) DEFAULT 0.00,
          PreviousYearsEndingIncome DECIMAL(14,2) DEFAULT 0.00,
          MiscAssetEntry            DECIMAL(14,2) DEFAULT 0.00,
          MiscLiabilityEntry        DECIMAL(14,2) DEFAULT 0.00,
          Notes                     VARCHAR(1000) NOT NULL DEFAULT '',
          TimeStampUpdated          DATETIME      DEFAULT NOW()
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      await db.query(`INSERT INTO FiscalYearSetup (FiscalYearSetupID) VALUES (1)`);
      console.log('✅ FiscalYearSetup created and seeded.');
    } else {
      console.log('ℹ️  Table FiscalYearSetup already exists.');
    }

    // ─────────────────────────────────────────────────────────
    // 3. SystemSettings  (General System Programming page)
    // ─────────────────────────────────────────────────────────
    if (!(await tableExists('SystemSettings'))) {
      console.log('➕ Creating table SystemSettings...');
      await db.query(`
        CREATE TABLE SystemSettings (
          SystemSettingsID          INT AUTO_INCREMENT PRIMARY KEY,
          -- Printing
          PrintingMode              VARCHAR(20)    NOT NULL DEFAULT 'Local',
          PrinterName               VARCHAR(100)   NOT NULL DEFAULT '',
          WebPrinterID              VARCHAR(50)    NOT NULL DEFAULT '',
          NetworkAddress            VARCHAR(100)   NOT NULL DEFAULT '',
          PrintingNotes             VARCHAR(500)   NOT NULL DEFAULT '',
          -- Numbering
          ResidentStartingAcct      VARCHAR(6)     NOT NULL DEFAULT '',
          VendorStartingAcct        VARCHAR(4)     NOT NULL DEFAULT '',
          NumberingNotes            VARCHAR(500)   NOT NULL DEFAULT '',
          -- Street Names
          StreetNamesList           TEXT,
          DefaultCity               VARCHAR(50)    NOT NULL DEFAULT '',
          DefaultState              CHAR(2)        NOT NULL DEFAULT '',
          DefaultZip                VARCHAR(9)     NOT NULL DEFAULT '',
          StreetNamesNotes          VARCHAR(500)   NOT NULL DEFAULT '',
          -- WEB+
          WebPlusActive             CHAR(1)        NOT NULL DEFAULT 'N',
          WebPageIPName             VARCHAR(100)   NOT NULL DEFAULT '',
          WebPageManager            VARCHAR(100)   NOT NULL DEFAULT '',
          WebManagerContact         VARCHAR(100)   NOT NULL DEFAULT '',
          WebPlusNotes              VARCHAR(500)   NOT NULL DEFAULT '',
          -- CFO Manage
          CFOActive                 CHAR(1)        NOT NULL DEFAULT 'N',
          CFOCompanyName            VARCHAR(100)   NOT NULL DEFAULT '',
          CFOAddress                VARCHAR(150)   NOT NULL DEFAULT '',
          CFOTel                    VARCHAR(25)    NOT NULL DEFAULT '',
          CFORepName                VARCHAR(100)   NOT NULL DEFAULT '',
          CFORepTel                 VARCHAR(25)    NOT NULL DEFAULT '',
          CFORepEmail               VARCHAR(100)   NOT NULL DEFAULT '',
          CFOVendorID               VARCHAR(10)    NOT NULL DEFAULT '',
          CFONotes                  VARCHAR(500)   NOT NULL DEFAULT '',
          -- EasyPay
          EasyPayActive             CHAR(1)        NOT NULL DEFAULT 'N',
          FinesPaidFirst            CHAR(1)        NOT NULL DEFAULT 'N',
          ResidentPaysCharges       CHAR(1)        NOT NULL DEFAULT 'N',
          ACHActive                 CHAR(1)        NOT NULL DEFAULT 'N',
          EasyPayNotes              VARCHAR(500)   NOT NULL DEFAULT '',
          -- Estoppel
          ResidentEstoppelFee       DECIMAL(10,2)  NOT NULL DEFAULT 300.00,
          EstoppelLetterCode        VARCHAR(10)    NOT NULL DEFAULT '99',
          PaidDirectlyToMgtCo       VARCHAR(5)     NOT NULL DEFAULT 'NO',
          PayableToHoaSentToMgt     VARCHAR(5)     NOT NULL DEFAULT 'NO',
          TransferWorkingCapitalFee DECIMAL(10,2)  NOT NULL DEFAULT 63.00,
          EstoppelNotes             VARCHAR(500)   NOT NULL DEFAULT '',
          TimeStampUpdated          DATETIME       DEFAULT NOW()
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      await db.query(`INSERT INTO SystemSettings (SystemSettingsID) VALUES (1)`);
      console.log('✅ SystemSettings created and seeded.');
    } else {
      console.log('ℹ️  Table SystemSettings already exists.');
    }

    // ─────────────────────────────────────────────────────────
    // 4. DuesProgramming  (Annual / Special Dues page)
    //    Two rows: one per section type
    // ─────────────────────────────────────────────────────────
    if (!(await tableExists('DuesProgramming'))) {
      console.log('➕ Creating table DuesProgramming...');
      await db.query(`
        CREATE TABLE DuesProgramming (
          DuesProgrammingID   INT AUTO_INCREMENT PRIMARY KEY,
          SectionType         VARCHAR(20)   NOT NULL DEFAULT '',
          PaymentFrequency    VARCHAR(20)   NOT NULL DEFAULT 'Annually',
          DueDate             VARCHAR(10)   NOT NULL DEFAULT '',
          TimeStampUpdated    DATETIME      DEFAULT NOW()
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      await db.query(`INSERT INTO DuesProgramming (SectionType) VALUES ('annualDues'), ('specialAssessment')`);
      console.log('✅ DuesProgramming created and seeded.');
    } else {
      console.log('ℹ️  Table DuesProgramming already exists.');
    }

    // ─────────────────────────────────────────────────────────
    // 5. DuesRates  (Dues rates per type per section)
    // ─────────────────────────────────────────────────────────
    if (!(await tableExists('DuesRates'))) {
      console.log('➕ Creating table DuesRates...');
      await db.query(`
        CREATE TABLE DuesRates (
          DuesRateID          INT AUTO_INCREMENT PRIMARY KEY,
          SectionType         VARCHAR(20)   NOT NULL DEFAULT '',
          RateType            VARCHAR(10)   NOT NULL DEFAULT '',
          CurrentRate         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          NextRate            DECIMAL(10,2) NOT NULL DEFAULT 0.00
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      const rateTypes = ['Type A','Type B','Type C','Type D','Type E','Type F','Type G','Type H','Type I','Type J'];
      const sections  = ['annualDues', 'specialAssessment'];
      for (const section of sections) {
        for (const type of rateTypes) {
          await db.query(
            `INSERT INTO DuesRates (SectionType, RateType) VALUES (?, ?)`,
            [section, type]
          );
        }
      }
      console.log('✅ DuesRates created and seeded (20 rows).');
    } else {
      console.log('ℹ️  Table DuesRates already exists.');
    }

    // ─────────────────────────────────────────────────────────
    // 6. FinesConfig  (Fines / Late Fees — Violation Fine Rules)
    // ─────────────────────────────────────────────────────────
    if (!(await tableExists('FinesConfig'))) {
      console.log('➕ Creating table FinesConfig...');
      await db.query(`
        CREATE TABLE FinesConfig (
          FinesConfigID   INT AUTO_INCREMENT PRIMARY KEY,
          RestartDays     INT            NOT NULL DEFAULT 0,
          FineAmount      DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
          TimeStampUpdated DATETIME      DEFAULT NOW()
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      await db.query(`INSERT INTO FinesConfig (FinesConfigID) VALUES (1)`);
      console.log('✅ FinesConfig created and seeded.');
    } else {
      console.log('ℹ️  Table FinesConfig already exists.');
    }

    // ─────────────────────────────────────────────────────────
    // 7. FineTypesList  (Timed and Immediate violation rows)
    // ─────────────────────────────────────────────────────────
    if (!(await tableExists('FineTypesList'))) {
      console.log('➕ Creating table FineTypesList...');
      await db.query(`
        CREATE TABLE FineTypesList (
          FineTypesListID INT AUTO_INCREMENT PRIMARY KEY,
          FineCategory    VARCHAR(15)   NOT NULL DEFAULT 'timed',
          SortOrder       INT           NOT NULL DEFAULT 0,
          LetterCode      VARCHAR(10)   NOT NULL DEFAULT '',
          ViolationType   VARCHAR(200)  NOT NULL DEFAULT '',
          GLCode          VARCHAR(10)   NOT NULL DEFAULT '',
          FineAmount      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          ActiveFlag      CHAR(1)       NOT NULL DEFAULT 'Y'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      const timedDefaults = [
        ['1','CONST OVERDUE COMPLETION VIOLATION LETTER','4811','0.00'],
        ['2','GARBAGE / RECYLING CONTAINER','9305','0.00'],
        ['3','YARD DEBRIS','9305','0.00'],
        ['4','VEHICLE PARKED OVERNIGHT ON ROAD','9305','0.00'],
        ['5','CURB DEBRIS PLACED ON WRONG DAY','9305','0.00'],
        ['6','NUISANCE PETS','9305','0.00'],
        ['7','FAILURE TO PICK UP PET WASTE','9305','0.00'],
        ['8','STREET / SIDE WALK PARKING BLOCKING TRAFFIC','9305','0.00'],
        ['9','DOG BARKING','9305','0.00'],
        ['10','HOME STRUCTURE APPEARNCE','9305','0.00'],
        ['11','LAWN / SHRUB / LANDSCAPE APPEARANCE','9305','0.00'],
        ['12','FENCING / STOREAGE UNITS / MAINTENANCE','9305','0.00'],
        ['13','EXCESSIVE HOUSING OVERCROWDING','9305','0.00'],
        ['14','UNLICENSED VEHICLE STORAGE','9305','0.00'],
        ['15','UNAUTHORIZED SIGNAGE','9305','0.00'],
        ['16','ANTENNA','9305','0.00'],
        ['17','HOME OFFICE BUSINESS','9305','0.00']
      ];
      const immediateDefaults = [
        ['1','RV, TRAILER, BOAT PARKED OVERNIGHT','9305','50.00'],
        ['2','COMMERCIAL VEHICLE PARKED OVERNIGHT','9305','125.00'],
        ['3','UNAUTHORIZED TREE CUTTING','9305','250.00'],
        ['4','COMMERCIAL DEBRIS ON CURB','9305','115.00'],
        ['5','UNAUTHORIZED HOME ALTERATIONS','9305','250.00'],
        ['6','VEHICLE SPEEDING','9305','150.00'],
        ['7','EXCESSIVE NOISE','9305','100.00'],
        ['8','ROWDY BEHAVIOR','9305','200.00'],
        ['9','WEAPONS / WEAPONS DISCHARGE','9305','500.00'],
        ['10','VANDALISM / PROPERTY DESTRUCTION','9305','1500.00'],
        ['11','RENTAL VIOLATION','9305','1000.00'],
        ['12','ARB / Construction Fine','4811','100.00'],
        ['13','VARIOUS','9305','100.00']
      ];
      for (const [idx, [code, type, gl, amount]] of timedDefaults.entries()) {
        await db.query(
          `INSERT INTO FineTypesList (FineCategory, SortOrder, LetterCode, ViolationType, GLCode, FineAmount) VALUES (?, ?, ?, ?, ?, ?)`,
          ['timed', idx, code, type, gl, parseFloat(amount)]
        );
      }
      for (const [idx, [code, type, gl, amount]] of immediateDefaults.entries()) {
        await db.query(
          `INSERT INTO FineTypesList (FineCategory, SortOrder, LetterCode, ViolationType, GLCode, FineAmount) VALUES (?, ?, ?, ?, ?, ?)`,
          ['immediate', idx, code, type, gl, parseFloat(amount)]
        );
      }
      console.log('✅ FineTypesList created and seeded (17 timed + 13 immediate rows).');
    } else {
      console.log('ℹ️  Table FineTypesList already exists.');
    }

    // ─────────────────────────────────────────────────────────
    // 8. LetterRules  (Arrears, Annual Dues, Special Assessment)
    // ─────────────────────────────────────────────────────────
    if (!(await tableExists('LetterRules'))) {
      console.log('➕ Creating table LetterRules...');
      await db.query(`
        CREATE TABLE LetterRules (
          LetterRulesID   INT AUTO_INCREMENT PRIMARY KEY,
          RuleType        VARCHAR(30)   NOT NULL DEFAULT '',
          Letter1Amount   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          Letter1PercentYN CHAR(1)      NOT NULL DEFAULT 'N',
          Letter1Percent  DECIMAL(6,2)  NOT NULL DEFAULT 0.00,
          Letter1GL       VARCHAR(10)   NOT NULL DEFAULT '',
          Letter2Amount   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          Letter2PercentYN CHAR(1)      NOT NULL DEFAULT 'N',
          Letter2Percent  DECIMAL(6,2)  NOT NULL DEFAULT 0.00,
          Letter2GL       VARCHAR(10)   NOT NULL DEFAULT '',
          FinalAmount     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          FinalGL         VARCHAR(10)   NOT NULL DEFAULT '',
          TimeStampUpdated DATETIME     DEFAULT NOW()
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      const ruleDefaults = [
        ['arrearsRules', '72', '73', '74'],
        ['annualDuesLateFees', '62', '63', '64'],
        ['specialAssessmentLateFees', '52', '53', '54']
      ];
      for (const [ruleType, gl1, gl2, glFinal] of ruleDefaults) {
        await db.query(
          `INSERT INTO LetterRules (RuleType, Letter1GL, Letter2GL, FinalGL) VALUES (?, ?, ?, ?)`,
          [ruleType, gl1, gl2, glFinal]
        );
      }
      console.log('✅ LetterRules created and seeded (3 rule rows).');
    } else {
      console.log('ℹ️  Table LetterRules already exists.');
    }

    // ─────────────────────────────────────────────────────────
    // 9. TimingSchedule  (single row)
    // ─────────────────────────────────────────────────────────
    if (!(await tableExists('TimingSchedule'))) {
      console.log('➕ Creating table TimingSchedule...');
      await db.query(`
        CREATE TABLE TimingSchedule (
          TimingScheduleID  INT AUTO_INCREMENT PRIMARY KEY,
          Warning1Days      INT NOT NULL DEFAULT 30,
          Warning2Days      INT NOT NULL DEFAULT 60,
          Collection1Days   INT NOT NULL DEFAULT 90,
          Collection2Days   INT NOT NULL DEFAULT 120,
          FinalDays         INT NOT NULL DEFAULT 150,
          TimeStampUpdated  DATETIME DEFAULT NOW()
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      await db.query(`INSERT INTO TimingSchedule (TimingScheduleID) VALUES (1)`);
      console.log('✅ TimingSchedule created and seeded.');
    } else {
      console.log('ℹ️  Table TimingSchedule already exists.');
    }

    // ─────────────────────────────────────────────────────────
    // 10. GLAccounts  (GL Mapping page)
    //     Large reference table — system-locked rows + user rows
    // ─────────────────────────────────────────────────────────
    if (!(await tableExists('GLAccounts'))) {
      console.log('➕ Creating table GLAccounts...');
      await db.query(`
        CREATE TABLE GLAccounts (
          GLAccountID           INT AUTO_INCREMENT PRIMARY KEY,
          GLNumber              VARCHAR(20)   NOT NULL DEFAULT '',
          GLName                VARCHAR(200)  NOT NULL DEFAULT '',
          SourceTable           VARCHAR(50)   NOT NULL DEFAULT '',
          Description           VARCHAR(500)  NOT NULL DEFAULT '',
          BankType              VARCHAR(30)   NOT NULL DEFAULT '',
          BankID                VARCHAR(30)   NOT NULL DEFAULT '',
          PC                    CHAR(1)       NOT NULL DEFAULT 'P',
          ParentGL              VARCHAR(20)   NOT NULL DEFAULT '',
          ConsolidatedParentGL  VARCHAR(20)   NOT NULL DEFAULT '',
          DC                    CHAR(1)       NOT NULL DEFAULT 'D',
          AR                    CHAR(1)       NOT NULL DEFAULT 'A',
          EffectiveDate         VARCHAR(10)   NOT NULL DEFAULT '',
          CreatedBy             VARCHAR(50)   NOT NULL DEFAULT 'SYSTEM',
          CreatedDate           VARCHAR(10)   NOT NULL DEFAULT '',
          LastEditedBy          VARCHAR(50)   NOT NULL DEFAULT '',
          SystemLocked          TINYINT(1)    NOT NULL DEFAULT 0,
          ActiveFlag            CHAR(1)       NOT NULL DEFAULT 'Y',
          SortOrder             INT           NOT NULL DEFAULT 0,
          TimeStampCreated      DATETIME      DEFAULT NOW(),
          TimeStampUpdated      DATETIME      DEFAULT NOW()
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('✅ GLAccounts table created.');
      console.log('ℹ️  GL default rows should be seeded separately via the GL Mapping component defaults (90 KB of data — run seed-gl-accounts.js).');
    } else {
      console.log('ℹ️  Table GLAccounts already exists.');
    }

    console.log('\n🎉 All Settings tables migration completed successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
