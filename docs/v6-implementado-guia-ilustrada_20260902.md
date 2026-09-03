# V6 Implementado — Guía Ilustrada de lo que se hizo

**Para ti — en español con analogías — 5 imágenes nuevas**

**Estado:** V6 Aprobado por Rick & Hal → **Implementado y verificado end-to-end en producción** (`hoamanager26`)
**Caso real de prueba:** Residente `001007`, void histórico de `APR083126-12381556`, batch `BATCH-1788352625889-kkni3` COMPLETED

---

## Punto 1 — DDL V6 creado en producción

**Analogía:** Antes de mover el dinero, construimos los **4 archivadores nuevos** donde vivirá toda la información del void histórico.

- `AssessmentPaymentSource` — el archivador **inmutable**: guarda lo que el operador escribió originalmente (monto, si entró por SA o AD). Nunca se reescribe; solo pasa a `VOID`.
- `APRRecalculationBatch` — el **expediente de auditoría** de cada replay (con `MgtCoClientID`/`HOALicenseNumber` — aislamiento por HOA cliente).
- `ResidentCreditLedger` — la **libreta de crédito** con `EventDate` (fecha económica original, no la del replay) y `Status POSTED/SUPERSEDED`.
- `AssessmentPaymentRegister` — se le añadieron las columnas de **linaje**: `SubmissionKey`, `RecalcBatchID`, `ReplacesAPRTransactionID`, `SupersededAt`.

![Punto 1 — DDL V6 en producción](../public/workflows/v6-impl-fig1-ddl_20260902.png)

---

## Punto 2 — Backfill determinístico: 19 filas APR → 17 filas Source

**Analogía:** Copiamos la **intención original** de cada pago viejo al archivador inmutable, agrupando por `TransactionNumber` exacto — como clasificar facturas por su número, **no por "se parece la fecha y el importe"**.

- 19 filas físicas en `AssessmentPaymentRegister` → **17 transacciones de negocio distintas** → **15 filas `POSTED`** en `AssessmentPaymentSource` (las 2 restantes ya estaban `VOID` y se quedan fuera a propósito).
- Cada `SubmissionKey = TransactionNumber` (1 a 1). Prohibida la heurística `resident+fecha+importe` — lo que no matchea exacto va a revisión manual.

![Punto 2 — Backfill determinístico](../public/workflows/v6-impl-fig2-backfill_20260902.png)

---

## Punto 3 — Fixes F1–F4 en el código del void

**Analogía:** El void viejo era como un cajero que al anular una factura solo devolvía **el primer recibo** y encima **tachaba líneas del calendario**. Lo corregimos:

- **F1** — Antes revierta solo `rows[0]`; ahora revierte **todas las filas** de la transacción (una txn `$500 SA + $100 AD` revierte los $600 completos).
- **F2** — Antes decrementaba `PeriodAmount` (el calendario de obligaciones); ahora el **calendario no se toca** nunca.
- **F3** — Antes el crédito quedaba inflado; ahora `ResidentCreditBalance` se **recomputa desde el Ledger** (solo `POSTED`, con tenant `MgtCo/HOA` — el detalle que Rick pidió).
- **F4** — Antes se anulaba el recibo completo de CashFlow aunque solo anularas una parte; ahora **solo se anula el efectivo de la transacción anulada**.

![Punto 3 — Fixes F1-F4](../public/workflows/v6-impl-fig3-f1f4_20260902.png)

---

## Punto 4 — Void histórico real ejecutado y verificado (001007)

**Analogía:** Borramos **el libro entero del año** del residente y lo reimprimimos desde enero, usando el **banco que tocaba cada día** — no el de hoy.

**Caso real:** Void de `APR083126-12381556` (2 filas: SA $264.23 + AD $36.54) en el residente `001007`:

| Concepto | ANTES | DESPUÉS |
|---|---|---|
| Annual Dues | 1000/1000 (due 0) | **965/1000 (due 35)** |
| Special Assessment | 500/500 (due 0) | **235.77/500 (due 264.23)** |
| Resident Credit | 1.54 | **0** |
| Filas APR | 12 activas | 12 `SUPERSEDED` + 10 re-`POSTED` |

- **F1 verificado:** las 2 filas de la txn anulada quedaron `SUPERSEDED` — la reversión es completa.
- **F3 verificado:** el crédito viejo de 1.54 desaparece correctamente — sin el desborde de la txn anulada, el pago de $700 cubre Annual Dues completo (700 vs 698.46+1.54 antes).
- Batch `BATCH-1788352625889-kkni3` **COMPLETED** con tenant, 10 transacciones reproducidas.

![Punto 4 — Void histórico real](../public/workflows/v6-impl-fig4-void-real_20260902.png)

---

## Punto 5 — CashFlow per BankID: solo se anula el efectivo de la txn anulada

**Analogía:** 7 chequeras físicas separadas (una por banco real). Al anular un pago, solo se tacha el recibo **en la chequera donde entró ese dinero** — las demás chequeras no se enteran.

- 6 tablas físicas creadas: `CashFlow_BankID_101/201/301/401/451/501` (estructura transaccional v6 con `SubmissionKey`, `CashInAmount`, `RecalcBatchID`).
- **Regla de Rick aplicada:** el replay **nunca re-postea CashFlow** — el dinero no vuelve a moverse.
- Verificado: CF de `12381556` (300.77) → `VoidFlag=Y`; CF del pago reproducido `12441098` (700) → **intacto** (`VoidFlag=N`).
- El efectivo activo por banco siempre = la porción aún válida del pago.

![Punto 5 — CashFlow per BankID](../public/workflows/v6-impl-fig5-cashflow-bankid_20260902.png)

---

## Estado final y próximo paso

| Item | Estado |
|---|---|
| DDL V6 en prod | ✅ Creado y verificado |
| Backfill determinístico | ✅ 15 Source (2 VOID excluidos a propósito) |
| Fixes F1-F4 | ✅ En código y verificados en prueba real |
| Void histórico full-year | ✅ Ejecutado: batch COMPLETED, 10 txns reproducidas |
| CashFlow per BankID | ✅ 6 tablas provisionadas + regla replay aplicada |
| **Próximo paso** | **Controlled end-to-end testing de Rick & Hal** — avisarles que la implementación está completa |

*Preparado por Jose — 2026-09-02 — V6 Implementado — 5 imágenes nuevas (meta/muse-image $0.01 c/u)*
