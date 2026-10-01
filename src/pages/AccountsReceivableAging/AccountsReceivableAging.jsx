





import './AccountsReceivableAging.css';

const ARA_COLUMNS = [
  { key: 'name', label: 'HomeOwnerName', width: 195, color: 'yellow' },
  { key: 'acct', label: 'Account#', width: 65, color: 'yellow' },
  { key: 'invoice', label: 'Invoice#', width: 88, color: 'yellow' },
  { key: 'invoiceDate', label: 'InvoiceDate', width: 92, color: 'yellow' },
  { key: 'invoiceAmount', label: 'Invoice$$', width: 103, color: 'yellow' },
  { key: 'paidStatus', label: <>INVOICE<br />PAID /<br />BAL DUE /<br />VOIDED</>, width: 70, color: 'yellow' },
  { key: 'amountPaid', label: <>Amount<br />Paid / WO</>, width: 92, color: 'yellow' },
  { key: 'balanceDue', label: <>Balance<br />Due $$$</>, width: 82, color: 'yellow' },

  { key: 'age030', label: '0-30', width: 74, color: 'aging' },
  { key: 'age3160', label: '31-60', width: 74, color: 'aging' },
  { key: 'age6190', label: '61-90', width: 74, color: 'aging' },
  { key: 'age91119', label: '91-119', width: 80, color: 'aging' },
  { key: 'age120150', label: '120-150', width: 82, color: 'aging' },
  { key: 'age150', label: '150+', width: 74, color: 'aging' },
  { key: 'totalDue', label: 'TotalDue', width: 82, color: 'aging' },

  { key: 'letterCode', label: <>Letter<br />Code</>, width: 64, color: 'letter' },
  { key: 'daysPastDue', label: <># Of<br />Days<br />Past Due</>, width: 62, color: 'aging' },
  { key: 'notes', label: 'InvoiceNotes', width: 320, color: 'yellow' },

  { key: 'writeOff', label: <>Write<br />Off<br />CODE -<br />WO</>, width: 62, color: 'yellow' },
  { key: 'gl', label: <>Inv<br />GL#</>, width: 70, color: 'yellow' },
  { key: 'paidVoidDate', label: <>Inv<br />Paid /<br />Void<br />Date</>, width: 88, color: 'yellow' },
  { key: 'protest', label: <>INVOICE<br />UNDER<br />PROTEST</>, width: 72, color: 'yellow' },
  { key: 'depositTxn', label: <>DEPOSIT<br />TRANSACTION<br />#</>, width: 138, color: 'yellow' },
  { key: 'violationTxn', label: <>Violation<br />TRANSACTION<br />#</>, width: 122, color: 'yellow' },
  { key: 'creditPayment', label: <>RESIDENT<br />AR - CREDIT<br />$$ PAY'MT</>, width: 96, color: 'yellow' },
  { key: 'monthPaid', label: <>MONTH<br />INV<br />PAID</>, width: 62, color: 'yellow' },
  { key: 'arrearsDueDate', label: <>LATEST<br />ARREARS<br />PAYMENT<br />DUE DATE</>, width: 82, color: 'yellow' },
  { key: 'assessmentDueDate', label: <>LATEST<br />ASSES'MT<br />PAYMENT<br />DUE DATE</>, width: 90, color: 'yellow' },

  { key: 'historicEscrow', label: <>COPIED<br />TO<br />HISTORIC<br />ESCROW</>, width: 82, color: 'plain' },
  { key: 'escrowCredit', label: <>RESIDENT<br />AR<br />ESCROW<br />CREDIT $$<br />PAY'MT</>, width: 92, color: 'plain' }
];

const BLANK_ROWS = Array.from({ length: 12 });

function AccountsReceivableAging() {
  return (
    <div className="ara-page">
      <div className="ara-shell">

        <div className="ara-topsection">
          <div className="ara-top-left">
            <div className="ara-hoa-name">Frontier Ranch POA</div>

            <div className="ara-total-receivable-label">
              TOTAL RECEIVABLE:
            </div>
            <div className="ara-total-receivable-value">$0.00</div>

            <div className="ara-today-label">today's date:</div>
            <div className="ara-today-value">09/30/2026</div>

            <div className="ara-current-ar">Current Accounts Receivable</div>
          </div>

          <div className="ara-command-area">
            <div className="ara-command-row">
              <button className="ara-btn ara-blue ara-resident-filter-btn">RESIDENT FILTER</button>
              <button className="ara-btn ara-blue ara-reset-filter-btn">RESET FILTER</button>

              <div className="ara-aged-label">
                TOTAL&nbsp;&nbsp;AGED&nbsp;&nbsp;ACCOUNTS RECEIVABLE:
              </div>
              <div className="ara-aged-arrow">➜</div>
            </div>

            <div className="ara-command-row ara-command-row-two">
              <button className="ara-btn ara-red">VOID INVOICE</button>
              <button className="ara-btn ara-red ara-wide">Invoice Protest Control</button>
              <button className="ara-btn ara-red ara-balance-btn">
                Change Inv. Bal Due $ AMT
              </button>
            </div>

            <div className="ara-summary-line">

            <div className="ara-total-invoice-group">
                <span>Total Invoice $$</span>
                <span className="ara-summary-money">$&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
            </div>

            <div className="ara-total-balance-group">
                <span>Total Invoice $$ Bal Due:</span>
                <span className="ara-summary-money">$&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
            </div>

            </div>
          </div>

          <div className="ara-aging-summary">
            <div className="ara-aging-box">
              <strong>0-30</strong>
              <span>$0.00</span>
            </div>
            <div className="ara-aging-box">
              <strong>31-60</strong>
              <span>$0.00</span>
            </div>
            <div className="ara-aging-box">
              <strong>61-90</strong>
              <span>$0.00</span>
            </div>
            <div className="ara-aging-box">
              <strong>91-119</strong>
              <span>$0.00</span>
            </div>
            <div className="ara-aging-box">
              <strong>120-150</strong>
              <span>$0.00</span>
            </div>
            <div className="ara-aging-box">
              <strong>150+</strong>
              <span>$0.00</span>
            </div>
            <div className="ara-aging-box ara-total-due-box">
              <strong>Total Due</strong>
              <span>$0.00</span>
            </div>

            <button className="ara-back-btn">BACK TO NAV PANEL</button>
            <button className="ara-video-btn">AR Aging Instruction Video</button>
          </div>
        </div>

        <div className="ara-bodybox">
          <div className="ara-table-scroll">
            <table className="ara-table">
              <colgroup>
                {ARA_COLUMNS.map((column) => (
                  <col key={column.key} style={{ width: `${column.width}px` }} />
                ))}
              </colgroup>

              <thead>
                <tr>
                  {ARA_COLUMNS.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {BLANK_ROWS.map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {ARA_COLUMNS.map((column) => (
                      <td
                        key={column.key}
                        className={`ara-cell-${column.color}`}
                      >
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

export default AccountsReceivableAging;