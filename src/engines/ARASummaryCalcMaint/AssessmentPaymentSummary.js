


// ============================================================
// W M+ ASSESSMENT PAYMENT SUMMARY ENGINE
// File: AssessmentPaymentSummary.js
// ============================================================
//
// PURPOSE:
// Calculates and maintains the AssessmentPaymentSummary data
// used by W M+.
//
// RESPONSIBILITIES:
// - Use authoritative server/database assessment data.
// - Apply Annual Dues calculation and maintenance rules.
// - Apply Special Assessment calculation and maintenance rules.
// - Apply applicable payment, credit, refund, fine, and late-fee
//   effects to AssessmentPaymentSummary.
// - Keep AssessmentPaymentSummary synchronized with the
//   authoritative W M+ transaction and assessment data.
//
// ARCHITECTURE RULE:
// This engine determines and maintains MONEY/BALANCE values.
//
// It does NOT:
// - perform daily delinquency monitoring;
// - determine reminder or collection timing;
// - perform DailyMonitor functions;
// - contain React/UI calculation logic.
//
// Daily monitoring belongs in:
// src/engines/ARASummaryCalcMaint/DailyMonitor.js
//
// React displays the results. It is not the source of truth.
//
// ============================================================

