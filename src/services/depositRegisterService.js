import { API_BASE_URL, setConnectionStatus } from '../config/api.js';
import depositRegisterSampleData from '../pages/DepositRegister/data/depositRegisterSampleData.js';

export async function fetchDeposits() {
  try {
    const response = await fetch(`${API_BASE_URL}/deposit-register`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      setConnectionStatus(false);
      return data.map(d => ({
        transaction: d.deposit_txn_num,
        depositorName: d.payer_name,
        amount: d.amount,
        bankAccountName: d.bank_account_name,
        glAccountName: d.gl_name,
        glNo: d.gl_number,
        dateDeposited: d.date_deposited,
        dateCleared: d.date_cleared,
        resOrVendAccountNo: d.resident_id || d.vendor_id,
        noteNotation: d.note,
        status: d.status,
        ...d
      }));
    }
    setConnectionStatus(true);
    return depositRegisterSampleData;
  } catch (err) {
    console.warn('Could not fetch deposits from API, using sample data:', err);
    setConnectionStatus(true);
    return depositRegisterSampleData;
  }
}

