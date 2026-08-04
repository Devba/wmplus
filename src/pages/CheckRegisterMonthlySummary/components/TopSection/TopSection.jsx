


function TopSection({ onSelectPage }) {
  return (
    <>
      <div className="cr-bank-row">
        <span className="cr-bank-label">Bank Balances:</span>

        <span className="cr-bank-acct-label">Bank Acct:</span>

        <select className="cr-bank-select" defaultValue="Operating Acct">
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

        <span className="cr-balance-label">Balance:</span>

        <input
          className="cr-balance-input"
          type="text"
          value="$24,999.99"
          readOnly
        />
      </div>

      <div className="crms-summary-head">
        <div className="crms-summary-title">
          GENERAL LEDGER CHECK REGISTER MONTHLY SUMMARY
        </div>

        <div className="crms-asof-line">
          <span className="crms-asof-label">CHECK SUMMARY AS OF:</span>
          <span className="crms-asof-value">04/22/2026</span>
          <span className="crms-asof-value">09:25 AM</span>
        </div>

        <div className="crms-total-line">
          <span className="crms-total-label">Monthly Check $$ Total:</span>
          <span className="crms-total-value">$ 0.00</span>
        </div>
      </div>

      <div className="checkreg-actions">
        <button
           type="button"
              className="checkreg-btn blueText"
              onClick={() => onSelectPage('check-register')}
        >
          BACK TO CHECK REGISTER
        </button>
      </div>
    </>
  );
}

export default TopSection;