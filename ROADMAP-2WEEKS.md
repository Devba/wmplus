# ROADMAP — Migración W M+ Management System
**Período:** 2 semanas (sprint)
**Objetivo:** Sprint checkpoint demo funcional end-to-end
**Alcance:** Transacciones core (CR/DP/APR/BDC/XFER) + Settings restantes
**Equipo:** Backend (José) + Frontend (Hal) — división de responsabilidades respetada

---

## Leyenda
- **B** = Backend · **F** = Frontend · **C** = Coordinado
- Estado actual: ✅ hecho · 🟡 en curso · ⬜ pendiente

---

## SEMANA 1 — Cimientos y CR/DP

### Lunes–Martes: Preparación y limpieza técnica
| # | Tarea | Dueño | Est. | Estado |
|---|-------|-------|------|--------|
| 1 | Unificar contrato `/api/gl-options` (clave `glAccounts`, banco sin filtro estricto) | C | 0.5d | 🟡 |
| 2 | Reemplazar hardcoded `localhost:3011` en services de Settings por `API_BASE_URL` | F | 0.5d | ⬜ |
| 3 | Revisar y aprobar commit pendiente `9955a88` (Settings persistence) y rutas Void Check | B | 0.5d | ⬜ |
| 4 | Coordinar push sincronizado backend/frontend (rama compartida) | C | 0.5d | ⬜ |

### Miércoles–Jueves: Check Register cierre + Deposit Register
| # | Tarea | Dueño | Est. | Estado |
|---|-------|-------|------|--------|
| 5 | CR: resolver payees que no casan (`V-001` vs `VEND-0xx`), orden ASC confirmado | B | 0.5d | ⬜ |
| 6 | CR: test end-to-end (Enter → persistir → reload → Void) en staging | C | 0.5d | ⬜ |
| 7 | DP: R&R de `/api/gl-options?screen=DP` en Enter Deposit UF (reemplazar array hardcodeado) | F | 1d | ⬜ |
| 8 | DP: endpoint gl-options ya desplegado; verificar `UseInDP` en GL Mapping | B | 0.5d | ⬜ |

### Viernes: Hito Semana 1
- Demo parcial: CR completo + DP con dropdown GL dinámico.
- Retro + ajuste de estimaciones para Semana 2.

---

## SEMANA 2 — APR/BDC/XFER + Settings + Checkpoint

### Lunes–Martes: APR y BDC
| # | Tarea | Dueño | Est. | Estado |
|---|-------|-------|------|--------|
| 9 | APR: R&R de `/api/gl-options?screen=APR` en Assmt Paymt Register Entry | F | 1d | ⬜ |
| 10 | APR: verificar `UseInAPR`, persistencia POST, balances | B | 0.5d | ⬜ |
| 11 | BDC: R&R `/api/gl-options?screen=BDC` en Bank Debits & Credits | F | 1d | ⬜ |
| 12 | BDC: `UseInBDC`, persistencia y reconciliación bancaria | B | 0.5d | ⬜ |

### Miércoles–Jueves: XFER + Settings restantes
| # | Tarea | Dueño | Est. | Estado |
|---|-------|-------|------|--------|
| 13 | XFER: R&R `/api/gl-options?screen=XFER` en $$ XFER / Intra Acct | F | 1d | ⬜ |
| 14 | XFER: `UseInXFER`, persistencia | B | 0.5d | ⬜ |
| 15 | Settings: Fiscal Year Setup — reconciliar SQL vs schema `FiscalYearSetup` y conectar | C | 1d | ⬜ |
| 16 | Settings: validar Banking/General/Dues/Fines persistence (commit 9955a88) en staging | C | 0.5d | ⬜ |

### Viernes: Checkpoint final (demo)
| # | Tarea | Dueño | Est. | Estado |
|---|-------|-------|------|--------|
| 17 | Deploy sincronizado a staging/VPS (`manage-Bravofrontend` + backend PM2) | C | 0.5d | ⬜ |
| 18 | Demo end-to-end: GL Mapping → gl-options → 5 pantallas de entrada → registros | C | 0.5d | ⬜ |
| 19 | Checklist de aceptación + plan de deuda técnica restante | C | 0.5d | ⬜ |

---

## Resumen de estimación (11 días hábiles)
- **Backend (José):** ~4.5 días (rutas gl-options verificación, persistencia, payees, fiscal year SQL, deploy)
- **Frontend (Hal):** ~4.5 días (R&R CR→DP→APR→BDC→XFER, limpieza localhost, demo)
- **Coordinado:** ~2 días (contratos, pushes, demo, deploy)

## Riesgos / bloqueantes
1. **Fiscal Year Setup**: el mismatch SQL↔schema puede requerir >1d (inventariar primero).
2. **Payees huérfanos**: `V-001` y IDs que no casan con maestros → limpieza de datos (B).
3. **Rama única compartida**: si backend y frontend no coordinan pushes, vuelve el conflicto de repos locales.
4. **Void/Modify flujos**: si la demo requiere void completo, sumar ~1d (no está en el alcance base).

## Fuera de alcance (post-sprint)
- Reportes/registros (Monthly Summaries, Open Checks, Escrow, AR Aging).
- Regla permanente de elegibilidad de banco en backend.
- Migración de los 24 módulos restantes del tray.