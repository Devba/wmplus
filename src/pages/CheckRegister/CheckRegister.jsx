// =====================================================
// 2026-07-09
// CHECK REGISTER
// PAGE STATE OWNER
// =====================================================

import { useEffect, useMemo, useState } from 'react';

import './CheckRegister.css';

import { API_BASE_URL } from '../../config/api';

import BodyBox from './components/BodyBox/BodyBox';
import TopSection from './components/TopSection/TopSection';

import checkRegisterSampleData from './data/checkRegisterSampleData';

function CheckRegister({ onSelectPage }) {
  const [checkRows, setCheckRows] = useState([]);


useEffect(() => {
  async function loadCheckRegister() {
    try {
      const response = await fetch(`${API_BASE_URL}/check-register`);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const rows = await response.json();

const mappedRows = rows.map((row) => ({
  checkNo: row.check_number,
  payeeName: row.payee_name,
  amount: row.amount,
  dateIssued: row.date_issued,
  dateCleared:
  row.status === 'Voided'
    ? 'VOID'
    : row.date_cleared,

monthCleared:
  row.status === 'Voided'
    ? 'VOID'
    : row.month_cleared,
  glAccount: row.gl_name,
  vendorOrResidentAcct: row.payee_id,
  vendorInvoiceNo: row.invoice_num,
  vendorInvoiceDate: row.invoice_date,
  vendorInvoiceAmount: row.invoice_amount,
  checkNotation: row.note,
  bankAcct: row.bank_account,
  checkAllowed: row.check_allowed,
  status: row.status,
  glNo: row.gl_number,
  transactionNo: row.check_txn_num,
  escrowFlag: row.escrow_flag,
  bankAccount: row.bank_account_display
}));

setCheckRows(mappedRows);



    } catch (error) {
      console.error('Error loading Check Register:', error);
    }
  }

  loadCheckRegister();
}, []);


 

  const [
    vendorResidentAccountFilter,
    setVendorResidentAccountFilter
  ] = useState('');

  const displayedCheckRows = useMemo(() => {
    if (!vendorResidentAccountFilter) {
      return checkRows;
    }

    return checkRows.filter((row) => {
      const rowAccount = String(
        row.vendorOrResidentAcct || ''
      ).trim();

      return (
        rowAccount ===
        String(vendorResidentAccountFilter)
      );
    });
  }, [
    checkRows,
    vendorResidentAccountFilter
  ]);

  const handleAddCheck = (newCheck) => {
    setCheckRows((currentRows) => [
      ...currentRows,
      newCheck
    ]);
  };

  const handleApplyVendorResidentFilter = (
    request
  ) => {
    const accountNumber = String(
      request?.accountNumber || ''
    ).trim();

    if (!accountNumber) {
      window.alert(
        'No resident or vendor account was selected.'
      );
      return;
    }

    setVendorResidentAccountFilter(
      accountNumber
    );
  };

  const handleResetVendorResidentFilter = () => {
    setVendorResidentAccountFilter('');
  };

  return (
    <div className="checkreg-page">
      <div className="checkreg-shell">
        <div className="checkreg-fixed">
          <TopSection
            onSelectPage={onSelectPage}
            onAddCheck={handleAddCheck}
            checkRows={checkRows}
            onApplyVendorResidentFilter={
              handleApplyVendorResidentFilter
            }
            onResetVendorResidentFilter={
              handleResetVendorResidentFilter
            }
          />
        </div>

        <BodyBox
          checkRows={displayedCheckRows}
        />
      </div>
    </div>
  );
}

export default CheckRegister;