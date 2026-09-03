# APR Speed Test — BravoFrontend@01cec94 (dev) — 2026-08-30

**Branch:** `BravoFrontend` `01cec94` == `feature/register-entry-wiring` `01cec94` (`Update APR payment allocation and register display`)
**DB:** `hoamanager26_dev@127.0.0.1` `test2/Test123!` — **preserva histórico** (000002-000005 intactos, SPEED clones)
**Backend:** `wmplus-backend` pm2 `3011` `DB_NAME=hoamanager26_dev` — código alloc `backend/server.js:3708-4308` sin modificar (verified `git diff --stat` solo `backend/db.js`, `src/config/api.js`, `vite.config.js` tweaks dev)
**Frontend:** `wmplus-frontend` vite `5173/managereactv1-backend/` + proxy `/api → 127.0.0.1:3011`
**Chrome visible:** `DISPLAY=:1001` `XAUTHORITY=~/.Xauthority` — ventana `1280x773+0+0` `W M+ Management System` + tab `127.0.0.1:3011/api/apr/list`

## Objetivo
Recrear test Rick sin tocar allocation:
- Annual Type B = 1000, Special Type A = 500 (rates `DuesRates`  Type B 1000 / Type A 500)
- BankAccountID 1 Operating

### Casos originales (000002-000005) preservados
```
000002 APR083026-02104577 SpecialAssessment 500 + AnnualDues 100 (shared txn) Cash 600 — OK preserved
000003 APR083026-02105322 SA500 + AD100 (shared) + APR083026-02105323 AD900+Credit200 Cash 1700 — OK
000004 APR083026-02110250 SA500 + AD1000/Credit100 Cash 1600 — OK (voided in dev, but history preserved)
000005 APR083026-02110272 AD1000+Credit200 Cash 1200 — OK
000003 (0 due) APR083026-02111525 Credit300 — OK
```
Total histórico `AssessmentPaymentRegister` 9 rows antes del speed test.

## Speed test (SPEED clones, UI visible)

Se crearon 4 residentes fresh para aislar velocidad sin afectar 000002-000005:
- `000006` SPEED TEST01 Type B/Type A
- `000007` SPEED TEST02
- `000008` SPEED TEST03
- `000009` SPEED TEST04

### Script `/tmp/speed_test_apr.js` — `POST /api/apr/enter-payment` timing
```
SPEED01 special=600 -> SA500+AD100 same txn       50.7ms  txn APR083026-06510627 (2 rows) cash 600
SPEED02 special=600 annual=1100 -> 2 txns         36.7ms  txns APR083026-06510672 + APR083026-06510673 (3 rows) cash 1700 credit 200
SPEED03 special=1600 -> SA500+AD1000/Credit100     35.8ms  txn APR083026-06510718 (2 rows) cash 1600 credit 100
SPEED04 annual=1200 -> AD1000+Credit200            28.5ms  txn APR083026-06510762 (1 row) cash 1200 credit 200
SPEED02 (already paid) annual=300 -> Credit300     27.7ms  txn APR083026-06510806 (1 row) cash 300 credit 300
Average: 35.9ms over 5 cases
curl /api/apr/list 24ms, proxy /api/health 22ms
```

### Verificación DB
- Shared TransactionNumber: `000006` `APR083026-06510627` cnt=2 types SpecialAssessment,AnnualDues — OK
- `000007` cnt 2+1+1 (first txn shared, second separate, third credit) — OK
- `000008` cnt 2 shared — OK
- `000009` cnt 1 — OK
- CashFlowTransaction_Operating:
  ```
  APR083026-06510627 000006 600.00 APR payment
  APR083026-06510672 000007 1700.00 APR payment: .../...
  APR083026-06510718 000008 1600.00 APR payment
  APR083026-06510762 000009 1200.00 APR payment
  APR083026-06510806 000007 300.00 APR payment
  ```
  Cash single-row por submission (no double-count) — OK (server.js:4373-4417)
- Historico preservado: `AssessmentPaymentRegister` total 18 rows (9 old + 9 new), 14 transactions en `/api/apr/list` sin deletes.

### Chrome visible
- Ventana principal `http://127.0.0.1:5173/managereactv1-backend/` 1280x773
- Segunda tab `http://127.0.0.1:3011/api/apr/list?limit=50` para inspección raw JSON
- Frontend proxy `/api` funciona (vite restarted, curl `/api/health` 200)

## Conclusión
- Todos los casos de alloc Rick pasan idéntico con clones fresh.
- Latencia backend 27-51ms avg 36ms (dev local, sin optimización extra).
- Sin cambios en `server.js:3708-4308` y `AssmtPaymtRegister`, solo datos SPEED nuevos.
- Historico de 000002-000005 preservado para auditoría.

Siguiente paso opcional: repetir vía UI clicks (Master Nav → Assmt Paymt Register → Enter) midiendo tiempo de render, o stress test 100 pagos secuenciales.
