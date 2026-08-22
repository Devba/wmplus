-- ============================================================================
-- BORRADOR DDL — APR / Assessment Register
-- W M+ Management System
-- Estado: DRAFT para revisión y uso posterior. NO EJECUTAR en producción
--          hasta aprobación de Rick & Hal (V3 §13/§14).
-- Autor: José  |  Fecha borrador: 2026-08-21 (rev. 2026-08-21: refinamientos Rick & Hal)
--
-- Refinamientos acordados (respuesta Rick & Hal 2026-08-21):
--   - Modelo unificado ACEPTADO: AssessmentRegister + AssessmentRegisterPeriod
--     + VIEWS Monthly_/SEMI_/QTRLY_/YRLY_ (DRAFT previo validado, tablas vacías)
--   - Principio explícito: tablas PERSISTIDAS, MANTENIDAS INCREMENTALMENTE.
--     Un APR posting actualiza SOLO el residente afectado.
--     Recalculate/Rebuild = utilidad de reconciliación/reparación/auditoría (excepción).
--     Mismo principio aplica a Cash Flow (posting incremental; rebuild = excepción).
--   - Identidad refinada: (Tenant/HOA + ResidentAccountID + FiscalYear + Frequency)
--     -> MgtCoClientID + HOALicenseNumber + ResidentAccountID + CurrentFiscalYearBegins + Frequency
--   - ResidentCreditBalance en ResidentMaster ACEPTADO.
--   - Banking: Annual Dues bank default + SA bank(s) + validación SA requerida ACEPTADO.
--   - Single-type-per-APR-row (AnnualDues vs SpecialAssessment) ACEPTADO.
--   - Fase 1 ampliada: CR→CF + DP→CF + APR→AssmtRegisters→CF deben postear a Cash Flow
--     para verificación en BD antes de entregar a Alex. Motor electrónico = Fase 2.
--
-- Alcance de este borrador:
--   Fase 1 (registros de assessment, acordado):
--     - AssessmentRegister          (tabla unificada de agregados, identidad refinada)
--     - AssessmentRegisterPeriod    (hija normalizada por periodo, identidad refinada)
--     - VIEWS de compatibilidad     (Monthly_/SEMI_/QTRLY_/YRLY_)
--   Fase 2 (borrador tentativo, por confirmar en V3 §13):
--     - AssessmentPaymentRegister   (tabla de transacciones, fuente de verdad)
--     - ElectronicPaymentRegister / ElectronicPaymentAllocation
--     - ALTER ResidentMaster (ResidentCreditBalance)
-- ============================================================================


-- ============================================================================
-- FASE 1 — REGISTROS DE ASSESSMENT (unificado + vistas)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) AssessmentRegister — UNA fila por (Tenant/HOA + ResidentAccountID + FiscalYear + Frequency)
--    Sustituye a Monthly_/QTRLY_/YRLY_AssmtRegister (que pasan a ser VIEWS).
--    Principio: tabla PERSISTIDA, MANTENIDA INCREMENTALMENTE (no recalcular desde
--    APR history en el flujo normal). Recalculate/Rebuild = utilidad de excepción.
-- ----------------------------------------------------------------------------
CREATE TABLE AssessmentRegister (
  AssmtRegID                       INT(11)      NOT NULL AUTO_INCREMENT,
  ResidentAccountID               VARCHAR(20)  NOT NULL,
  Frequency                       ENUM('Annually','Semi-Annually','Quarterly','Monthly') NOT NULL,
  LastName                        VARCHAR(100),
  ResidenceAddress                VARCHAR(150),
  RequiredPeriodicPayment         DECIMAL(14,2) DEFAULT 0,   -- unifica RequiredMonthly/Quarterly/Annual
  TotalYearlyRequiredAnnualDues   DECIMAL(14,2) DEFAULT 0,
  TotalAnnualDuesPaymentsYTD      DECIMAL(14,2) DEFAULT 0,
  CurrentAssessmentPaymentDue     DECIMAL(14,2) DEFAULT 0,
  AssessmentPaidBalanceDue         DECIMAL(14,2) DEFAULT 0,
  RequiredSpecialAssessment        DECIMAL(14,2) DEFAULT 0,
  TotalSpecialAssessmentPaidYTD    DECIMAL(14,2) DEFAULT 0,
  SpecialAssessmentPaymentDue      DECIMAL(14,2) DEFAULT 0,
  SpecialAssessmentPaidBalanceDue  DECIMAL(14,2) DEFAULT 0,
  TotalSpecialAssessmentPaymentsYTD DECIMAL(14,2) DEFAULT 0,
  TotalCurrentAR                   DECIMAL(14,2) DEFAULT 0,
  OtherFinesAndFeesDue            DECIMAL(14,2) DEFAULT 0,
  FinesFeesPaidOrBalanceDue       DECIMAL(14,2) DEFAULT 0,
  CreditAfterPaymentsFinesRefunds DECIMAL(14,2) DEFAULT 0,
  CreditRefundPaidYTD             DECIMAL(14,2) DEFAULT 0,
  CreditUsedForDuesAndViolationsYTD DECIMAL(14,2) DEFAULT 0,
  PreviousYearCredit              DECIMAL(14,2) DEFAULT 0,
  PreviousYearCreditCalculation    DECIMAL(14,2) DEFAULT 0,
  YTDCredit                       DECIMAL(14,2) DEFAULT 0,
  ResidentCreditBalance           DECIMAL(14,2) DEFAULT 0,   -- NUEVO (V3 §9)
  AnnualAssessmentPaymentInvoiceNumber  VARCHAR(40),
  SpecialAssessmentPaymentInvoiceNumber VARCHAR(40),
  CurrentFiscalYearBegins         DATE,
  AssignedAnnualDuesRate          DECIMAL(14,2) DEFAULT 0,
  AssignedSpecialAssessmentRate   DECIMAL(14,2) DEFAULT 0,
  CreditCardPaymentExpenseYTD     DECIMAL(14,2) DEFAULT 0,
  MgtCoClientID                   VARCHAR(20),
  HOALicenseNumber                VARCHAR(20),
  ActiveFlag                      CHAR(1)      DEFAULT 'Y',
  OperatorID                      VARCHAR(20),
  TimeStampCreated                DATETIME     DEFAULT CURRENT_TIMESTAMP,
  TimeStampUpdated                DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (AssmtRegID),
  UNIQUE KEY uq_res_freq (MgtCoClientID, HOALicenseNumber, ResidentAccountID, CurrentFiscalYearBegins, Frequency)
  -- Identidad: Tenant/HOA (MgtCoClientID+HOALicenseNumber) + Resident + FiscalYear + Frequency
  -- Garantiza años fiscales sucesivos y contextos de HOA/clientes sin ambigüedad.
  -- Mantenimiento: posting APR actualiza SOLO el residente afectado. No recalcular a todos.
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2) AssessmentRegisterPeriod — UNA fila por periodo (normalizada)
--    PeriodNumber: 1..12 (Monthly), 1..4 (Quarterly), 1..2 (Semi), 1 (Annual)
--    Identidad alineada con AssessmentRegister (incluye Tenant/HOA + FiscalYear)
-- ----------------------------------------------------------------------------
CREATE TABLE AssessmentRegisterPeriod (
  PeriodRegID           INT(11)      NOT NULL AUTO_INCREMENT,
  AssmtRegID            INT(11),
  MgtCoClientID         VARCHAR(20),
  HOALicenseNumber      VARCHAR(20),
  ResidentAccountID     VARCHAR(20)  NOT NULL,
  CurrentFiscalYearBegins DATE,
  Frequency             ENUM('Annually','Semi-Annually','Quarterly','Monthly') NOT NULL,
  PeriodNumber          TINYINT       NOT NULL,
  PeriodAmount          DECIMAL(14,2) DEFAULT 0,
  TimeStampCreated      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  TimeStampUpdated      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (PeriodRegID),
  UNIQUE KEY uq_per (MgtCoClientID, HOALicenseNumber, ResidentAccountID, CurrentFiscalYearBegins, Frequency, PeriodNumber),
  KEY idx_assmt (AssmtRegID)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3) VIEWS de compatibilidad — mismo nombre que las tablas legacy.
--    Las reportes legacy siguen funcionando sin cambios.
--    (Las VIEWS son de SOLO LECTURA; el posting escribe en las tablas unificadas.)
-- ----------------------------------------------------------------------------

-- Monthly (12 periodos)
CREATE VIEW Monthly_AssmtRegister AS
SELECT r.AssmtRegID, r.ResidentAccountID, r.LastName, r.ResidenceAddress,
  MAX(CASE WHEN p.PeriodNumber=1  THEN p.PeriodAmount END) AS FirstMonthlyPayment,
  MAX(CASE WHEN p.PeriodNumber=2  THEN p.PeriodAmount END) AS SecondMonthlyPayment,
  MAX(CASE WHEN p.PeriodNumber=3  THEN p.PeriodAmount END) AS ThirdMonthlyPayment,
  MAX(CASE WHEN p.PeriodNumber=4  THEN p.PeriodAmount END) AS FourthMonthlyPayment,
  MAX(CASE WHEN p.PeriodNumber=5  THEN p.PeriodAmount END) AS FifthMonthlyPayment,
  MAX(CASE WHEN p.PeriodNumber=6  THEN p.PeriodAmount END) AS SixthMonthlyPayment,
  MAX(CASE WHEN p.PeriodNumber=7  THEN p.PeriodAmount END) AS SeventhMonthlyPayment,
  MAX(CASE WHEN p.PeriodNumber=8  THEN p.PeriodAmount END) AS EighthMonthlyPayment,
  MAX(CASE WHEN p.PeriodNumber=9  THEN p.PeriodAmount END) AS NinthMonthlyPayment,
  MAX(CASE WHEN p.PeriodNumber=10 THEN p.PeriodAmount END) AS TenthMonthlyPayment,
  MAX(CASE WHEN p.PeriodNumber=11 THEN p.PeriodAmount END) AS EleventhMonthlyPayment,
  MAX(CASE WHEN p.PeriodNumber=12 THEN p.PeriodAmount END) AS TwelfthMonthlyPayment,
  r.TotalAnnualDuesPaymentsYTD, r.CurrentAssessmentPaymentDue, r.TotalYearlyRequiredAnnualDues,
  r.RequiredPeriodicPayment AS RequiredMonthlyPayment, r.AssessmentPaidBalanceDue,
  r.RequiredSpecialAssessment, r.TotalSpecialAssessmentPaidYTD, r.SpecialAssessmentPaymentDue,
  r.SpecialAssessmentPaidBalanceDue, r.TotalSpecialAssessmentPaymentsYTD, r.TotalCurrentAR,
  r.OtherFinesAndFeesDue, r.FinesFeesPaidOrBalanceDue, r.CreditAfterPaymentsFinesRefunds,
  r.CreditRefundPaidYTD, r.CreditUsedForDuesAndViolationsYTD, r.PreviousYearCredit,
  r.PreviousYearCreditCalculation, r.YTDCredit, r.ResidentCreditBalance,
  r.AnnualAssessmentPaymentInvoiceNumber, r.SpecialAssessmentPaymentInvoiceNumber,
  r.CurrentFiscalYearBegins, r.AssignedAnnualDuesRate, r.AssignedSpecialAssessmentRate,
  r.CreditCardPaymentExpenseYTD, r.MgtCoClientID, r.HOALicenseNumber, r.ActiveFlag,
  r.OperatorID, r.TimeStampCreated, r.TimeStampUpdated
FROM AssessmentRegister r
LEFT JOIN AssessmentRegisterPeriod p
  ON p.MgtCoClientID=r.MgtCoClientID AND p.HOALicenseNumber=r.HOALicenseNumber
     AND p.ResidentAccountID=r.ResidentAccountID AND p.CurrentFiscalYearBegins=r.CurrentFiscalYearBegins
     AND p.Frequency=r.Frequency AND r.Frequency='Monthly'
GROUP BY r.MgtCoClientID, r.HOALicenseNumber, r.ResidentAccountID, r.CurrentFiscalYearBegins, r.Frequency;

-- Quarterly (4 periodos)
CREATE VIEW QTRLY_AssmtRegister AS
SELECT r.AssmtRegID, r.ResidentAccountID, r.LastName, r.ResidenceAddress,
  MAX(CASE WHEN p.PeriodNumber=1 THEN p.PeriodAmount END) AS FirstQuarterPayment,
  MAX(CASE WHEN p.PeriodNumber=2 THEN p.PeriodAmount END) AS SecondQuarterPayment,
  MAX(CASE WHEN p.PeriodNumber=3 THEN p.PeriodAmount END) AS ThirdQuarterPayment,
  MAX(CASE WHEN p.PeriodNumber=4 THEN p.PeriodAmount END) AS FourthQuarterPayment,
  r.TotalAnnualDuesPaymentsYTD, r.QuarterlyAnnualPaidBalanceDue, r.CurrentAnnualPaymentDue,
  r.TotalYearlyRequiredAnnualDues, r.RequiredPeriodicPayment AS RequiredAnnualQuarterlyPayment,
  r.AssessmentPaidBalanceDue, r.RequiredSpecialAssessment, r.TotalSpecialAssessmentPaidYTD,
  r.SpecialAssessmentPaymentDue, r.SpecialAssessmentPaidBalanceDue,
  r.TotalSpecialAssessmentPaymentsYTD, r.TotalCurrentAR, r.OtherFinesAndFeesDue,
  r.FinesFeesPaidOrBalanceDue, r.CreditAfterPaymentsFinesRefunds, r.CreditRefundPaidYTD,
  r.CreditUsedForDuesAndViolationsYTD, r.PreviousYearCredit, r.PreviousYearCreditCalculation,
  r.YTDCredit, r.ResidentCreditBalance, r.AnnualAssessmentPaymentInvoiceNumber,
  r.SpecialAssessmentPaymentInvoiceNumber, r.CurrentFiscalYearBegins, r.AssignedAnnualDuesRate,
  r.AssignedSpecialAssessmentRate, r.CreditCardPaymentExpenseYTD, r.MgtCoClientID,
  r.HOALicenseNumber, r.ActiveFlag, r.OperatorID, r.TimeStampCreated, r.TimeStampUpdated
FROM AssessmentRegister r
LEFT JOIN AssessmentRegisterPeriod p
  ON p.MgtCoClientID=r.MgtCoClientID AND p.HOALicenseNumber=r.HOALicenseNumber
     AND p.ResidentAccountID=r.ResidentAccountID AND p.CurrentFiscalYearBegins=r.CurrentFiscalYearBegins
     AND p.Frequency=r.Frequency AND r.Frequency='Quarterly'
GROUP BY r.MgtCoClientID, r.HOALicenseNumber, r.ResidentAccountID, r.CurrentFiscalYearBegins, r.Frequency;

-- Yearly (1 periodo)
CREATE VIEW YRLY_AssmtRegister AS
SELECT r.AssmtRegID, r.ResidentAccountID, r.LastName, r.ResidenceAddress,
  r.RequiredPeriodicPayment AS RequiredAnnualAssessment, r.TotalAnnualDuesPaymentsYTD,
  r.CurrentAssessmentPaymentDue, r.AssessmentPaidBalanceDue,
  r.TotalSpecialAssessmentPaidYTD, r.SpecialAssessmentPaymentDue,
  r.SpecialAssessmentPaidBalanceDue, r.TotalSpecialAssessmentPaymentsYTD,
  r.OtherFinesAndFeesDue, r.FinesFeesPaidOrBalanceDue, r.CreditAfterPaymentsFinesRefunds,
  r.FinalYearEndCreditAfterRefunds, r.TotalCurrentAR, r.CreditRefundPaidYTD,
  r.CreditUsedForDuesAndViolationsYTD, r.PreviousYearCredit, r.PreviousYearCreditCalculation,
  r.YTDCredit, r.ResidentCreditBalance, r.AnnualAssessmentPaymentInvoiceNumber,
  r.SpecialAssessmentPaymentInvoiceNumber, r.CurrentFiscalYearBegins, r.AssignedAnnualDuesRate,
  r.AssignedSpecialAssessmentRate, r.MgtCoClientID, r.HOALicenseNumber, r.ActiveFlag,
  r.OperatorID, r.TimeStampCreated, r.TimeStampUpdated
FROM AssessmentRegister r
WHERE r.Frequency='Annually';

-- Semi-Annual (2 periodos) — NUEVA; cubre el gap del Punto 1 sin tabla base.
CREATE VIEW SEMI_AssmtRegister AS
SELECT r.AssmtRegID, r.ResidentAccountID, r.LastName, r.ResidenceAddress,
  MAX(CASE WHEN p.PeriodNumber=1 THEN p.PeriodAmount END) AS FirstHalfPayment,
  MAX(CASE WHEN p.PeriodNumber=2 THEN p.PeriodAmount END) AS SecondHalfPayment,
  r.TotalAnnualDuesPaymentsYTD, r.CurrentAssessmentPaymentDue, r.TotalYearlyRequiredAnnualDues,
  r.RequiredPeriodicPayment AS RequiredSemiAnnualPayment, r.AssessmentPaidBalanceDue,
  r.RequiredSpecialAssessment, r.TotalSpecialAssessmentPaidYTD, r.SpecialAssessmentPaymentDue,
  r.SpecialAssessmentPaidBalanceDue, r.TotalSpecialAssessmentPaymentsYTD, r.TotalCurrentAR,
  r.OtherFinesAndFeesDue, r.FinesFeesPaidOrBalanceDue, r.CreditAfterPaymentsFinesRefunds,
  r.CreditRefundPaidYTD, r.CreditUsedForDuesAndViolationsYTD, r.PreviousYearCredit,
  r.PreviousYearCreditCalculation, r.YTDCredit, r.ResidentCreditBalance,
  r.AnnualAssessmentPaymentInvoiceNumber, r.SpecialAssessmentPaymentInvoiceNumber,
  r.CurrentFiscalYearBegins, r.AssignedAnnualDuesRate, r.AssignedSpecialAssessmentRate,
  r.CreditCardPaymentExpenseYTD, r.MgtCoClientID, r.HOALicenseNumber, r.ActiveFlag,
  r.OperatorID, r.TimeStampCreated, r.TimeStampUpdated
FROM AssessmentRegister r
LEFT JOIN AssessmentRegisterPeriod p
  ON p.MgtCoClientID=r.MgtCoClientID AND p.HOALicenseNumber=r.HOALicenseNumber
     AND p.ResidentAccountID=r.ResidentAccountID AND p.CurrentFiscalYearBegins=r.CurrentFiscalYearBegins
     AND p.Frequency=r.Frequency AND r.Frequency='Semi-Annually'
GROUP BY r.MgtCoClientID, r.HOALicenseNumber, r.ResidentAccountID, r.CurrentFiscalYearBegins, r.Frequency;

-- ----------------------------------------------------------------------------
-- 4) ELIMINAR LAS BASE TABLES VACIAS (requiere aprobacion explicita antes de correr)
--    para reusar esos nombres como VIEWS. Solo tras confirmar que NADA escribe
--    en ellas (el nuevo posting escribe en AssessmentRegister/Period).
-- ----------------------------------------------------------------------------
-- DROP TABLE IF EXISTS Monthly_AssmtRegister;
-- DROP TABLE IF EXISTS QTRLY_AssmtRegister;
-- DROP TABLE IF EXISTS YRLY_AssmtRegister;


-- ============================================================================
-- FASE 2 — DRAFT TENTATIVO (columnas por confirmar en V3 §13/§14)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5) AssessmentPaymentRegister — tabla de TRANSACCIONES (fuente de verdad)
--    Un payment = una fila inmutable con hechos del pago. YTD/balances se derivan.
--    Annual Dues y Special Assessment en filas SEPARADAS (V3 §3).
-- ----------------------------------------------------------------------------
CREATE TABLE AssessmentPaymentRegister (
  APRTransactionID      INT(11)      NOT NULL AUTO_INCREMENT,
  TransactionNumber     VARCHAR(30)   NOT NULL,   -- server-assigned: APR+yymmdd+seq (V3 §2b)
  ResidentAccountID     VARCHAR(20)   NOT NULL,
  PaymentType           ENUM('AnnualDues','SpecialAssessment') NOT NULL, -- un tipo por fila (V3 §3)
  PaymentDate           DATE,                      -- Date Deposited
  AnnualDuesPayment     DECIMAL(14,2) DEFAULT 0,
  SpecialAssessmentPayment DECIMAL(14,2) DEFAULT 0,
  CreditAmount          DECIMAL(14,2) DEFAULT 0,
  TotalAmount           DECIMAL(14,2) DEFAULT 0,
  BankAccountID         INT(11),                    -- banco que recibe (V3 §11)
  GLNumber              INT(11),
  ElectronicPaymentID   VARCHAR(40)   DEFAULT NULL,  -- link a recibo electronico si aplica (V3 §6)
  Status                VARCHAR(20)   DEFAULT 'POSTED', -- POSTED | VOID
  DeletedFlag           CHAR(1)       DEFAULT 'N',
  OperatorID            VARCHAR(20),
  TimeStampCreated      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  TimeStampUpdated      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (APRTransactionID),
  UNIQUE KEY uq_txn (TransactionNumber),
  KEY idx_res (ResidentAccountID),
  KEY idx_ep (ElectronicPaymentID)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6) ElectronicPaymentRegister / ElectronicPaymentAllocation (V3 §6)
-- ----------------------------------------------------------------------------
CREATE TABLE ElectronicPaymentRegister (
  ElectronicPaymentID   VARCHAR(40)   NOT NULL,   -- W M+ internal ID (V3 §7)
  ExternalProcessorID   VARCHAR(80),                -- Zego/ACH/Zelle/PayPal/etc.
  ProcessorType         VARCHAR(30),
  BatchID               VARCHAR(80)   DEFAULT NULL, -- para reconciliacion por lote
  ReceiptDate           DATETIME,
  TotalAmount           DECIMAL(14,2) DEFAULT 0,
  EntityType            ENUM('Resident','Vendor') DEFAULT 'Resident', -- V3 §7
  ResidentAccountID     VARCHAR(20)   DEFAULT NULL,
  VendorID              VARCHAR(20)   DEFAULT NULL,
  Status                VARCHAR(20)   DEFAULT 'POSTED',
  OperatorID            VARCHAR(20),
  TimeStampCreated      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  TimeStampUpdated      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (ElectronicPaymentID)
) ENGINE=InnoDB;

CREATE TABLE ElectronicPaymentAllocation (
  AllocationID          INT(11)      NOT NULL AUTO_INCREMENT,
  ElectronicPaymentID   VARCHAR(40)   NOT NULL,
  SourceTable           ENUM('APR','DepositRegister') NOT NULL, -- a donde va la allocation
  SourceTransactionNumber VARCHAR(30),
  AllocationType        ENUM('Fines','SpecialAssessment','AnnualDues','ResidentCredit') NOT NULL,
  Amount                DECIMAL(14,2) DEFAULT 0,
  TimeStampCreated      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  TimeStampUpdated      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (AllocationID),
  KEY idx_ep (ElectronicPaymentID)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 7) ResidentMaster — columna de credito residente (pasivo, V3 §9)
-- ----------------------------------------------------------------------------
-- ALTER TABLE ResidentMaster
--   ADD COLUMN ResidentCreditBalance DECIMAL(14,2) NOT NULL DEFAULT 0
--   AFTER PriorYearCredit;
