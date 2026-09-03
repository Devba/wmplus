# Propuesta de Rick — Void Histórico de Pagos APR

> **Estado:** Solo discusión. Sin cambios de código ni BD hasta aprobación mutua (Rick ↔ Jose).
> **Fecha:** 2026-09-01 · **Autor propuesta:** Rick · **Revisor:** Jose

---

## 1 · El problema en una frase

> Anular un pago **antiguo** deja los pagos **posteriores** del residente mal asignados, porque esos pagos se distribuyeron según saldos que ya no existen.

### Ejemplo real de Rick (3 pagos del mismo residente)

| Orden | Qué encontró el sistema | Dónde cayó el dinero |
|-------|------------------------|----------------------|
| **Pago 1** — $500 | Special Assessment pendiente | → **Special Assessment** |
| **Pago 2** — $100 | SA ya estaba pagado → desborda | → **Annual Dues** |
| **Pago 3** — $100 | Annual Dues ya pagado → desborda | → **Resident Credit** |

**Si hoy se anula el Pago 1**, el Special Assessment vuelve a deberse… pero los pagos 2 y 3 **siguen asignados como si nada**. Quedan mal.

```
Pago 1 (SA $500) ──┐
                   ├──► Void Pago 1 ──► SA vuelve a deberse
Pago 2 (→ AD) ─────┤         ▲
Pago 3 (→ Crédito)─┘         │ pero 2 y 3 no se recalcularon ✗
```

---

## 2 · La regla que propone Rick

```
¿El pago a anular es el ÚLTIMO activo del residente?
 │
 ├── SÍ ──► Void normal (ya funciona, está probado)
 │
 └── NO ──► Void + REPLAY histórico
            1. Anular el pago seleccionado
            2. Reproducir TODOS los pagos posteriores
               en orden cronológico, recalculando
               su asignación con las reglas normales
```

El replay va **desde el pago anulado hasta el último activo** del residente.

---

## 3 · Distinción clave: transacción de negocio vs. filas de asignación

Un **pago de negocio** puede generar **varias filas** en `AssessmentPaymentRegister` con el mismo `TransactionNumber`.

> Ejemplo: el residente ingresa **$600 en el campo Special Assessment**.
> El sistema crea **1 transacción de negocio** ($600) pero **2 filas de asignación**:
> - $500 → Special Assessment
> - $100 → Annual Dues (desborde)
>
> El replay debe operar sobre el **pago original**, no sobre filas sueltas.

Si en un envío hay SA y AD ingresados por separado, son **2 transacciones con números distintos** (regla ya acordada).

---

## 4 · Las 4 piezas del diseño

### 4.1 · Tabla nueva: `AssessmentPaymentSource` (inmutable)

Guarda **lo que el operador escribió originalmente**, antes de que el sistema lo reparta.

| Campo | Ejemplo |
|-------|---------|
| `TransactionNumber` | APR083126-12381556 |
| `ResidentAccountID` | 001007 |
| `OriginalEntryType` | `SpecialAssessment` / `AnnualDues` |
| `OriginalAmount` | 600.00 |
| `PaymentDate`, `BankAccountID`, `ElectronicPaymentID` | … |
| `MgtCoClientID`, `HOALicenseNumber`, `CurrentFiscalYearBegins` | … |
| `OperatorID`, `Status`, `TimeStampCreated` | … |

**Regla de oro:** monto, tipo de entrada y fecha **nunca se reescriben**. Solo `Status` puede pasar a `VOID`. Así se preserva evidencia de la intención original.

**Por qué importa el tipo:** las reglas de desborde son distintas:
- SA: `Special Assessment → Annual Dues → Resident Credit`
- AD: `Annual Dues → Resident Credit`

### 4.2 · Filas de asignación: reemplazar, no editar

Un pago que antes fue `$100 → Crédito` podría, tras el replay, volverse `$100 → Special Assessment`. Incluso el **número de filas** puede cambiar (1 ↔ 2).

Propuesta:
- Filas viejas → se marcan **SUPERSEDED** (queda auditoría)
- Filas nuevas → activas, con el **mismo `TransactionNumber`**
- La pantalla APR muestra solo las **activas**

### 4.3 · Auditoría: `APRRecalculationBatchID`

Un identificador por cada operación de replay histórico:

> *Transacción X fue anulada, lo que requirió reproducir A, B, C y D. Estas fueron las asignaciones originales y estas las recalculadas.*

Campos del batch: transacción anulada, residente, operador, fecha/hora, lista de transacciones reproducidas, asignaciones previas vs. nuevas, motivo = "historical APR Void".

### 4.4 · Todo o nada — una sola transacción de BD

```
 1. Identificar pago + residente
 2. Detectar si hay pagos posteriores activos
 3. Armar set ordenado de pagos a reproducir
 4. BEGIN TRANSACTION
 5. Reversar el pago seleccionado
 6. Rebobinar posición a justo antes del pago anulado
 7. Leer Source inmutable del siguiente pago → re-ejecutar reglas normales
 8. Repetir hasta el último pago del residente
 9. Refrescar AssessmentPaymentSummary SOLO al final
10. COMMIT si todo ok — ROLLBACK si algo falla
```

> `AssessmentPaymentSummary` nunca se sobreescribe a mano. Siempre deriva del historial. Cada saldo debe ser explicable desde las transacciones.

---

## 5 · Qué dice Rick que NO se debe hacer

- ~~Recalcular totales y pisar `AssessmentPaymentSummary` directamente~~
- ~~Editar filas viejas in-place~~
- ~~Inferir la intención original sin tabla Source~~

---

## 6 · Estado actual (según Rick)

- ✅ Void del **último** pago: probado (reversión de filas, crédito, protección SA/AD, refresh de Summary, reload del front).
- ⏳ Void histórico (pago intermedio + replay): **no implementado ni probado** — es lo que se propone ahora.

## 7 · Lo que Rick le pide a Jose

1. ¿Es `AssessmentPaymentSource` la mejor forma de preservar la intención?
2. ¿Filas posteriores deben reemplazarse (SUPERSEDED) en vez de editarse?
3. ¿Es adecuado el `APRRecalculationBatchID`?
4. ¿El replay debe reconstruir desde justo antes del void u otro baseline?
5. ¿Qué riesgos de integridad / concurrencia ves?

---

## Anexo · Hallazgos de Jose en revisión del 2026-09-01

Revisión read-only sobre `AssessmentPaymentRegister`, `AssessmentRegister`, `AssessmentRegisterPeriod`, `AssessmentPaymentSummary` y `backend/server.js:3955-4621`.

| # | Hallazgo | Ubicación | Impacto en el diseño |
|---|----------|-----------|----------------------|
| F1 | El void actual revierte solo `rows[0]` de la transacción — sub-revierte transacciones multi-fila (ej. `APR083126-12381556: $264.23 SA + $36.54 AD`) | `server.js:4576-4592` | El primitivo de void sobre el que se apoya el replay debe corregirse |
| F2 | `enter-payment` no toca `AssessmentRegisterPeriod` (schedule), pero el void sí decrementa `PeriodAmount` | `server.js:4363-4364` vs `4589-4592` | El replay no debe tocar Period |
| F3 | `ResidentMaster.ResidentCreditBalance` se incrementa al pagar pero el void no lo revierte | `server.js:4351-4361` | El rebuild del replay debe incluirlo |
| F4 | CashFlow es 1 fila por envío UF, atada solo al primer `TransactionNumber` | `server.js:4388-4417` | Void de 1 de 2 txns del mismo envío deja CashFlow ambiguo — definir regla; el replay no debe re-postear CashFlow |

**Recomendaciones de Jose:** aprobar la dirección con esos 4 fixes previos; supersede con `Status` (`POSTED/SUPERSEDED/VOID`); batch con header + columnas `RecalcBatchID` en APR; rebuild de agregados desde filas activas (o replay de todo el año fiscal por simplicidad); locks `AssessmentRegister → APR → ResidentMaster` + `GET_LOCK` por residente.

---

*Doc generado el 2026-09-01 — imágenes del flujo en `~/wmplus/docs/workflows/` y `~/wmplus/public/workflows/`.*
