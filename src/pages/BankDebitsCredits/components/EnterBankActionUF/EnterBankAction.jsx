






import { useEffect, useState } from 'react';
import './EnterBankActionUF.css';
import { API_BASE_URL } from '../../../../config/api';

function EnterBankAction({ onClose }) {
  const [banks, setBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [glAccounts, setGLAccounts] = useState([]);
  const [selectedGLNumber, setSelectedGLNumber] = useState('');

  useEffect(() => {
    async function loadBanks() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/settings/banking`
        );

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();

        const activeBanks = Array.isArray(data?.banks)
          ? data.banks.filter(
              (bank) =>
                String(bank.active || 'Y').toUpperCase() === 'Y'
            )
          : [];

        setBanks(activeBanks);
      } catch (error) {
        console.error(
          'Error loading Bank Debits & Credits bank list:',
          error
        );
      }
    }

    loadBanks();
  }, []); 
  
  useEffect(() => {
  async function loadBDCGLAccounts() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/gl-options?screen=BDC`
      );

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const rows = Array.isArray(data?.glAccounts)
        ? data.glAccounts
        : [];

      const selectableRows = rows.filter(
        (gl) =>
          String(gl.pc || '').toUpperCase() === 'C' &&
          /^\d+$/.test(String(gl.glNumber || '')) &&
          String(gl.parentGl || '').trim() !== ''
      );

      setGLAccounts(selectableRows);
    } catch (error) {
      console.error(
        'Error loading Bank Debits & Credits GL options:',
        error
      );

      setGLAccounts([]);
    }
  }

  loadBDCGLAccounts();
}, []);

  return (
    <div className="bankdc-enter-overlay">
      <div className="bankdc-enter-uf">

        <button
          type="button"
          className="bankdc-enter-close"
          onClick={onClose}
        >
          X
        </button>

        <div className="bankdc-enter-title">
          BANK DEBIT &amp; CREDIT ENTRY:
        </div>

        <div className="bankdc-enter-amount-label">
          AMT $$
        </div>

        <input
          type="text"
          className="bankdc-enter-amount"
        />

        <div className="bankdc-enter-bank-label">
          BANK ACCOUNT:
        </div>

        <select
        className="bankdc-enter-bank-select"
        value={selectedBankId}
        onChange={(event) =>
            setSelectedBankId(event.target.value)
        }
        >
        <option value="">Select Bank Account</option>

        {banks.map((bank) => (
            <option
            key={bank.id}
            value={Number(bank.bankId)}
            >
            {`${bank.bankType} ${bank.bankName} - ${bank.bankId}`}
            </option>
        ))}
        </select>

        <div className="bankdc-enter-gl-label">
          G/L ACCOUNT:
        </div>

        <select
        className="bankdc-enter-gl-select"
        value={selectedGLNumber}
        onChange={(event) =>
            setSelectedGLNumber(event.target.value)
        }
        >
        <option value="">Select G/L Account</option>

        {glAccounts.map((gl) => (
            <option
            key={gl.id}
            value={gl.glNumber}
            >
            {`${gl.glNumber} - ${gl.glName}`}
            </option>
        ))}
        </select>

        <div className="bankdc-enter-date-label">
          DATE $$ DEBITED /<br />
          CREDITED
        </div>

        <input
          type="text"
          className="bankdc-enter-date"
          placeholder="mm/dd/yyyy"
        />

        <div className="bankdc-enter-notation-label">
          ENTRY NOTATION
        </div>

        <textarea
          className="bankdc-enter-notation"
        />

        <button
          type="button"
          className="bankdc-enter-submit"
        >
          ENTER DEBIT / CREDIT DATA
        </button>

      </div>
    </div>
  );
}

export default EnterBankAction;