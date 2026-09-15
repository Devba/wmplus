# Traceability — Main Directory

## Origen VBA
- Hoja `MAIN DIRECTORY` (master JULY V4, `A1:AO2550`), 30 columnas:
  `A FirstName, B MiddleName, C LastName, D Residence, E BillingAddress, F City,`
  `G St, H Zip, I Phone, J E-Mail, K Move in Date, L Type, M Acct#, N Community,`
  `O Owner, P ACH, Q ADDL OWNER FIRST NAME, R ADDL OWNER MIDDLE NAME,`
  `S ADDL OWNER LAST NAME, T BothFirstNames, U PRIMARY CELL, V SECONDARY CELL,`
  `W ADDL OWNER E-MAIL ADDRESS, X NOTES, AA Annual Dues Rate, AB Annual Dues,`
  `AC Special Assm't Dues Rate, AD Special Assm't Dues,`
  `AE Next Year Annual Dues, AF Next Year Special Assm't Dues` (Y/Z vacías).
- Lectores VBA: `Sheet36.cls` (code-behind de la hoja), `modManageArrears.bas:46-49`
  (lee `A1.CurrentRegion` completo), `modZegoExport`, `BatchType2uf`,
  `YearEndGLSummaryReportUF`, `UPDATENXTYEARDUES`, `StartUpStartDateUF`.

## Mapeo a BD (`hoamanager26_dev.ResidentMaster`)
Hoja → columnas PascalCase 1:1 (`FirstName→FirstName`, …, `Acct#→ResidentAccountID`),
más `HOALicenseNumber`, `MgtCoClientID`, `DeletedFlag`, `ActiveResidentFlag`,
`DisplayName`, `TimeStampCreated/Updated` (gestión, sin antecedente en hoja).

## Página app
`src/pages/MainDirectory/MainDirectory.jsx` ← `GET /api/main-directory/residents`
(+ `GET /api/residents`), con scope por HOA, CSV e impresión (Tier 1).

## Paridad de campos
| Hoja VBA | App | Estado |
|---|---|---|
| A–M (nombre, direcciones, ciudad, zip, teléfonos, email, move-in, type, acct) | mismos campos | ✅ |
| Q–W (additional owners, cells, email) | `addl*`, `primaryCell`, `secondaryCell` | ✅ |
| P ACH, X NOTES, AA–AF (rates/dues) | `ach`, `notes`, `annual*/special*` | ✅ |
| N Community, O Owner | — | ⚠️ ver D1 |
| T BothFirstNames | `bothFirst` (derivado nombre + addl) | ✅ derivado |

## Gaps y decisiones
1. **D1 — `Community`/`Owner` sin mapeo**: la app no los lee ni escribe (service sin esos campos). Origen probable: multi-community por archivo. Decidir con Rick si se modelan (Fase directorio) o se descartan.
2. **D2 — `DisplayName`, flags y auditoría**: agregados del modelo `hoamanager26`, sin columna en hoja. Se conservan.
3. **D3 — Y/Z vacías**: ignoradas.
