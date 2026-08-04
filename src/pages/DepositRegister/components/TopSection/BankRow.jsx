

function BankRow() {
  return (
    <div className="dp-bank-row">
      <span className="dp-bank-label">Bank Balances:</span>

      <label className="dp-bank-acct-label">Bank Acct:</label>

      <select
        className="dp-bank-select"
        id="dpBankAcct"
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

      <label className="dp-balance-label">Balance:</label>

      <input
        className="dp-balance-input"
        id="dpBankBalance"
        value="$24,999.99"
        readOnly
      />
    </div>
  );
}

export default BankRow;