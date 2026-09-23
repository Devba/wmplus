-- =============================================================
-- hoam26_auth v1 — identidad + autorización W M+ (desde cero)
-- Núcleo: gestora, HOAs, usuarios, credenciales, sesiones,
-- asignaciones + integraciones/pagos por HOA (input de Rick).
-- Aplicado 2026-09-10. Seeds: db/seeds/001_directory.sql.
-- FASE 1 V4 (2026-09-23, decisiones Rick): hoa.client_id + hoa.unit_count,
-- fuera hoa.self_managed (autoridad = mgt_company_id IS NULL), niveles por
-- asignación, user_session.hoa_id. Rama feature/auth-roles.
-- =============================================================

CREATE TABLE IF NOT EXISTS mgt_company (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(16) NOT NULL UNIQUE COMMENT 'Ej: MGTCO-001',
  legal_name VARCHAR(120) NOT NULL,
  address_line1 VARCHAR(120) NULL,
  address_line2 VARCHAR(120) NULL,
  city VARCHAR(80) NULL,
  state_code CHAR(2) NULL,
  zip VARCHAR(12) NULL,
  contact_name VARCHAR(80) NULL,
  contact_phone VARCHAR(30) NULL,
  contact_email VARCHAR(120) NULL,
  active_flag CHAR(1) NOT NULL DEFAULT 'Y',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS hoa (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  mgt_company_id INT NULL COMMENT 'NULL = self-managed (autoridad única, decisión Rick V4)',
  license_number VARCHAR(32) NOT NULL UNIQUE COMMENT 'Legacy License_Number del VBA',
  hoa_code VARCHAR(8) NOT NULL UNIQUE COMMENT 'Código corto explícito: RL, GL, Ren (desambigua vs General Ledger)',
  client_id VARCHAR(32) NULL UNIQUE COMMENT 'Business HOA Client ID (V4 §2); NULL hasta Excel Rick',
  unit_count INT UNSIGNED NULL COMMENT 'Nº unidades/homes, autoritativo para pricing E M+ (V4 §3)',
  legal_name VARCHAR(120) NOT NULL COMMENT 'Ej: Governors Landing',
  billing_name VARCHAR(120) NULL,
  letter_name VARCHAR(120) NULL,
  address_line1 VARCHAR(120) NULL,
  address_line2 VARCHAR(120) NULL,
  city VARCHAR(80) NULL,
  state_code CHAR(2) NULL COMMENT 'Regla service-fee: CO y otros restringidos -> resident_pays_fee=N',
  zip VARCHAR(12) NULL,
  external_property_id VARCHAR(32) NULL COMMENT 'propertyId ante Zego/website (celda D10 del VBA)',
  website_url VARCHAR(255) NULL,
  fiscal_year_start_month TINYINT NULL,
  fiscal_year_start_day TINYINT NULL,
  license_status VARCHAR(20) NULL,
  license_type VARCHAR(20) NULL,
  subscription_renewal_date DATE NULL,
  notes TEXT NULL,
  active_flag CHAR(1) NOT NULL DEFAULT 'Y',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_hoa_mgt FOREIGN KEY (mgt_company_id) REFERENCES mgt_company (id),
  INDEX idx_hoa_state (state_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS app_user (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  mgt_company_id INT NULL,
  login_name VARCHAR(64) NOT NULL UNIQUE,
  display_name VARCHAR(80) NULL,
  email VARCHAR(120) NULL,
  authorization_level TINYINT NOT NULL DEFAULT 1 COMMENT 'Nivel global/admin (V4: operativo vive en hoa_assignment)',
  read_only_flag CHAR(1) NOT NULL DEFAULT 'N' COMMENT 'Y = view-only global (I1=1 del VBA)',
  can_view_escrow_flag CHAR(1) NOT NULL DEFAULT 'Y',
  can_view_cc_flag CHAR(1) NOT NULL DEFAULT 'Y',
  active_flag CHAR(1) NOT NULL DEFAULT 'Y',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_mgt FOREIGN KEY (mgt_company_id) REFERENCES mgt_company (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_credential (
  user_id INT NOT NULL PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL COMMENT 'scrypt phc, nunca en claro',
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cred_user FOREIGN KEY (user_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_session (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hoa_id INT NULL COMMENT 'HOA activa del browser (V4 §9-10); NULL = pre-selección',
  token_hash CHAR(64) NOT NULL COMMENT 'SHA-256 del token opaco',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL COMMENT 'Expiración deslizante (reemplaza CATimer)',
  revoked_flag CHAR(1) NOT NULL DEFAULT 'N',
  user_agent VARCHAR(255) NULL,
  CONSTRAINT fk_sess_user FOREIGN KEY (user_id) REFERENCES app_user (id),
  CONSTRAINT fk_sess_hoa FOREIGN KEY (hoa_id) REFERENCES hoa (id),
  INDEX idx_sess_token (token_hash),
  INDEX idx_sess_user (user_id),
  INDEX idx_sess_user_hoa (user_id, hoa_id, revoked_flag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- NOTA V4 §10: unicidad de sesión ACTIVA por (user, HOA) se impone en
-- código (Fase 3), NO con UNIQUE literal, para conservar historial de revocadas.

CREATE TABLE IF NOT EXISTS hoa_assignment (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT 'Ej: Debbie, Marsha, Steve',
  hoa_id INT NOT NULL COMMENT 'Ej: RL, GL, Ren',
  role ENUM('manager','accountant','viewer') NOT NULL COMMENT 'Descriptivo (V4): NO determina permisos',
  authorization_level TINYINT NOT NULL DEFAULT 1 COMMENT 'Nivel 1-12 operativo de ESTA asignación (V4 §5)',
  read_only_flag CHAR(1) NOT NULL DEFAULT 'N' COMMENT 'Y = view-only en ESTA HOA',
  active_flag CHAR(1) NOT NULL DEFAULT 'Y',
  valid_from DATE NULL,
  valid_to DATE NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_asg_user FOREIGN KEY (user_id) REFERENCES app_user (id),
  CONSTRAINT fk_asg_hoa FOREIGN KEY (hoa_id) REFERENCES hoa (id),
  UNIQUE KEY uq_assignment (user_id, hoa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS hoa_integration (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  hoa_id INT NOT NULL,
  provider ENUM('zego','website','other') NOT NULL,
  external_account_id VARCHAR(64) NULL,
  active_flag CHAR(1) NOT NULL DEFAULT 'N',
  activated_at DATE NULL,
  config_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_int_hoa FOREIGN KEY (hoa_id) REFERENCES hoa (id),
  UNIQUE KEY uq_integration (hoa_id, provider)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS hoa_payment_settings (
  hoa_id INT NOT NULL PRIMARY KEY,
  zego_active CHAR(1) NOT NULL DEFAULT 'N',
  resident_pays_fee CHAR(1) NOT NULL DEFAULT 'Y' COMMENT 'N forzoso en CO y estados restringidos',
  ach_active CHAR(1) NOT NULL DEFAULT 'N',
  fines_paid_first CHAR(1) NOT NULL DEFAULT 'Y',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pay_hoa FOREIGN KEY (hoa_id) REFERENCES hoa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
