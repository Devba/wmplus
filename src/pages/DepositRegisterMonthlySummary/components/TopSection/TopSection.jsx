



function TopSection({ onSelectPage }) {
  return (
    <>
      <div className="dp-bank-row">
            <span className="dp-bank-label">Bank Balances:</span>
            <span className="dp-bank-acct-label">Bank Acct:</span>

        <select
          className="dp-bank-select"
          defaultValue="Operating Acct"
        >
          <option>Operating Acct</option>
          <option>Capital Acct</option>
          <option>Money Market Acct</option>
          <option>Escrow Acct</option>
          <option>Savings Acct</option>
          <option>CD#1 Acct</option>
          <option>CD#2 Acct</option>
          <option>CD#3 Acct</option>
          <option>CD#4 Acct</option>
          <option>CD#5 Acct</option>
        </select>

        <span className="dp-balance-label">Balance:</span>

        <input
          className="dp-balance-input"
          type="text"
          value="$24,999.99"
          readOnly
        />
      </div>

      <div className="dpms-summary-head">
        <div className="dpms-summary-title">
          GENERAL LEDGER DEPOSIT REGISTER MONTHLY SUMMARY
        </div>

        <div className="dpms-asof-line">
          <span className="dpms-asof-label">
            DEPOSIT SUMMARY AS OF:
          </span>

          <span className="dpms-asof-value">
            04/22/2026
          </span>

          <span className="dpms-asof-value">
            10:10 AM
          </span>
        </div>

        <div className="dpms-total-line">
          <span className="dpms-total-label">
            Monthly Deposit $$ Total:
          </span>

          <span className="dpms-total-value">
            $ 0.00
          </span>
        </div>
      </div>

      <div className="depreg-button-row">
  <button
      type="button"
      className="depreg-btn-back"
      onClick={() => onSelectPage('deposit-register')}
    >
      BACK TO DEPOSIT REGISTER
    </button>
      </div>
    </>
  );
}

export default TopSection;