





function BankRow() {
  return (
    <div className="bankdc-bank-row">
      <div className="bankdc-bank-label">
        Bank Acct:
      </div>

      <select
        className="bankdc-bank-select"
        defaultValue="Operating Bank - 101"
      >
        <option value="Operating Bank - 101">
          Operating Bank - 101
        </option>
      </select>

      <div className="bankdc-balance-label">
        Current Balance:
      </div>

      <div className="bankdc-balance-value">
        $ 0.00
      </div>
    </div>
  );
}

export default BankRow;