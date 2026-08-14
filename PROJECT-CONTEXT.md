# PROJECT CONTEXT — W M+ Management System

> **Para cualquier agente opencode (nuevo o existente):** lee este documento + `AGENTS.md` ANTES de trabajar. Contiene el historial, contratos de API, acuerdos del equipo y estado actual del despliegue.

**Última actualización:** 2026-08-13
**Rama de trabajo actual:** `features/vivomysql-mcp`
**Branches relevantes:** `BravoFrontend` (integración), `feature/register-entry-wiring` (trabajo de Hal/frontend), `backend` (backend histórico), `main`

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

- [ ] CR Modify GL# end-to-end (Hal lo mergeará de `BravoFrontend` a su rama y probará).
- [ ] R&R del patrón `gl-options` a DP → APR → BDC → XFER (frontend, según roadmap).
- [ ] Regla definitiva de elegibilidad de banco (coordinar backend/frontend).
- [ ] Fiscal Year Setup: reconciliar SQL vs schema `FiscalYearSetup`.
- [ ] Payees que no resuelven (p.ej. `V-001` vs `VEND-0xx`) — limpieza de datos.
- [ ] Migración de los módulos restantes del tray (reportes, escrow, AR, violaciones, etc.).

## 7. Notas técnicas importantes

- **Nunca subir credenciales** (`opencode.json` con credenciales MySQL está en `.gitignore`).
- El frontend clonado en `feature/register-entry-wiring` puede usar `localhost:3011` hardcodeado en algún service (ya se limpió la mayoría → usar `API_BASE_URL`).
- Para pruebas locales: frontend `npm run dev`, backend `node server.js` en `backend/`.
- La BD es de **pruebas**: `ViolationRegister` vacía, `FinesFeesBalance=0`. Residentes con deuda: 248 de 910 activos.

## 8. Cómo continuar el trabajo desde otro servidor

1. Clonar repo y leer `PROJECT-CONTEXT.md` + `AGENTS.md`.
2. Configurar `opencode.json` local con MCP MySQL (`hoamanager26`) y Playwright.
3. Trabajar en una rama; siempre `git pull` antes de empezar y coordinar pushes.
4. Consultar/acceder al VPS vía SSH (puerto 44) si se necesita desplegar o inspeccionar.

## 9. Estrategia de trabajo actual (2026-08-14)

- **Frontend (Hal) trabaja solo en su rama.** Backend se mantiene en **modo observación**:
  - Revisar los pushes de Hal en `feature/register-entry-wiring` cuando ocurran.
  - **No tocar su trabajo** ni hacer merges prematuros mientras no haya urgencia.
- **Cuándo intervenir (reglas de alerta):**
  1. Un push de Hal que toque `backend/server.js` sin coordinar (rompe el acuerdo de responsabilidades) → revisar y avisar.
  2. Hal anuncie **despliegue al VPS** o un merge grande → integrar ANTES ambos `server.js`:
     - Backend actual (VPS/BravoFrontend) tiene: `modify-gl/submit`, `gl-options`, `useIn*`, `gl-mapping`.
     - Rama de Hal tiene: `void/execute`, `dues-programming`, `fines-late-fees`, vendor IDs.
     - Sin integrar, un despliegue con solo una de las versiones **pierde endpoints del otro lado**.
- **Pendientes tras cualquier merge:** probar CR Modify GL# end-to-end (Hal lo hará tras mergear `BravoFrontend` a su rama).

---

*(Este documento se actualiza conforme cambian los contratos, el despliegue y las decisiones. Mantener al día.)*