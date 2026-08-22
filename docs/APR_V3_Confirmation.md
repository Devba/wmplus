# Confirmación a Rick & Hal — V3 refinamientos aceptados

**Asunto:** Re: V3 refinements — Unified Assessment Register confirmation

---

Rick & Hal,

Confirmed — the unified `AssessmentRegister` will operate as the **incrementally maintained** model. A normal APR posting updates only the affected resident's register + period record; it will never trigger a full recalculation or reconstruction from APR history during transaction processing or when screens/reports open. A Recalculate/Rebuild utility will exist strictly for reconciliation, repair, and audit, invoked on demand.

We'll also carry the HOA/Tenant + FiscalYear identity on the register records (MgtCoClientID + HOALicenseNumber + ResidentAccountID + FiscalYear + Frequency) so successive fiscal years and different HOA contexts stay unambiguous. The DDL draft has been updated accordingly (unique key on MgtCoClientID, HOALicenseNumber, ResidentAccountID, CurrentFiscalYearBegins, Frequency, for both `AssessmentRegister` and `AssessmentRegisterPeriod`, with compatibility views pivoting on the same identity).

For Phase 1, we'll build the core Cash Accounting chain: CR → Cash Flow, DP → Cash Flow, and APR → Assessment Register(s) → Cash Flow, with incremental posting and posting-control (CashFlowPostingControl/CashFlowRowControl), so the transactions are verifiable directly in the database before handing to Alex. The electronic-payment engine follows in Phase 2.

We're aligned. Please proceed with the coordinated schema/API design.

— José

---

*Ref. docs/APR_DDL_draft.sql rev. 2026-08-21 (identidad refinada + principio incremental + Fase 1 Cash Flow).*
