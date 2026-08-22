# Respuesta a Rick & Hal — V3 APR Architecture Review

**Asunto:** Re: W M+ Assessment Payment Register (APR) and Electronic Payment Architecture Review — V3

---

Rick & Hal,

I've reviewed V3 and we agree with the proposed architecture. All seven of José's recommendations are endorsed: APR logic on the server, `AssessmentPaymentRegister` as the transaction-level source of truth, server-assigned transaction numbers, server-side allocation/YTD, atomic posting that also updates `ResidentMaster`, bank/Cash-Flow destination by rule, proper `begin/commit/rollback`, and server-side void/reversal. Good.

On the assessment-register design (your Section 13), I'd like to propose one refinement that also closes the Semi-Annual gap from review item #1:

**Unified `AssessmentRegister` + compatibility views.** Rather than four frequency-specific register tables (Monthly / Semi-Annual / Quarterly / Yearly), we'll use:
- `AssessmentRegister` — one row per `(ResidentAccountID, Frequency)`, holding the running totals (YTD, due, balance, credit, Special Assessment, rates, invoice #, fiscal year).
- `AssessmentRegisterPeriod` — a normalized child table, one row per period (`PeriodNumber`, `PeriodAmount`), so monthly = 12 rows, quarterly = 4, semi-annual = 2, annual = 1.
- Compatibility **views** named exactly `Monthly_AssmtRegister`, `QTRLY_AssmtRegister`, `YRLY_AssmtRegister` (and a new `SEMI_AssmtRegister`) that pivot `AssessmentRegisterPeriod` back into the legacy `FirstMonthlyPayment…TwelfthMonthlyPayment` column shape your reports expect.

This removes the need for a separate Semi-Annual base table and avoids duplicating ~40 near-identical columns across three tables. Since the existing register tables are currently empty, there is no data migration impact. Please confirm you're comfortable moving the legacy per-frequency layout into this unified model (the views preserve the legacy column names for any reports).

A few other design items from Section 13 we should settle before DDL:

1. **Resident credit representation.** There is no current "resident credit balance" column in `ResidentMaster` (only `PriorYearCredit`). We'll add `ResidentCreditBalance` so credit received vs. used/refunded is tracked separately from HOA operating funds, per Section 9.
2. **Banking configuration.** Please confirm Settings → Banking can designate the Annual-Dues bank **and** the eligible Special-Assessment bank(s), since Section 11 requires the SA bank to be selected/validated at APR posting.
3. **Single-type-per-APR-row validation.** We'll enforce server-side that Annual Dues and Special Assessment cannot post in one APR transaction (block if both amounts are present), per Section 3.
4. **Phasing.** I propose building the core APR posting first (`AssessmentPaymentRegister` + manual entry/void + basic Cash Flow), then the electronic-payment engine (`ElectronicPaymentRegister` / `ElectronicPaymentAllocation`, automatic allocation, posting-control, reconciliation) as a second phase, so the core lands without waiting on the larger scope.

If the unified model + compatibility views are acceptable, Rick can proceed with the coordinated schema/API design covering `AssessmentPaymentRegister`, `ElectronicPaymentRegister`, `ElectronicPaymentAllocation`, Cash Flow source/posting controls, and the APR Enter UF changes. We're in agreement with the direction.

— José
