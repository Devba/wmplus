



// ============================================================
// W M+ DAILY ASSESSMENT MONITORING ENGINE
// File: DailyMonitor.js
// ============================================================
//
// PURPOSE:
// Performs the scheduled daily monitoring of resident
// assessment obligations.
//
// RESPONSIBILITIES:
// - Review Annual Dues and Special Assessment due dates.
// - Identify approaching-due and past-due obligations.
// - Apply the approved reminder/delinquency monitoring rules.
// - Update/age applicable AccountsReceivableAging (ARA)
//   information.
// - Determine applicable monitoring/collection status.
//
// ARCHITECTURE RULE:
// This engine MONITORS obligations and due-date status.
//
// It does NOT:
// - calculate what a resident owes;
// - calculate AssessmentPaymentSummary money/balance values;
// - replace the AssessmentPaymentSummary engine;
// - contain React/UI calculation logic.
//
// Money/balance calculation and maintenance belongs in:
// src/engines/ARASummaryCalcMaint/AssessmentPaymentSummary.js
//
// React displays the results. It is not the source of truth.
//
// ============================================================

