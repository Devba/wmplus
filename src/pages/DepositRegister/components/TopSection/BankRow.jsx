
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../../config/api';
function BankRow({ onBankChange, balanceRefreshKey }) {
 const [bankBalance, setBankBalance] = useState(0); 
 const [selectedBankId, setSelectedBankId] = useState(101);
 const [banks, setBanks] = useState([]);

useEffect(() => {
  async function loadBanks() {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/banking`);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const activeBanks = Array.isArray(data?.banks)
        ? data.banks.filter((bank) => String(bank.active || 'Y').toUpperCase() === 'Y')
        : [];

      setBanks(activeBanks);
    } catch (error) {
      console.error('Error loading DP bank list:', error);
    }
  }

  loadBanks();
}, []);


useEffect(() => {
  async function loadBankBalance() {
    try {
      const response = await fetch(
      `${API_BASE_URL}/cash-flow?bankId=${selectedBankId}&fiscalYear=${new Date().getFullYear()}`
      );

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      setBankBalance(Number(data?.ledger?.currentBalance) || 0);
    } catch (error) {
      console.error('Error loading DP bank balance:', error);
    }
  }

  loadBankBalance();
}, [selectedBankId, balanceRefreshKey]);

  return (
    <div className="dp-bank-row">
      <span className="dp-bank-label">Bank Balances:</span>

      <label className="dp-bank-acct-label">Bank Acct:</label>

      <select
        className="dp-bank-select"
        id="dpBankAcct"
        onChange={(event) => {
          const bankId = Number(event.target.value);
          setSelectedBankId(bankId);
          onBankChange?.(bankId);
        }}
      >
                {banks.map((bank) => (
          <option key={bank.id} value={Number(bank.bankId)}>
            {`${bank.bankType} ${bank.bankName} - ${bank.bankId}`}
          </option>
        ))}
      </select>

      <label className="dp-balance-label">Balance:</label>

      <input
        className="dp-balance-input"
        id="dpBankBalance"
        value={bankBalance.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        })}
        readOnly
      />
    </div>
  );
}

export default BankRow;