# Traceability — Violation Letter Codes (TRIAL, plantilla)

## Origen VBA
- Hoja `VIOLATION LETTER CODES` (master JULY V4, `A1:L77`), 3 zonas:
  1. **Tabla de tipos** `A18:D48` → `LETTER CODES / VIOLATION TYPE / GL CODE / FINE $$` (31 filas: códigos 0–21+).
  2. **Bloques de reglas** (filas 3–16, cols B–D y F–H): intervalos/días/montos para tipos 1–16, 17–29, 50–5x; `ANNUAL ASSESSMENT RULES`, `ARREARS RULES`, `SPECIAL ASSESSMENT RULES`.
  3. Bloque `ANNUAL DUES` (cols F–H): due date, deadlines, warning/collection/final days.
- Lectores VBA: `modViolations.bas:132,149,177` (combo `cmbViolation` ← `A18:D48`),
  `frmViolationRegister.frm:141,506` (fine default ← `D19`), `:1092` (días ← `C13`).
- Consumidores: Violation Register (multas + cartas), `modManageArrears`, `BatchType1/2uf`, `ResARAging`, `CloseOpenUF`.

## Mapeo a BD (`hoamanager26_dev`)
| Hoja VBA | Tabla | Notas |
|---|---|---|
| `A18:D48` tipos | `FineTypesList` (`LetterCode, ViolationType, GLCode, FineAmount`) | + `FineCategory`, `SortOrder`, `ActiveFlag` (ver Decisiones) |
| Bloques reglas 1–16/17+ | `FinesConfig` (`RestartDays, FineAmount`) + `TimingSchedule` | 1 fila por HOA |
| Bloques arrears/annual/special | `LetterRules` (3 filas: `arrearsRules, annualDuesLateFees, specialAssessmentLateFees`) | 3 filas por HOA |

## Página app
`src/pages/Reports/LetterCodes.jsx` ← `GET /api/settings/fines-late-fees` (solo `fineTypesList timed/immediate`).

## Paridad de campos
| VBA (hoja) | App | Estado |
|---|---|---|
| LETTER CODES (A) | CODE | ✅ |
| VIOLATION TYPE (B) | TYPE | ✅ |
| GL CODE (C) | GL | ✅ |
| FINE $$ (D) | AMOUNT | ✅ |
| (agrupación por rangos 1–16/17+/50+) | CAT timed/immediate | ⚠️ ver Decisiones |
| Bloques de reglas (mismo sheet) | — (está en Settings › Fines/Late Fees) | ✅ por referencia cruzada |

## Gaps y decisiones
1. **D1 — `FineCategory` timed/immediate sin antecedente VBA**: el VBA agrupa por rangos numéricos en texto libre; la categoría es decisión del modelo `hoamanager26` (útil para el flujo de cartas). Se conserva; documentar si Rick pide los rangos originales.
2. **D2 — Reglas fuera de esta página**: a propósito; el pie de página enlaza a Settings › Fines/Late Fees.
3. **Pendiente VBA**: `Form Letters\All Violations Report Template.dotx` (plantilla Word 2017) — generación de cartas aún no migrada (Fase cartas).
