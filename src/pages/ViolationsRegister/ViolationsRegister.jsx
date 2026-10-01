




import React from 'react';
import './ViolationsRegister.css';

const VR_COLUMNS = [
  { key: 'acct', label: 'ACCT #', width: 58 },
  { key: 'resident', label: 'RESIDENT NAME', width: 128 },
  { key: 'address', label: 'ADDRESS', width: 205 },
  { key: 'inspectionDate', label: <>INSPECTION<br />DATE</>, width: 82 },
  { key: 'violation', label: 'VIOLATION', width: 342 },
  { key: 'letterCode', label: <>LETTER<br />CODE</>, width: 52 },
  { key: 'warningFine', label: <>WARNING<br />OR $$ FINE</>, width: 75 },
  { key: 'fineAmount', label: <>Fine<br />Amount</>, width: 72 },
  { key: 'letterIssueDate', label: <>LETTER<br />ISSUE DATE</>, width: 82 },
  { key: 'notes', label: 'NOTES', width: 570 },

  { key: 'invoice', label: <>INVOICE<br />#</>, width: 90 },
  {
    key: 'invoiceStatus',
    label: <>INVOICE<br />PAID /<br />BALANCE DUE</>,
    width: 105
  },
  {
    key: 'thisYearsPayment',
    label: <>THIS YEARS<br />PAY'MT<br />AMOUNT</>,
    width: 95
  },
  {
    key: 'invoiceBalance',
    label: <>INVOICE<br />BALANCE</>,
    width: 88
  },
  { key: 'transaction', label: 'Transaction#', width: 125 },
  {
    key: 'invoicePaidVoidDate',
    label: <>INVOICE<br />PAID/VOID<br />DATE</>,
    width: 100
  },
  {
    key: 'previousYearPaid',
    label: <>PREV YR<br />$$ PAID<br />& $ WO's</>,
    width: 100
  }
];

const BLANK_ROWS = Array.from({ length: 14 });

export default function ViolationsRegister() {
  return (
    <div className="vr-page">
      <div className="vr-shell">

        {/* TOP SECTION */}
        <div className="vr-topsection">

          <div className="vr-hoa-name">
            Frontier Ranch POA
          </div>

          <div className="vr-title">
            RESIDENT VIOLATION REGISTER
          </div>

          <div className="vr-date-label">
            DATE:
          </div>

          <div className="vr-date-value">
            09/30/2026
          </div>

          <div className="vr-total-fines-label">
            TOTAL FINES TO DATE:
          </div>

          <div className="vr-total-fines-value">
            $&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-
          </div>

          <div className="vr-total-paid-label">
            TOTAL FINES PAID TO DATE:
          </div>

          <div className="vr-total-paid-value">
            $&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-
          </div>

          <button className="vr-btn vr-manage-btn">
            Manage Violations
          </button>

          <button className="vr-btn vr-blue vr-resident-filter-btn">
            RESIDENT FILTER
          </button>

          <button className="vr-btn vr-blue vr-reset-filter-btn">
            RESET FILTER
          </button>

          <button className="vr-btn vr-blue vr-back-btn">
            BACK TO NAV PANEL
          </button>

          <button className="vr-btn vr-red vr-video-btn">
            Violation Register Sheet Instructional Video
          </button>

        </div>

        {/* REGISTER */}
        <div className="vr-bodybox">
          <div className="vr-table-scroll">

            <table className="vr-table">

              <colgroup>
                {VR_COLUMNS.map((column) => (
                  <col
                    key={column.key}
                    style={{ width: `${column.width}px` }}
                  />
                ))}
              </colgroup>

              <thead>
                <tr>
                  {VR_COLUMNS.map((column) => (
                    <th key={column.key}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {BLANK_ROWS.map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {VR_COLUMNS.map((column) => (
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
