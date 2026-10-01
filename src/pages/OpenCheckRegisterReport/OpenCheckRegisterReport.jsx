




import React from 'react';
import './OpenCheckRegisterReport.css';

const OCR_COLUMNS = [
  { key: 'glNumber', label: 'GL#', width: 70 },
  { key: 'glName', label: 'GL# NAME', width: 190 },
  { key: 'checkNumber', label: 'CHK#', width: 70 },
  { key: 'date', label: 'DATE', width: 90 },
  { key: 'vendorName', label: 'VENDOR NAME', width: 230 },
  { key: 'amount', label: '$$ AMT', width: 90 },
  {
    key: 'glYtdActual',
    label: <>GL# YTD<br />ACTUAL<br />EXPENSES</>,
    width: 105
  },
  {
    key: 'totalYtdExpenses',
    label: <>TOTAL<br />YTD<br />EXPENSES</>,
    width: 105
  },
  {
    key: 'budgetedYtd',
    label: <>BUDGETED<br />EXPENSES<br />YTD</>,
    width: 115
  },
  {
    key: 'percentYtdBudget',
    label: <>AS %<br />OF YTD<br />BUDGET</>,
    width: 100
  },
  {
    key: 'percentAnnualBudget',
    label: <>AS % OF<br />ANNUAL<br />BUDGET</>,
    width: 105
  },
  {
    key: 'annualBudget',
    label: <>ANNUAL<br />BUDGET</>,
    width: 105
  }
];

const BLANK_ROWS = Array.from({ length: 14 });

export default function OpenCheckRegisterReport({ onSelectPage }) {
  return (
    <div className="ocr-page">
      <div className="ocr-shell">

        {/* =====================================================
            TOP SECTION
            Every item has its own positioning class.
        ====================================================== */}
        <div className="ocr-topsection">

          <div className="ocr-hoa-name">
            Frontier Ranch POA
          </div>

          <div className="ocr-report-title">
            OPEN CHECK TO EXPENSE ANALYSIS REPORT:
          </div>

          <div className="ocr-report-date">
            09/30/2026
          </div>

          <button
            type="button"
            className="ocr-btn ocr-run-report-btn"
          >
            Run Report
          </button>

          <button
            type="button"
            className="ocr-nav-button ocr-back-nav-button"
            onClick={() => onSelectPage('master-navigation-panel')}
            >
            BACK TO NAV PANEL
            </button>

            <button
            type="button"
            className="ocr-nav-button ocr-back-cr-button"
            onClick={() => onSelectPage('check-register')}
            >
            BACK TO CHECK REGISTER
            </button>

          <div className="ocr-report-as-of">
            Report as of:
          </div>

          {/* BANK SELECTOR */}

<div className="ocr-bank-label">
  Bank Acct:
</div>

<select className="ocr-bank-select" defaultValue="101">
  <option value="101">Operating Bank - 101</option>
</select>


{/* SELECTED BANK SUMMARY */}

<div className="ocr-bank-balance-heading">
  Bank Balance
</div>

<div className="ocr-open-checks-heading">
  Open &amp; Issued Check $
</div>

<div className="ocr-available-balance-heading">
  Bank Balance w/Open Checks
</div>

<div className="ocr-number-open-checks-heading">
  # Of Open Checks
</div>


<div className="ocr-selected-bank-dollar">
  $
</div>

<div className="ocr-selected-bank-balance">
  35,683.86
</div>

<div className="ocr-selected-open-dollar">
  $
</div>

<div className="ocr-selected-open-checks">
  -
</div>

<div className="ocr-selected-available-dollar">
  $
</div>

<div className="ocr-selected-available-balance">
  35,683.86
</div>

<div className="ocr-selected-check-count">
  0
</div>

          <div className="ocr-blue-divider" />

        </div>

        {/* =====================================================
            REPORT BODY
        ====================================================== */}
        <div className="ocr-bodybox">
          <div className="ocr-table-scroll">

            <table className="ocr-table">

              <colgroup>
                {OCR_COLUMNS.map((column) => (
                  <col
                    key={column.key}
                    style={{ width: `${column.width}px` }}
                  />
                ))}
              </colgroup>

              <thead>
                <tr>
                  {OCR_COLUMNS.map((column) => (
                    <th key={column.key}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {BLANK_ROWS.map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {OCR_COLUMNS.map((column) => (
                      <td key={column.key}>
                        &nbsp;
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        </div>

      </div>
    </div>
  );
}

