# PROJECT CONTEXT — W M+ Management System

> **Para cualquier agente opencode (nuevo o existente):** lee este documento + `AGENTS.md` ANTES de trabajar. Contiene el historial, contratos de API, acuerdos del equipo y estado actual del despliegue.

**Última actualización:** 2026-08-27
**Rama de trabajo actual:** `BravoFrontend` (APR Fase 1 + B1 integrados el 2026-08-27; rama de trabajo de APR: `feature/apr-unified-register`)
**Branches relevantes:** `BravoFrontend` (integración principal), `feature/register-entry-wiring` (trabajo de Hal/frontend), `backend` (backend histórico), `main`

---

## 1. Qué es el proyecto

Aplicación web de gestión HOA (**W M+ Management System**) en migración de una app legacy a React + Node.js:
- **Frontend:** React 18 + Vite (SPA)
- **Backend:** Node.js + Express + MariaDB/MySQL (API REST)
- **Base de datos:** `hoamanager26` en `www.1mag1na.xyz:3306` (usuario `Ricktest`)
- **Despliegue producción:** VPS `62.171.142.58` (Nginx + PM2), backend en `/var/www/polydash/wm-backend-api/`, frontend estático en `/var/www/polydash/managereactv1` y `manage-Bravofrontend`

## 2. Equipo y división de responsabilidades (ACUERDO VIGENTE)

- **Backend/DB:** José (backend/database) — dueño de `server.js`, esquema de BD, endpoints.
- **Frontend:** Hal (+ colaboradores) — dueño de `src/` (componentes React).
- **Regla:** los cambios de backend se **coordinan** con José antes de llegar a una rama compartida. Igual al revés (frontend avisa a backend). **No se hacen push de cambios ajenos sin coordinar.**

## 3. Contratos de API (confirmados con frontend)

### `/api/settings/gl-mapping` (GET/PUT)
- Tabla `GLAccounts`. GET devuelve por GL: `id, glNumber, glName, sourceTable, description, bankType, bankId, pc, parentGl, consolidatedParentGl, dc, ar, effectiveDate, createdBy, createdDate, lastEditedBy, systemLocked, useInCR, useInDP, useInAPR, useInBDC, useInXFER`.
- PUT persiste los 5 campos `useIn*` (además de los ya existentes). `SourceTable` NO cambia (clasificación maestra).

### `/api/gl-options?screen=CR|DP|APR|BDC|XFER[&bankId=<id>]`
- Devuelve objetos GL completos: `id, glNumber, glName, sourceTable, bankType, bankId` (+ flags `useIn*`).
- Filtra por el flag `useIn*` correspondiente (`screen=CR` → `UseInCR='Y'`).
- Clave de respuesta: **`glAccounts`** (estandarizada; `glOptions` quedó obsoleta).
- Acepta `page` como parámetro **temporal** de compatibilidad (estándar: `screen`).
- Banco: **sin filtro estricto** aún (decisión pendiente de coordinar la regla definitiva).

### `POST /api/modify-gl/submit`
- Payload: `page, transactionNo, oldGLNo, oldGLClassification, newGLNo, newGLClassification`.
- `page=CR` → UPDATE `CheckRegister` por `CheckTransactionNumber` (`GLNumber` + `GLAccountName`).
- `page=DP` → UPDATE `DepositRegister` por `DepositTransactionNumber`.
- Errores: 400 (faltan campos), 404 (transacción no existe), 500 (fallo BD).

## 4. Campo `useIn*` en GLAccounts (ALTER ya ejecutado en producción)

```sql
UseInCR CHAR(1) NOT NULL DEFAULT 'N',
UseInDP CHAR(1) NOT NULL DEFAULT 'N',
UseInAPR CHAR(1) NOT NULL DEFAULT 'N',
UseInBDC CHAR(1) NOT NULL DEFAULT 'N',
UseInXFER CHAR(1) NOT NULL DEFAULT 'N'
```
- Independientes: un GL puede tener varios en `'Y'`.
- En BD actualmente: WATER (20000) y LANDSCAPING (25000) con `UseInCR='Y'`.

## 5. Estado del despliegue (VPS)

- Backend PM2 `wm-backend-api` → **online**, sirve en puerto 3011. Incluye: gl-mapping (con `useIn*`), `/api/gl-options`, `/api/modify-gl/submit` (desplegado el 2026-08-13).
- Nginx: `/api/` → `127.0.0.1:3011/api/`. Frontends estáticos en `/var/www/polydash/managereactv1` y `manage-Bravofrontend`.
- Backups de `server.js` previos se guardan en el VPS (`server.js.bak-*`).

## 6. Pendientes / en curso

- [ ] Hal confirmó su trabajo de Vendor ID + Enter Check (2026-08-14) → **commit local pendiente de push** hasta revisión (gobierno coordinado). Revisar cuando pusheen.
- [ ] Hal hará merge de `BravoFrontend` a su rama para traer `/api/modify-gl/submit` y probar CR Modify GL# end-to-end.
- [ ] R&R del patrón `gl-options` a DP → APR → BDC → XFER (frontend, según roadmap).
- [ ] Regla definitiva de elegibilidad de banco (coordinar backend/frontend).
- [ ] Fiscal Year Setup: reconciliar SQL vs schema `FiscalYearSetup`.
- [ ] Payees que no resuelven (p.ej. `V-001` vs `VEND-0xx`) — resuelto temporalmente por limpieza total de tablas (ver §10); validar con data nueva.
- [ ] Migración de los módulos restantes del tray (reportes, escrow, AR, violaciones, etc.).

## 6b. Limpieza de datos de prueba (2026-08-15) — HECHA

- Se vaciaron por completo `DepositRegister` (3), `CheckRegister` (23) y `VendorMaster` (14) — todo era data de prueba/dev.
- **Backup previo:** `backups/backup-20260815-111411.sql` (las 3 tablas).
- Método seguro: `DELETE` en orden de dependencia (deposits → checks → vendors). Sin `TRUNCATE`, sin desactivar FKs.
- **No hay foreign keys** que apunten a estas tablas (solo 2 FKs en la BD, ambas sin relación).
- Objetivo: empezar con pizarra limpia para que Hal ingrese 4–5 vendors y 4–5 checks nuevos y verificar el flujo completo.

## 7. Notas técnicas importantes

- **Nunca subir credenciales** (`opencode.json` con credenciales MySQL está en `.gitignore`).
- **Tokens GitHub:** expiran/revocan con frecuencia. El remote usa `https://Devba:<TOKEN>@github.com/...`. Si un push falla con "Invalid username or token", pedir token vigente y hacer `git remote set-url origin https://Devba:<TOKEN>@github.com/Devba/wmplus.git`. También `gh auth login`.
- El frontend clonado en `feature/register-entry-wiring` usa `localhost:3011` hardcodeado en algunos services (la mayoría ya migrados a `API_BASE_URL`).
- Para pruebas locales: frontend `npm run dev`, backend `node server.js` en `backend/`.
- La BD es de **pruebas**: tras la limpieza (2026-08-15) CheckRegister/VendorMaster/DepositRegister están VACÍAS. Residentes: 910 activos, 248 con deuda por cuotas.
- **Sesiones opencode:** `/share` genera un enlace público de lectura, NO un backup recuperable para seguir trabajando. Para "continuar la misma sesión" en otro equipo hay que copiar la carpeta de datos local de opencode + config. La vía robusta de contexto entre equipos es este `PROJECT-CONTEXT.md` + `AGENTS.md` versionados en git.

## 8. Cómo continuar el trabajo desde otro servidor

1. Clonar repo y leer `PROJECT-CONTEXT.md` + `AGENTS.md`.
2. Configurar `opencode.json` local con MCP MySQL (`hoamanager26`) y Playwright.
3. Trabajar en una rama; siempre `git pull` antes de empezar y coordinar pushes.
4. Consultar/acceder al VPS vía SSH (puerto 44) si se necesita desplegar o inspeccionar.

## 9. Estrategia de trabajo actual (2026-08-20)

- **Merge completado:** `feature/register-entry-wiring` → `BravoFrontend` (commit `54b0f2d` + fix `000ec52`).
- **Frontend (Hal) debe actualizar su rama:** `git pull origin BravoFrontend` para obtener los endpoints integrados.
- **Próximo merge pendiente:** `features/vivomysql-mcp` → `BravoFrontend` (OCR + AI filter mejorado).
- **Despliegue a VPS:** después del merge de vivomysql-mcp, actualizar PM2 en el servidor.

## 10. OCR de cheques (Deposit Register) — 2026-08-18

- **Endpoint:** `POST /api/ocr/check` en `backend/server.js`. Recibe la imagen en base64 (`{ image }`), extrae: `checkNumber`, `amount`, `date`, `payeeName`, `bankAccount`, `glNumber`.
- **Modelo por defecto:** `google/gemini-2.5-flash-lite` vía OpenRouter. Configurable con `OPENROUTER_OCR_MODEL` en `backend/.env`.
  - **API Key:** `OPENROUTER_API_KEY` en `backend/.env` (requerida).
  - **Body limit:** `express.json({ limit: '10mb' })` global (imágenes grandes).
  - El endpoint ya NO intenta `opencode run` primero — usa OpenRouter directamente.
- **Frontend:** botón "📷 Escanear Check" en `EnterDepositUF.jsx` y `EnterCheckUF.jsx` → SweetAlert con cámara/subir → confirmación editable → autocompleta el formulario.
  - **Ojo z-index:** el overlay del modal usa `z-index:10000`; SweetAlert2 va a `1060` por defecto y queda **debajo del backdrop**. Fix: `.swal2-container { z-index: 20000 !important }` en el CSS del componente.
- **Hook/componente reutilizables** en `src/components/OcrScan/`:
  - `useOcrScan.js`: hook que encapsula el escaneo (cámara/subir), la llamada al endpoint, la extracción y el **matcheo difuso del payee**.
  - `OcrScanButton.jsx`: botón "📷 Scan Check".
  - Ambos usados por `EnterDepositUF` y `EnterCheckUF`.
- **Matcher difuso de payees** (en `useOcrScan.js`):
  - Distancia de **Levenshtein** + **substring**, **umbral 70%** (`THRESHOLD = 0.7`), **prioridad a nombre completo** (no apellido suelto) para evitar falsos positivos.
  - Muestra el match con % en la confirmación: `✓ Match: <Nombre> (resident) — <score>%`.
- **Cheques de prueba:** 6 imágenes en `/tmp/opencode/` (subidas desde equipo local). **La carpeta está en `.gitignore` (no se sube).**
- **Demo OCR grabada:** video de 32s en `https://dev.hoa-e-solutions.com/vivomysql/demo-ocr.mp4` (acceso público).

## 10b. OCR de cheques (Check Payment Entry) — 2026-08-15

- Mismo endpoint `POST /api/ocr/check` y flujo OCR que §10, ahora **también implementado en Check Payment Entry**.
- **Hook/componente reutilizables** en `src/components/OcrScan/`:
  - `useOcrScan.js`: hook que encapsula el escaneo (cámara/subir), la llamada al endpoint, la extracción y el **matcheo difuso del payee**.
  - `OcrScanButton.jsx`: botón "📷 Scan Check".
  - Ambos usados por `EnterDepositUF` y `EnterCheckUF`.
- **Integración mínima en `EnterCheckUF.jsx`:** solo import + botón (toque mínimo para facilitar el merge con la rama de Hal en `feature/register-entry-wiring`).
- **Matcher difuso de payees** (en `useOcrScan.js`, comiteado en `ffcf83e`):
  - Distancia de **Levenshtein** + **substring**, **umbral 70%** (`THRESHOLD = 0.7`), **prioridad a nombre completo** (no apellido suelto) para evitar falsos positivos.
  - Muestra el match con % en la confirmación: `✓ Match: <Nombre> (resident) — <score>%`.
  - Validado con 5 cheques "near-miss": Sofia Adam→Sofia Adams, Sarah Allin→Sarah Allen, Elizabeth Allan→Elizabeth Allen, Juan Allen Jr→Juan Allen, Sebastian Adamz→Sebastian Adams.

## 11. Revisión del push de Hal/Rick — 2026-08-15

- **Rick pusheó** `f3f142f` "Complete Check Register entry workflow and Vendor ID updates" a `feature/register-entry-wiring` (7 archivos, +858/−696).
- **José revisó los 4 cambios de `backend/server.js` — todos verificados ✓:**
  1. `CheckAllowedYN` persistencia (GET + INSERT).
  2. `EscrowFlag` persistencia (GET + INSERT).
  3. Orden por `CheckTransactionNumber ASC`.
  4. `DateCheckIssued` **NULL** (sin fallback a hoy).
- Columnas `CheckAllowedYN` / `EscrowFlag` **confirmadas en BD** (`char(1)`). Se dio **go-ahead a Hal**.
- **PENDIENTE para la integración futura (coordinar ambos `server.js`):**
  - BravoFrontend tiene: `/api/modify-gl/submit`, `gl-options` con `page`/`bankId`/`useIn*`, `gl-mapping` con `useIn*`.
  - Rama de Hal tiene: `void/execute`, `fines-late-fees`, `dues-programming`, vendor IDs secuenciales, `gl-mapping` estructural.
- **Observación demo (worktree local `5174`, rama de Hal):** el dropdown "CHECK G/L ACCOUNT CATEGORY" aparece **VACÍO** para los bancos cargados → **PENDIENTE investigar** (posible `useIn*` en 'N' o filtro bankType).

## 11b. Merge completado (2026-08-20)

- **Commit:** `54b0f2d` — "merge: integrate register-entry-wiring into BravoFrontend"
- **Fix:** `000ec52` — "fix: restore express.json 10mb limit for OCR compatibility"
- **Conflictos resueltos (5):**
  1. `express.json` limit → restaurado a 10mb
  2. `/api/modify-gl/submit` → versión avanzada de Hal (CR + DP + Expense Credit Refund)
  3. `gl-mapping` GET → query con JOINs de Hal
  4. `gl-mapping` PUT → structural save de Hal
  5. `gl-options` → fusionado (PC/ParentGL de Hal + bankId de BravoFrontend)
- **Endpoints nuevos integrados:**
  - `POST /api/void/execute` (CR + DP)
  - `GET/PUT /api/settings/fines-late-fees`
  - `GET/PUT /api/settings/dues-programming`
  - `POST /api/modify-gl/submit` (versión avanzada)
- **Hal debe actualizar su rama:** `git pull origin BravoFrontend`

## 12. Merge plan (2026-08-20)

### Merge 1: `feature/register-entry-wiring` → `BravoFrontend`

**Estado:** ✅ COMPLETADO (commit `54b0f2d` + `000ec52`).

### Merge 2: `features/vivomysql-mcp` → `BravoFrontend`

**Estado:** PENDIENTE (después del Merge 1).

**Archivos afectados:** 11 archivos (7 nuevos, 4 modificados).

**Conflictos en `server.js`:**
| Zona | Decisión |
|---|---|
| `express.json` | Mantener `{ limit: '10mb' }` |
| `requires` | Agregar child_process, fs, os, path |
| `POST /api/ocr/check` | Agregar endpoint (nuevo, no conflicto) |
| `POST /api/ai-filter` | Adoptar versión mejorada (count, violations) |

**Componentes OCR nuevos:**
- `src/components/OcrScan/OcrScanButton.jsx`
- `src/components/OcrScan/useOcrScan.js`

**Archivos de contexto (agregar):**
- `PROJECT-CONTEXT.md`
- `GL-DEPLOYMENT-REPORT.md`
- `ROADMAP-2WEEKS.md`

---

## 13. APR Assessment Tables — Verificación y B1 (2026-08-27)

**Verificación:** se revisó el esquema real de `hoamanager26` y el código `backend/server.js` contra el documento frontend "APR / Assessment Table Relationship". Reporte completo (inglés): `docs/APR-VERIFICATION-REPORT.en.md`. Resumen:
- Las 7 tablas existen con esquemas acordes al rol previsto.
- Gaps encontrados: `ResidentMaster` aún es fuente financiera (escribe importes en alta/edición); `AssessmentRegister`/`Period` solo se tocan en posting y **nunca se inicializan al crear residente**; `AssessmentPaymentSummary` existe en BD pero **cero referencias en código**; `DuesRates` desconectado del flujo.
- `DuesProgramming` en BD tiene el esquema rico (`AssessmentFrequency`, `DuesType`); el lookup de frecuencia APR funciona. El DDL mínimo en `migrate-settings-tables.js` está desactualizado vs la BD (drift).

**Decisiones de arquitectura confirmadas (José, 2026-08-27):** (1) split de 7 tablas confirmado; (2) Add Resident **inicializa** `AssessmentRegister` + `AssessmentRegisterPeriod`; (3) edición de Main Directory dispara recálculo solo si cambia `AnnualDuesRate`/`SpecialAssessmentRate` (preservando historia APR); (4) `AssessmentPaymentSummary` se mantiene **transaccionalmente en el posting APR**; (5) se retiene `ResidentMaster` (IDs/nombres/lookup) y Hal & Rick limpian importes legacy + sufijos `#` en DBeaver antes de init.

**B1 implementado y mergeado:** `POST /api/residents` ahora crea `AssessmentRegister` + `AssessmentRegisterPeriod` en **una transacción** (`db.withTransaction`), derivando importes 100% de `DuesRates` por rate code, frecuencia desde `DuesProgramming`, y año fiscal desde `FiscalYearSetup` (fallback `año-01-01` + warning). Commit `d4d7cfd`, merge fast-forward y push a `origin/BravoFrontend`. Se corrigió bug: los rate codes se guardan como string (no `parseDecimal`→0). Probado contra BD real (residente `Type A` → `AssessmentRegister` 5000/500, 1 periodo). Backlog B2–B7 pendiente (posición, summary, sync edición, derivación rates, deuda, higiene migraciones).

**Limpieza DBeaver (Hal & Rick):** field-list definido — reset de `AnnualDues`, `AnnualDuesPaidYTD`, `AnnualDuesBalance`, `SpecialAssessmentDues`, `SpecialAssessmentPaidYTD`, `SpecialAssessmentBalance`, `FinesFeesBalance`, `PriorYearCredit`, `ResidentCreditBalance`(→0), `NextYear*`, y remover sufijos `#xxx` de `ResidenceAddress`; mantener `AnnualDuesRate`/`SpecialAssessmentRate`. Backup previo de `ResidentMaster`.

## 14. Consolidación de tablas CashFlow* → una sola `CashFlow` (2026-08-27)

**Estado: NO INICIADO.** No existe una tabla única `CashFlow`/`CashFlowTransaction`; el código escribe en tablas particionadas por tipo de banco.

**Tablas actuales (`hoamanager26`):**
- Transacciones particionadas: `CashFlowTransaction_Operating`, `_Capital`, `_Escrow`, `_MoneyMarket`, `_Savings`, `_CD` (6 tablas).
- Soporte: `CashFlowLedgerMaster` (maestro por banco), `CashFlowMonthlyReportRow`, `CashFlowPostingControl`, `CashFlowRowControl`, `CashFlow_Bank_Template`.

**Factibilidad: ALTA.** Las 6 `CashFlowTransaction_*` son **idénticas en esquema**; cada una ya posee la columna `BankType` (solo difieren en su valor DEFAULT: Operating/Capital/Escrow/MoneyMarket/Savings/CD). Consolidar = una sola `CashFlowTransaction` (o `CashFlow`) con `BankType` como discriminador y clave compuesta. El `cfTableMap` en `server.js` (~línea 3530) despacha por banco a la tabla específica → debe eliminarse y escribir siempre a la tabla única. `CD` existe en BD pero no está en `cfTableMap` (el posting APR no lo usa hoy).

**Siguiente paso sugerido (pendiente de confirmar con José):** crear `CashFlowTransaction` unificada, migrar datos de las 6 shards, y actualizar `server.js` para escribir/leer la tabla única. Las tablas de soporte (`LedgerMaster`, `MonthlyReportRow`, etc.) no están particionadas y no requieren cambio.

---

*(Este documento se actualiza conforme cambian los contratos, el despliegue y las decisiones. Mantener al día.)*