-- =============================================================
-- hoam26_auth seed 002 — mapeo HOA de desarrollo (HOA-FL-2024-001)
-- Los datos de hoamanager26_dev pertenecen a esta HOA; sin esta fila
-- el scope no tiene contraparte. Debbie asignada como viewer para
-- probar selector multi-HOA (RL vacía vs DEV con datos).
-- Reemplazar/ajustar al llegar el Excel de Rick.
-- =============================================================
USE hoam26_auth;

INSERT INTO hoa
  (id, mgt_company_id, license_number, hoa_code, legal_name, billing_name,
   city, state_code, external_property_id, website_url,
   fiscal_year_start_month, fiscal_year_start_day,
   license_status, license_type, self_managed, notes, active_flag)
VALUES
  (7, 1, 'HOA-FL-2024-001', 'DEV', 'HOA Demo FL (dev-data) PLACEHOLDER', 'HOA Demo FL',
   'Miami', 'FL', 'PROP-HOA7', NULL, 1, 1,
   'active', 'dev', 'N', 'Mapeo dev: datos reales en hoamanager26_dev', 'Y')
ON DUPLICATE KEY UPDATE legal_name = VALUES(legal_name);

INSERT INTO hoa_payment_settings (hoa_id, zego_active, resident_pays_fee, ach_active, fines_paid_first)
VALUES (7, 'Y', 'Y', 'Y', 'Y')
ON DUPLICATE KEY UPDATE hoa_id = VALUES(hoa_id);

INSERT INTO hoa_integration (hoa_id, provider, external_account_id, active_flag, activated_at)
VALUES
  (7, 'zego', 'ZEGO-HOA7', 'Y', '2026-01-15'),
  (7, 'website', 'SITE-HOA7', 'Y', '2026-01-15')
ON DUPLICATE KEY UPDATE active_flag = VALUES(active_flag);

-- Debbie (user 2) como viewer de DEV para probar multi-HOA
INSERT INTO hoa_assignment (user_id, hoa_id, role, active_flag)
VALUES (2, 7, 'viewer', 'Y')
ON DUPLICATE KEY UPDATE active_flag = VALUES(active_flag);
