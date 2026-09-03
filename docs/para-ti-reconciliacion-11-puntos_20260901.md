# Para ti — Los 11 puntos de Rick explicados sin jerga

**Para:** Tú (interno) — **De:** Jose — **Fecha:** 2026-09-01 — **Estado:** DISCUSSION ONLY  
**Contexto:** Rick revisó nuestra `v4-nv` (`64538dd` 8p, `002` 18K) contra `BravoFrontend ffdea5c` y dijo: *“la arquitectura central ya converge, pero no apruebo hasta que reconciliéis sobre todo §§1,2,3”*. Los otros 8 son ajustes menores.

---

## Resumen en 5 líneas (si no quieres leer 11)

Rick dice: **vais bien, pero hay 3 cosas que chirrían** y 8 detalles a pulir. Si lo arreglamos, dan aprobación final. **No tocar código/BD aún.**

| Semáforo para ti | Punto | Qué es |
|---|---|---|
| 🟡 Hay que corregir | **§1 Full-year replay** | Decimos “borro T-001 y posteriores y reimprimo desde enero” → duplicamos enero-abril |
| 🟡 Hay que corregir | **§2 CreditLedger** | Guardamos crédito nuevo pero el viejo sigue sumando → balance doble |
| 🟡 Hay que corregir | **§3 CashFlow por línea** | `(SubmissionKey, BankID)` no basta para identificar una línea con mismo banco y distinto GL/tipo |
| 🟢 Ya alineado | §4 Tests | Solo aclarar que $500+$100 en 2 bancos son 2 recibos, y que `OriginalEntryType` sea explícito |
| 🔵 Tu decisión | §5 Old-bank 45 días | Dinero en banco viejo no se reescribe; si hay que tocarlo, necesita asistencia técnica — ¿bloqueamos el Void? |
| 🟢 Alineado | §6 Per-BankID físico | Cada `BankID` su tabla `CashFlow_BankID_XXX`, `No Views` — ya es tu regla |
| 🟡 Ajuste menor | §7 Multi-tenant | Añadir `MgtCo/HOA` a todos los locks/queries (hoy solo `Resident+FY`) |
| 🟢 Detalle | §8 Backfill determinístico | No usar “cerca en fecha”, usar `TransactionNumber` exacto o revisión manual |
| 🟡 Ajuste menor | §9 Estado inicial FY | Definir YTD=0, Due=Required antes del primer replay de enero |
| 🟢 Detalle | §10 FY metadata | Verificar `CurrentFiscalYearBegins` antes de backfill (Fiscal 2025/Per 8 erróneo no se preserva) |
| 🟢 Ya incluido | §11 F1-F4 | Ya están en v4, Rick los verificará al probar código real |

---

## Los 11 puntos con analogía de la vida real

### §1 — Full-year replay vs supersede solo target+later
- **Qué dice Rick:** *Si supersedes solo T-001 y posteriores pero luego haces `SELECT Source WHERE POSTED desde enero`, reinsertas también enero-abril que no supersediste → duplicado.*
- **Analogía:** Tienes un libro de enero a diciembre. Borras solo páginas 50-100 y luego reimprimes **desde la página 1** sin haber borrado la 1-49 → la 1-49 ahora está dos veces.
- **Qué haremos en v5:** Para *true full-year rebuild*, **borramos TODAS las páginas activas del año de ese vecino** (`Status='POSTED' → SUPERSEDED` para todo `(MgtCo,HOA,Resident,FY)`) y luego reimprimimos **todas** las `Source POSTED` en orden cronológico desde enero. Obligaciones `Required AD/SA` y `Period` schedules permanecen intactas; `YTD` y `Credit` parten de 0 antes del primer replay.

### §2 — CreditLedger: supersede y EventDate
- **Qué dice Rick:** *La ledger es append-only pero solo le ponéis `BatchID` y luego `SUM(CREATED - CONSUMED)` cuenta el viejo + el reemplazo. Además `TimeStampCreated` es la fecha del replay, no la fecha económica del crédito.*
- **Analogía:** Apuntas un ingreso de $100 el 10/08 en tu libreta. Luego lo “corriges” añadiendo otra línea de $100 el 01/09 con nota “rehice”, pero al sumar cuentas $200 porque no tachaste la línea vieja. Y apuntas la fecha económica como 01/09 cuando el dinero entró el 10/08.
- **Qué haremos:** `CreditLedger` tendrá `Status POSTED/SUPERSEDED`, `SupersededAt`, `RecalcBatchID` y **`EventDate` inmutable = `PaymentDate` del source**. El saldo será `SUM WHERE Status='POSTED'` — el viejo queda tachado como `SUPERSEDED` para auditoría.

### §3 — (SubmissionKey, BankAccountID) no identifica línea individual CF
- **Qué dice Rick:** *Si SA y AD van al mismo banco, un pago $500 SA + $100 AD overflow comparten `SubmissionKey, TransactionNumber, BankAccountID` pero son distinto `PaymentType/GL` (ej. SA vs AD). Con `LIMIT 1` podrías superseder solo una línea.*
- **Analogía:** Misma factura con dos conceptos en la misma chequera: no puedes anular “la factura” a secas — debes especificar línea 1 (SA, GL 1010) y línea 2 (AD, GL 1020).
- **Qué haremos:** Distinguir **caja total por banco** (`SUM per (SubmissionKey, BankID)` para reconciliar $600) vs **línea individual** (`TransactionNumber + BankAccountID + GLNumber + PaymentType` o un `AllocationLineID` estable) para superseder. `LIMIT 1` desaparece.

### §4 — Testing Plan (§5 en PDF)
- **Qué dice Rick:** *`SA $500 + AD $100 → 1 CF $600` no siempre es cierto: si SA y AD están en bancos distintos, son `$500 SA bank + $100 AD bank` (como tu test 001006). Y aclara `OriginalEntryType` en T-001/T-002/T-003 o no se sabe si T-002 es SA-origin (debe ir a SA tras void) o AD-origin (se queda AD).*
- **Qué haremos:** Dos tests separados (mismo banco vs bancos distintos) y tests con `OriginalEntryType` explícito. Ya está en Figura 2, solo aclarar redacción.

### §5 — Old-bank 45-day rule
- **Qué dice Rick:** *Dinero ya depositado en banco viejo se queda allí. Moverlo antes de 45 días de clearing es transferencia separada, no reescribir recibo. Si hay que modificar una transacción que quedó en banco viejo, requiere asistencia técnica.*
- **Analogía:** Depositaste un cheque en BofA. Aunque cambies tu banco preferido a Truist, ese cheque de BofA sigue en BofA 45 días. No puedes “mover” el apunte, haces una transferencia nueva pasado el plazo. Y si necesitas anular ese apunte viejo, no lo haces tú solo — llamas al banco.
- **Qué haremos:** El `POST /api/apr/void` histórico verificará si la fila afectada está en `OldBankAccountID` con `EffectiveDate < NOW()-45d` y no es banco actual → responde `409 Requires Technical Assistance` y deja `Batch PENDING_TECH`, no hace auto-transferencia.

### §6 — CashFlow per BankID físico
- **Qué dice Rick:** *Confirmamos 1 tabla física por `BankID` real (`CashFlow_BankID_XXX`), provisionada al crear el banco. Decid cuál identificador es el inmutable para `resolveCashFlowTable()`.*
- **Qué haremos:** Usar **`BankAccount.BankID` (designación inmutable, ej. 101/201/401)** — no el `BankAccountID` PK interno si puede reciclarse — como sufijo de tabla. Ya está agnóstico: `resolveCashFlowTable(BankAccountID) → CashFlow_BankID_<BankID>`.

### §7 — Multi-tenant
- **Qué dice Rick:** *Varios SELECT/UPDATE solo filtran por `Resident+FY`. Un `ResidentAccountID` puede repetirse en otro HOA.*
- **Qué haremos:** Añadir `MgtCoClientID, HOALicenseNumber` a **todos** los locks y queries (`Source`, `APR`, `Register`, `CreditLedger`, `CashFlow`, `Summary`, `GET_LOCK('apr-replay:MGT:HOA:Resident')`).

### §8 — Backfill determinístico
- **Qué dice Rick:** *No hagáis matching por “cerca en fecha/operator” o “residente+fecha+importe” — podéis unir dos pagos legítimos distintos. Usad `TransactionNumber` exacto; lo que no cuadre, revisión manual.*
- **Qué haremos:** `Source` desde `TransactionNumber` exacto (`SUM(TotalAmount)` por `TransactionNumber`); `CashFlow` por `SourceTransactionNumber` exacto; el resto (17 rows dev) revisión manual explícita.

### §9 — Estado inicial FY
- **Qué dice Rick:** *Definid el estado justo antes del primer replay de enero: obligaciones AD/SA separadas intactas, YTD y balances dependientes de replay en baseline conocido, no contra el estado pagado de hoy.*
- **Qué haremos:** Antes del loop: `YTD=0, Credit=0, Due=Required` por `DuesType`; `Period` schedules intactos y separados aunque `Frequency` coincida.

### §10 — Fiscal-year metadata
- **Qué dice Rick:** *`Source.CurrentFiscalYearBegins` está bien como clave inmutable, pero no backfilleéis un FY erróneo. El test 09/01 mostró `FiscalYearLabel=2025 Period=8` cuestionable.*
- **Qué haremos:** Verificar `FiscalYearSetup` y recalcular FY desde `PaymentDate` al poblar `Source`, no copiar el `2025/8` existente.

### §11 — F1-F4
- **Qué dice Rick:** *V4 dice que F1-F4 están incorporados — no los certificamos ahora, los verificaremos con código real.*
- **Qué haremos:** Nada nuevo; quedan para test de código.

---

## Qué nos falta decidir juntos (tus 3 decisiones)

1. **§3:** ¿`AllocationLineID` nuevo o te vale `(TransactionNumber, BankAccountID, GLNumber, PaymentType)`?
2. **§5:** ¿Bloqueo total del Void viejo (409) o cola `PENDING_TECH` que un técnico convierte en transferencia post-45d?
3. **§6:** ¿Confirmas `BankID` (101/201) como identificador inmutable para `CashFlow_BankID_XXX`?

---

## Próximo paso

Nada de DDL/código hasta que contestes a Rick con este `v5` reconciled y os deis **aprobación mutua final**. Yo ya tengo `BravoFrontend ffdea5c` pulleado, `002 v4` (18K `d1937ff`) y `procedimiento-final v4-nv` (3.5M `64538dd`) listos para pasar a `v5` en cuanto elijas las 3 decisiones de arriba.

*Preparado por Jose — 2026-09-01 — Para ti, sin jerga.*
