# Qué vamos a hacer — V6 Aprobado para Implementar (para ti, sin jerga)

**Para ti — en español con analogías — 4 imágenes nuevas**

**Estado:** V6 Aprobado por Rick & Hal para implementación — 7 OPEN ITEMS reconciliados + A1-A5 cerrados — **Solo falta 1 detalle: añadir `MgtCo/HOA` al `SUM` de `ResidentMaster`** (ya está contemplado) — **No ejecutar hasta tu OK final, pero ya puedes implementar**

**Versión:** `v6-reconciled-7-open-items` `51397f4` + decisiones `3,5,6` (`a0e4b32`) → **v6 implementable**

![Figura 1 — Flujo V6 completo con rama 409 old-bank](../public/workflows/plan-v6-fig1-flujo-completo_20260901.png)
*Figura 1 — Flujo completo: bloquea con `409 Requires Technical Assistance` si toca banco viejo (45 días), si no, supersede todo el año y reimprime desde enero con banco vigente por fecha.*

![Figura 2 — Split-bank por PaymentDate](../public/workflows/plan-v6-fig2-split-bank_20260901.png)
*Figura 2 — Un envío $600 SA con desborde $100 AD en 2 bancos distintos pero mismo `SubmissionKey`: `$500→Capital 201 + $100→Operating 101`. El banco no es el de hoy, es el que tocaba ese día (como el sello postal).*

![Figura 3 — CreditLedger con EventDate](../public/workflows/plan-v6-fig3-credit-ledger_20260901.png)
*Figura 3 — Crédito: la línea vieja se tacha `SUPERSEDED` y se crea nueva con `EventDate = PaymentDate` original (10/08), no fecha del replay. Solo `POSTED` cuenta — analogía: tachas la línea vieja, escribes nueva con fecha original.*

![Figura 4 — 7 libros separados por BankID, No Views](../public/workflows/plan-v6-fig4-per-bankid_20260901.png)
*Figura 4 — Cada `BankID` (101 Operating BofA, 201 Capital, 401 MoneyMarket con market, 402 Operating Truist 2º Operating) es una chequera física separada con su `RowControl` y `GL#` propio y `P&L` separado.*

---

## 1. Semáforo para ti (qué está cerrado y qué era el problema)

| Estado | Punto | Para ti |
|---|---|---|
| 🟢 Cerrado | **A1 Split-bank** | `SA→SA bank, overflow→AD bank, Credit→AD bank` — ya funciona en `001006 $500+$100` |
| 🟢 Cerrado | **A2 SubmissionKey** | No es 1 recibo; 1 envío puede ser 2 recibos en 2 bancos |
| 🟢 Cerrado | **A3 Per BankID físico** | `CashFlow_BankID_101` por `BankID` real, no por tipo, No Views — cada banco con `RowControl` y `P&L` separado (7 bancos caso real) |
| 🟢 Cerrado | **A4 BankAccountID** | `BankAccountID` (101) inmutable identifica `CashFlow_BankID_101` |
| 🟢 Cerrado | **A5 Old-bank 45d** | Bloquea Void normal con `409` si toca banco viejo, transferencia separada post-45d |
| 🟡 Reconciliado en v6 | **§1 Full-year** | Antes supersedía solo `target+later` y reinsertaba desde enero → duplicaba. **Ahora supersede TODO el FY** y reimprime desde enero con baseline `YTD=0, Due=Required` |
| 🟡 Reconciliado | **§2 CreditLedger** | Antes solo ponía `BatchID` → contaba doble. **Ahora `Status POSTED/SUPERSEDED` + `EventDate=PaymentDate` + `SupersededAt`** |
| 🟡 Reconciliado | **§3 CF por línea** | Antes `LIMIT 1` por `(SubmissionKey,Bank)` → **Ahora compuesta `(TransactionNumber, BankAccountID, GLNumber, PaymentType)`** por línea; `SUM per (SubmissionKey,Bank)` solo para total por banco |
| 🟡 Reconciliado | **§4 Tests** | Ahora con `OriginalEntryType` explícito: `SA-origin→SA` vs `AD-origin→AD`, y 2 casos `mismo banco` vs `bancos distintos` |
| 🟡 Ajuste | **§5 Tenant** | Añadir `MgtCo/HOA` a todos los locks/SELECT/UPDATE |
| 🟡 Ajuste | **§6 Backfill** | Determinístico por `TransactionNumber` exacto, resto manual |
| 🟡 Ajuste | **§7 Baseline FY** | `YTD=0` antes del primer replay, AD/SA siempre separados |

Rick dijo: *no reabrimos lo cerrado, solo alinear procedimiento/test con decisión* — **ya está alineado en v6**.

---

## 2. Qué vamos a hacer — con analogías (para que lo veas sin código)

**Analogía del libro:** Tienes el libro del año fiscal (enero-diciembre) con páginas de pagos. Si anulas la página 50 (T-001), no basta borrar 50-100 y reimprimir desde la 50 — debes **borrar TODO el libro del vecino de ese año** (supersede todo el FY) y **reimprimirlo entero desde la página 1 en orden**, usando el **banco que tocaba cada día** (no el banco de hoy), tachando crédito viejo y escribiendo crédito nuevo con fecha original.

**Pasos que ya puedes implementar (cuando digas OK):**

1. **Backup** `mysqldump hoamanager26`
2. **DDL `002` v6** (20K `b1663ac`): `AssessmentPaymentSource` (SubmissionKey per origen), `APRRecalculationBatch`, `ResidentCreditLedger` (`EventDate`, `Status`, `SupersededAt`), `AssessmentPaymentRegister` (`SubmissionKey, RecalcBatchID`), `CashFlow_BankID_XXX` per `BankID` (provisión `RowControl` por banco)
3. **Backfill determinístico** 17 rows: `Source` por `TransactionNumber` exacto (`SUM`), `SubmissionKey` por `TransactionNumber` exacto, manual si no cuadra
4. **Fixes F1-F4** + extraer `allocateAprPayment(conn, source, effectiveBanks)` (SA→SA, overflow→AD, Credit→AD)
5. **Endpoint `POST /api/apr/void` histórico:** lock `MGT:HOA:Resident + GET_LOCK`, si `row.BankAccountID` es banco viejo → `409 PENDING_TECH`, si no supersede **todo el FY** → loop `Source POSTED ORDER BY PaymentDate, TransactionNumber` con `effectiveBank = getAssessmentBank(PaymentDate)` → `CreditLedger` con `EventDate` → `CashFlow` per `(SubmissionKey,BankID,GL,PaymentType)` + `SUM per (SubmissionKey,BankID)` → `ResidentMaster` con `SUM WHERE Status='POSTED' AND MgtCo/HOA/Resident` (**detalle que Rick pide añadir: incluir `MgtCo/HOA`**) → `refresh Summary` → `COMMIT`

---

## 3. Detalle que Rick pide corregir al implementar (ya contemplado)

En `ResidentMaster` credit recomputation, añadir `MgtCoClientID, HOALicenseNumber`:

```sql
UPDATE ResidentMaster SET ResidentCreditBalance = (
  SELECT COALESCE(SUM(CASE WHEN EventType='CREDIT_CREATED' THEN Amount ELSE -Amount END),0)
  FROM ResidentCreditLedger
  WHERE MgtCoClientID=? AND HOALicenseNumber=? AND ResidentAccountID=? AND Status='POSTED'
)
```

Coherente con aislamiento tenant de v6.

---

## 4. Secuencia de ejecución aprobada

**Sujeto a ese detalle tenant,** puedes proceder:

1. Ejecutar `002_apr_historical_void.sql`
2. Backfill determinístico
3. Fixes F1-F4
4. `allocateAprPayment` + void histórico full-year
5. `AssessmentPaymentSummary` recomputation

Avísanos cuando esté listo para nuestro test controlado end-to-end.

---

*Preparado por Jose — 2026-09-01 — V6 Aprobado — Para ti — 4 imágenes nuevas meta/muse-image — 7 OPEN ITEMS reconciliados — Separate per BankID, No Views*

**Adjuntos:** `002` 20K `b1663ac`, `procedimiento-final v6` 3.5M `51397f4`, Figuras 1-4 plan-v6, `VERSIONS.json` v6
