-- =============================================================
-- hoam26_auth seed 001 — directorio PLACEHOLDER (datos inventados)
-- Fuente real pendiente: Excel de Rick.
-- Regla: todo valor inventado lleva marca visible (HOA1, LIC-, PLACEHOLDER).
-- Clave inicial de TODOS los usuarios: cambiar123
--   (hash scrypt verificado contra backend/middleware/auth.js;
--    en producción las claves se crean con backend/scripts/create-user.js,
--    NUNCA en un seed versionado).
-- Reemplazar este archivo por el seed real al llegar el Excel.
-- =============================================================
USE hoam26_auth;

-- Gestora -------------------------------------------------------
INSERT INTO mgt_company
  (id, code, legal_name, city, state_code, contact_name, contact_email, active_flag)
VALUES
  (1, 'MGT-001', 'Gestora Demo PLACEHOLDER', 'Miami', 'FL',
   'Rick Admin PLACEHOLDER', 'rick@example.com', 'Y')
ON DUPLICATE KEY UPDATE legal_name = VALUES(legal_name);

-- HOAs (1-3: input de Rick; 4-6: Colorado pendientes, inventadas) --
INSERT INTO hoa
  (id, mgt_company_id, license_number, hoa_code, legal_name, billing_name,
   city, state_code, external_property_id, website_url,
   fiscal_year_start_month, fiscal_year_start_day,
   license_status, license_type, self_managed, notes, active_flag)
VALUES
  (1, 1, 'LIC-HOA1', 'RL', 'Remington Landing PLACEHOLDER', 'Remington Landing',
   'Miami', 'FL', 'PROP-HOA1', 'https://hoa1.example.com', 1, 1,
   'active', 'full', 'N', 'Manager: Debbie (Rick)', 'Y'),
  (2, 1, 'LIC-HOA2', 'GL', 'Governors Landing PLACEHOLDER', 'Governors Landing',
   'Miami', 'FL', 'PROP-HOA2', 'https://hoa2.example.com', 1, 1,
   'active', 'full', 'N', 'Manager: Marsha (Rick). OJO: GL = HOA, no General Ledger', 'Y'),
  (3, 1, 'LIC-HOA3', 'Ren', 'Renaissance PLACEHOLDER', 'Renaissance',
   'Miami', 'FL', 'PROP-HOA3', 'https://hoa3.example.com', 1, 1,
   'active', 'full', 'N', 'Manager: Steve (Rick)', 'Y'),
  (4, 1, 'LIC-HOA4', 'HOA4', 'HOA Demo Colorado 1 PLACEHOLDER', 'HOA Colorado 1',
   'Denver', 'CO', 'PROP-HOA4', NULL, 1, 1,
   'pending', 'full', 'N', 'Nueva Colorado (Rick): pronto Zego + website', 'Y'),
  (5, 1, 'LIC-HOA5', 'HOA5', 'HOA Demo Colorado 2 PLACEHOLDER', 'HOA Colorado 2',
   'Denver', 'CO', 'PROP-HOA5', NULL, 1, 1,
   'pending', 'full', 'N', 'Nueva Colorado (Rick): pronto Zego + website', 'Y'),
  (6, 1, 'LIC-HOA6', 'HOA6', 'HOA Demo Colorado 3 PLACEHOLDER', 'HOA Colorado 3',
   'Denver', 'CO', 'PROP-HOA6', NULL, 1, 1,
   'pending', 'full', 'N', 'Nueva Colorado (Rick): pronto Zego + website', 'Y')
ON DUPLICATE KEY UPDATE legal_name = VALUES(legal_name);

-- Usuarios ------------------------------------------------------
INSERT INTO app_user
  (id, mgt_company_id, login_name, display_name, email,
   authorization_level, read_only_flag, active_flag)
VALUES
  (1, 1, 'user_rick',   'Rick Admin PLACEHOLDER',   'rick@example.com',   9, 'N', 'Y'),
  (2, 1, 'user_debbie', 'Debbie PLACEHOLDER',       'debbie@example.com', 1, 'N', 'Y'),
  (3, 1, 'user_marsha', 'Marsha PLACEHOLDER',       'marsha@example.com', 1, 'N', 'Y'),
  (4, 1, 'user_steve',  'Steve PLACEHOLDER',        'steve@example.com',  1, 'N', 'Y'),
  (5, 1, 'user_temp',   'Manager Temporal PLACEHOLDER', 'temp@example.com', 1, 'N', 'Y')
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

-- Credenciales (clave común: cambiar123) ------------------------
INSERT INTO user_credential (user_id, password_hash, failed_attempts)
VALUES
  (1, 'scrypt$16384$8$1$29af722a333adecce726ae6418781362$8dc2079f9f393eea15731010420882a0ca9ffa56c321f942c29e107e9af2a2f10335725cea2c9ba949df80146d3b77ef4b94ad70b2841750003cdaee3f2dd35f', 0),
  (2, 'scrypt$16384$8$1$29af722a333adecce726ae6418781362$8dc2079f9f393eea15731010420882a0ca9ffa56c321f942c29e107e9af2a2f10335725cea2c9ba949df80146d3b77ef4b94ad70b2841750003cdaee3f2dd35f', 0),
  (3, 'scrypt$16384$8$1$29af722a333adecce726ae6418781362$8dc2079f9f393eea15731010420882a0ca9ffa56c321f942c29e107e9af2a2f10335725cea2c9ba949df80146d3b77ef4b94ad70b2841750003cdaee3f2dd35f', 0),
  (4, 'scrypt$16384$8$1$29af722a333adecce726ae6418781362$8dc2079f9f393eea15731010420882a0ca9ffa56c321f942c29e107e9af2a2f10335725cea2c9ba949df80146d3b77ef4b94ad70b2841750003cdaee3f2dd35f', 0),
  (5, 'scrypt$16384$8$1$29af722a333adecce726ae6418781362$8dc2079f9f393eea15731010420882a0ca9ffa56c321f942c29e107e9af2a2f10335725cea2c9ba949df80146d3b77ef4b94ad70b2841750003cdaee3f2dd35f', 0)
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);

-- Asignaciones (Rick admin global: sin filas, ve todo) ----------
INSERT INTO hoa_assignment (user_id, hoa_id, role, active_flag)
VALUES
  (2, 1, 'manager', 'Y'),
  (3, 2, 'manager', 'Y'),
  (4, 3, 'manager', 'Y'),
  (5, 4, 'manager', 'Y'),
  (5, 5, 'manager', 'Y'),
  (5, 6, 'manager', 'Y')
ON DUPLICATE KEY UPDATE active_flag = VALUES(active_flag);

-- Integraciones por HOA -----------------------------------------
INSERT INTO hoa_integration (hoa_id, provider, external_account_id, active_flag, activated_at)
VALUES
  (1, 'zego',    'ZEGO-HOA1', 'Y', '2026-01-15'),
  (1, 'website', 'SITE-HOA1', 'Y', '2026-01-15'),
  (2, 'zego',    'ZEGO-HOA2', 'Y', '2026-01-15'),
  (2, 'website', 'SITE-HOA2', 'Y', '2026-01-15'),
  (3, 'zego',    'ZEGO-HOA3', 'Y', '2026-01-15'),
  (3, 'website', 'SITE-HOA3', 'Y', '2026-01-15'),
  (4, 'zego',    NULL, 'N', NULL),
  (4, 'website', NULL, 'N', NULL),
  (5, 'zego',    NULL, 'N', NULL),
  (5, 'website', NULL, 'N', NULL),
  (6, 'zego',    NULL, 'N', NULL),
  (6, 'website', NULL, 'N', NULL)
ON DUPLICATE KEY UPDATE active_flag = VALUES(active_flag);

-- Pagos por HOA (CO: resident_pays_fee=N por restricción estatal)
INSERT INTO hoa_payment_settings
  (hoa_id, zego_active, resident_pays_fee, ach_active, fines_paid_first)
VALUES
  (1, 'Y', 'Y', 'Y', 'Y'),
  (2, 'Y', 'Y', 'Y', 'Y'),
  (3, 'Y', 'Y', 'Y', 'Y'),
  (4, 'N', 'N', 'N', 'Y'),
  (5, 'N', 'N', 'N', 'Y'),
  (6, 'N', 'N', 'N', 'Y')
ON DUPLICATE KEY UPDATE resident_pays_fee = VALUES(resident_pays_fee);
