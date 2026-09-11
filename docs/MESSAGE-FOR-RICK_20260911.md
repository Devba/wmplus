# Message for Rick — CR HOA-Local Date/Time Stamping (Item 8)

**Date:** 2026-09-11
**Branch:** `BravoFrontend` (local `/home/alvaro/wmplus`, pulled to e26d6eb + 8d7ef23)
**Server:** `pm2 wmplus-backend`, port 3011, database `hoamanager26_dev`
**Scope:** Check Register (CR) date/time stamping only, plus the Cash Flow ledger master writers required for consistency.

---

**Copy-paste for Teams / Email:**

```
Hi Rick,

Item 8 (CR date/time stamping) is done and tested on the active server.

What we changed (backend/server.js only):

1. One reusable helper pair, next to the existing lookupZip import:
   - getHoaTimeZone(conn): reads SystemSettings.DefaultZip, resolves it with
     zipcode-detail-lookup, falls back to UTC, cached 5 minutes.
   - hoaNow(conn): returns { timeZone, transactionStamp (MMDDYYYY-HHMMSS + 2
     centiseconds, HOA local), utcDateTime, hoaLocalDateTime } using
     Intl.DateTimeFormat with hourCycle 'h23' (no "hour 24" edge case).
   No MySQL CONVERT_TZ was used, so we do not depend on the server tz tables.

2. Step A - CR transaction number. generateCheckTransactionNumber() no longer
   uses NOW(2). It now builds CHK + MMDDYYYY-HHMMSS + centiseconds from HOA
   local time. The uniqueness retry loop (200 attempts, 10 ms) is unchanged.

3. Step B - CR audit timestamps. TimeStampCreated (POST /api/check-register)
   and TimeStampUpdated (clear and void) are now stored in UTC. We chose UTC
   for stored stamps (instead of HOA local wall clock) for one reason: CR has
   no UTC column, and Cash Flow already established the rule of storing the
   stamp and rendering it in the HOA timezone. The human-readable CHK number
   keeps HOA local time. No historical rows were touched.

4. One consistency change you should know about. CashFlowLedgerMaster
   (LastPostedDateTime / TimeStampUpdated) is written from four places:
   CR clear, DP, APR, and the void/replay path. If only the CR writer had
   changed to UTC, the column would have mixed semantics and the Cash Flow
   "Last Updated" would have been wrong. So all four writers now store UTC,
   and the read query now formats TimeStampUpdated directly as UTC instead of
   subtracting the MySQL server offset. We also converted the ledger master
   INSERT (TimeStampCreated) and the CR void path for the same reason.

Important environment finding: the MySQL server clock is America/Chicago, not
UTC. Before this change every CHK number was one hour ahead of the HOA
(Chicago vs Denver).

Test evidence (ZIP 81435 -> America/Denver, server restarted, port 3011):
- UTC 2026-09-11 09:05:19 -> CHK09112026-03051956 (03:05:19 Denver).
  Before the change it would have been 04:05:19 (Chicago).
- CheckRegister.TimeStampCreated = 2026-09-11 09:05:19 (UTC).
- Cleared the same check: CheckRegister.TimeStampUpdated = 09:15:48 UTC,
  CashFlowLedgerMaster.LastPostedDateTime = 09:15:48 UTC,
  TimeStampUpdated = 09:15:48 UTC, balance 145,014.66 -> 145,013.66.
- GET /api/cash-flow?bankId=101&fiscalYear=2026 returns hoaTimeZone
  America/Denver and lastUpdated 2026-09-11T09:15:48Z, which React renders
  as 03:15:48 Denver.

Two things for you:

(a) Development database schema was behind the pushed code. CashFlowLedgerMaster
    had no StartMonth and CashFlow_BankID_* had no CashOutAmount /
    ActiveCashOutAmount, so the Cash Flow page failed with "Unknown column
    'StartMonth'" and clearing a check failed with "Unknown column
    'CashOutAmount'". We applied additive ALTERs (DECIMAL(14,2) DEFAULT 0.00,
    VARCHAR(20) NULL) to all six CashFlow_BankID_* tables and to
    CashFlowLedgerMaster in hoamanager26_dev. Please confirm these match the
    DBA definitions in docs/CASHFLOW-CONSOLIDATION-DBA.sql and include them in
    the migration set.

(b) Recommended next step (not done): postCashFlowTransaction() still lets
    TimeStampCreated default to NOW() on the CashFlow_BankID_* row, so those
    rows keep Chicago time while the ledger master now holds UTC. It is a
    one-line change in the shared helper, but it affects DP and APR as well, so
    I left it out of this CR-only pass.

Historical data was not rewritten. DP and APR registers were not changed.
After this is verified we can carry the same rule into DP and APR in a
controlled manner, as you suggested.

Thanks,
```

---

## Local details (not for Rick)

- Files changed: `backend/server.js` only (155 / -32).
- Helper locations: `getHoaTimeZone` (server.js:30), `hoaClockParts` (:80), `hoaNow` (:101).
- Call sites: CHK number (:1199), ledger master INSERT (:1450), CR create (:2005), CR clear (:2218), DP (:2598), APR (:3773), CR void (:3872), void/replay (:7163).
- Cash Flow UTC derivation: server.js:1533-1538 (now a direct `DATE_FORMAT(TimeStampUpdated, '%Y-%m-%dT%H:%i:%sZ')`).
- Test artifacts left in `hoamanager26_dev` as evidence: check `CHK09112026-03051956` (check #9001, $1.00, GL 30000, cleared), one `CashFlow_BankID_101` row, and `CashFlowLedgerMaster` ID 1 for bank 101 / FY2026.
- Note: `hoamanager26` (the other database) still has two ledger rows stamped in Chicago time; they are not used by this server.
