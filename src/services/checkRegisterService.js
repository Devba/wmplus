import { API_BASE_URL, setConnectionStatus } from '../config/api.js';
import checkRegisterSampleData from '../pages/CheckRegister/data/checkRegisterSampleData.js';

export async function fetchChecks() {
  try {
    const response = await fetch(`${API_BASE_URL}/check-register`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      setConnectionStatus(false);
      return data.map(c => ({
        checkNo: c.check_number,
        transactionNo: c.check_txn_num,
        glAccountName: c.gl_name,
        amount: c.amount,
        dateIssued: c.date_issued,
        dateCleared: c.date_cleared,
        glNo: c.gl_number,
        vendorOrResidentAcct: c.payee_id,
        invoiceNo: c.invoice_num,
        invoiceDate: c.invoice_date,
        invoiceAmt: c.invoice_amount,
        noteNotation: c.note,
        bankAccount: c.bank_account,
        status: c.status,
        ...c
      }));
    }
    setConnectionStatus(true);
    return checkRegisterSampleData;
  } catch (err) {
    console.warn('Could not fetch checks from API, using sample data:', err);
    setConnectionStatus(true);
    return checkRegisterSampleData;
  }
}

