-- 001_apr_unified_register.sql
-- Fase 1 APR — migración segura (IF NOT EXISTS, no borra tablas legacy vacías)
-- Estado: requiere privilegio CREATE/ALTER (no disponible para usuario Ricktest — necesita ejecución por admin/DBA en www.1mag1na.xyz)
-- Principios V3: identidad refinada (Tenant/HOA + FiscalYear) + incremental + single-type-per-row
-- Tras ejecutar, el endpoint POST /api/apr/enter-payment deja de responder 501 y opera transaccionalmente.

CREATE TABLE IF NOT EXISTS AssessmentRegister (
  AssmtRegID                       INT(11)      NOT NULL AUTO_INCREMENT,
  ResidentAccountID               VARCHAR(20)  NOT NULL,
  Frequency                       ENUM('Annually','Semi-Annually','Quarterly','Monthly') NOT NULL,
  LastName                        VARCHAR(100),
  ResidenceAddress                VARCHAR(150),
  RequiredPeriodicPayment         DECIMAL(14,2) DEFAULT 0,
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
  ResidentCreditBalance           DECIMAL(14,2) DEFAULT 0,
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
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS AssessmentRegisterPeriod (
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

CREATE TABLE IF NOT EXISTS AssessmentPaymentRegister (
  APRTransactionID      INT(11)      NOT NULL AUTO_INCREMENT,
  TransactionNumber     VARCHAR(30)   NOT NULL,
  ResidentAccountID     VARCHAR(20)   NOT NULL,
  PaymentType           ENUM('AnnualDues','SpecialAssessment') NOT NULL,
  PaymentDate           DATE,
  AnnualDuesPayment     DECIMAL(14,2) DEFAULT 0,
  SpecialAssessmentPayment DECIMAL(14,2) DEFAULT 0,
  CreditAmount          DECIMAL(14,2) DEFAULT 0,
  TotalAmount           DECIMAL(14,2) DEFAULT 0,
  BankAccountID         INT(11),
  GLNumber              INT(11),
  ElectronicPaymentID   VARCHAR(40)   DEFAULT NULL,
  Status                VARCHAR(20)   DEFAULT 'POSTED',
  DeletedFlag           CHAR(1)       DEFAULT 'N',
  MgtCoClientID         VARCHAR(20),
  HOALicenseNumber      VARCHAR(20),
  CurrentFiscalYearBegins DATE,
  Frequency             VARCHAR(20),
  PeriodNumber          TINYINT,
  OperatorID            VARCHAR(20),
  TimeStampCreated      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  TimeStampUpdated      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (APRTransactionID),
  UNIQUE KEY uq_txn (TransactionNumber),
  KEY idx_res (ResidentAccountID),
  KEY idx_ep (ElectronicPaymentID)
) ENGINE=InnoDB;

-- Ejecutar manualmente como admin si falta (Ricktest no tiene ALTER):
-- ALTER TABLE ResidentMaster ADD COLUMN ResidentCreditBalance DECIMAL(14,2) NOT NULL DEFAULT 0 AFTER PriorYearCredit;
