# Verification of Rick's Sep-10 Claims — APR + Cash Flow (dev server)

**Date:** 2026-09-11
**Branch:** `BravoFrontend` @ 6756d83 (pulled e26d6eb + 8d7ef23, plus CR timezone commit)
**Server:** `pm2 wmplus-backend`, port 3011, database `hoamanager26_dev`
**Method:** live API tests on a fresh test resident + code review + UI screenshots.
**Test resident:** `009991` (Demo TimezoneTest, AnnualDuesRate `Type B` → required 1000, SpecialAssessmentRate `Type A` → required 500). Left in dev as evidence with all rows.

---

**Copy-paste for Teams / Email:**

```
Hi Rick,

I reviewed and tested your Sep-10 push on the dev server (BravoFrontend,
hoamanager26_dev). I used a fresh test resident (009991, required AD 1000 /
SA 500) and replayed allocation paths equivalent to yours. Verdict: PASS,
with setup fixes and observations below.

1. ALLOCATION PATHS — ALL PASS (fresh resident 009991)

  T1  $600 SA  -> $500 SA (GL 40020) + $100 AD (GL 40000), same APR txn
      number, both POSTED to bank 101. Registers: SA due 500->0, AD due
      1000->900. CashFlow_BankID_101 got both rows. Ledger 101 +600.
      (Mirrors your $600 -> $500 + $100 exactly.)

  T2  $200 SA after SA fully paid -> $200 AD (GL 40000). AD due 900->700.
      (Mirrors your $200 -> $200 exactly.)

  T3  $800 SA with $700 AD remaining -> $700 AD (GL 40000) + $100
      ResidentCredit (PaymentType=ResidentCredit, GL 50000). AD due 700->0.
      (Mirrors your $800 -> $700 + $100 exactly.)

  T4  Direct $100 AD after AD fully paid -> $100 ResidentCredit
      (GL 50000). (Mirrors your $100 -> $100 exactly.)

  Final: AD paid YTD 1000 / due 0; SA paid YTD 500 / due 0;
  ResidentMaster.ResidentCreditBalance = 200.00; ledger 101 reflects
  +1700 total. Credit rows carry BankAccountID 1 (the programmed
  Receiving Bank) with GL 50000 identifying the money — as designed.

2. GUARDS — ALL PASS

  - Both boxes at once -> 400 'Enter either an Annual Dues payment or a
    Special Assessment payment, not both.' (server; frontend also blocks
    with 'Enter the payment in either Annual Dues OR Special Assessment,
    not both.' plus an ENTER-button isSubmitting lock).
  - Resident without valid rate codes -> GET
    /api/residents/RES-0723/current?ensureAssessments=1 returns
    code RESIDENT_ASSESSMENT_RATES_INVALID with the Main Directory
    message. (Note: the check lives in that GET, which the APR form
    calls to initialize — a direct POST to /api/apr/enter-payment
    bypasses it and posts everything as credit. You may want the POST
    to enforce it too.)

3. STATIC CHECKS — ALL PASS

  - GL 50001-50099 'Resident Credit Assignable Sub Headings'
    (parentGl 50000, systemLocked) present; GL 50000 parent present.
  - Zero references to the old CashFlowTransaction_* tables in
    server.js (only the CashFlowTransactionID column inside the new
    per-bank tables).
  - BottomTray has separate 'report' and 'cash-flow' entries.
  - Cash Flow classification: revenue = 40000-49999, asset/liability =
    50000-50999, so GL 50000 is excluded from Total Revenue by
    construction. After adding the 50000 mapping row (see §5), the
    page shows 50000 Resident_Credit Sep $200.00 in ASSET / LIABILITY
    (screenshot rick-test-cashflow-gl50000_20260911.png), and Total
    Revenue stays $1500 (40000 $1000 + 40020 $500).

4. SETUP FIXES I HAD TO APPLY IN DEV (please include in migrations)

  (a) DuesProgramming.RevenueGLNumber was NULL for both dues types,
      which makes every APR post fail 400. Set annual->40000,
      special->40020.
  (b) No CashFlowLedgerMaster for bank 201/FY2026. Created one
      (Opening 200,088.00). (Note: in your current APR code both SA
      and AD dollars post to the annual receiving bank 101 — see §6a
      — so 201 was not actually touched, but the ledger now exists.)
  (c) CashFlowLedgerMaster.BankIDNumber was tinyint(4) (max 127), so
      ANY bank 201+ ledger insert fails ('Out of range'). Widened to
      INT in dev. Your establishCashFlowLedgerMaster would hit this
      for every bank above 127.
  (d) AssessmentPaymentRegister.PaymentType enum lacked
      'ResidentCredit' (prod hoamanager26 already has it) — T3/T4
      failed with 'Data truncated' until extended.
  (e) GLAccounts had zero 500xx rows, so GL 50000 could not appear on
      the Cash Flow page. Inserted the 50000 parent + 50001-50099
      range rows from your frontend seed data.

5. OBSERVATIONS (not failures — for your confirmation)

  (a) SA dollars post to bank 101 (the annual 'Resident Payment
      Receiving Bank'), not to DuesProgramming.specialAssessment's
      bank 201 — only the GL (40020) differs. This matches your
      'single Receiving Bank, GL tells what the money is' design, but
      it means specialAssessment.DepositBankAccountID is currently
      unused in this path. Confirm intended.
  (b) APR transaction numbers still embed Chicago time
      (e.g. APR091126-06321372 at 11:32 UTC) — expected, since item 8
      scoped the timezone change to CR only. DP/APR pass still pending.
  (c) Live APR credit updates ResidentMaster.ResidentCreditBalance
      (200.00 verified) and writes the APR ResidentCredit row, but does
      NOT append to ResidentCreditLedger (that table is only written
      by the void/replay recalc). Confirm intended.
  (d) Manual checks are created with DateCheckIssued = NULL (only
      auto-withdrawal stamps today) while clear requires an issue
      date — the current UI cannot clear a manual check. Suggest
      stamping the issue date on print or on entry.
  (e) Cash Flow bank dropdown lists only 101/201 although 301/401/
      451/501 exist; banks without a ledger render silent zeros.
      Suggest a 'no ledger for this bank/year' notice.

Screenshots (public/workflows, also served on :8899):
  rick-test-apr-form_20260911.png, rick-test-cashflow-gl50000_20260911.png,
  rick-test-bottomtray_20260911.png
Test data left in hoamanager26_dev as evidence: resident 009991 + 6 APR
rows (4 txns) + 6 CashFlow_BankID_101 rows + ledgers 101/201.

Thanks,
```

---

## Local details (not for Rick)

- APR endpoint: `POST /api/apr/enter-payment` (server.js:5924). Body used: `{residentAccountId, specialAssessmentPayment|annualDuesPayment, paymentDate, operatorId}`.
- Txn numbers embed Chicago time (MySQL NOW) — out of scope per item 8.
- Accidental $10 credits posted to 001008 (txn 56) and RES-0723 (txn 57) during guard probing were fully reverted (APR rows 56/57 + CF rows 9/10 deleted, balances -10 each, ledger 101 -20 → back to 146,712.66).
- Commit 6756d83 (CR timezone) is local-only, not pushed.
- UI verified in demo browser (NoMachine :1001, http://localhost:5173): APR form opens, Cash Flow bank 101 shows 50000/Sep $200 in ASSET/LIABILITY, BottomTray lists Report + Cash Flow separately.
