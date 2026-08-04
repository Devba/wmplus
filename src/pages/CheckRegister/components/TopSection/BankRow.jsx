function BankRow() {
  return (
    <div className="cr-bank-row">
      <span className="cr-bank-label">Bank Balances:</span>

      <label className="cr-bank-acct-label">Bank Acct:</label>
      <select className="cr-bank-select">
        <option>Operating Acct</option>
        <option>Capital Acct</option>
        <option>Money Market Acct</option>
      </select>

      <label className="cr-balance-label">Balance:</label>
      <input className="cr-balance-input" value="$24,999.99" readOnly />
    </div>
  );
}

export default BankRow;